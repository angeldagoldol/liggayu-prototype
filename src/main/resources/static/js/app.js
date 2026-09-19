import { addStudent, ApiError, getReport } from "./api.js";
import {
  buildStudentRequest,
  formatAverage,
  formatNames,
  formatScore,
  validateStudentInput
} from "./report-utils.js";

const form = document.querySelector("#student-form");
const addButton = document.querySelector("#add-student-button");
const formError = document.querySelector("#form-error");
const formSuccess = document.querySelector("#form-success");
const reportSection = document.querySelector("#report-section");
const reportLoading = document.querySelector("#report-loading");
const reportError = document.querySelector("#report-error");
const reportEmpty = document.querySelector("#report-empty");
const reportContent = document.querySelector("#report-content");
const reportBody = document.querySelector("#student-report-body");
const recordCount = document.querySelector("#record-count");
const highestNames = document.querySelector("#highest-names");
const highestAverage = document.querySelector("#highest-average");
const lowestNames = document.querySelector("#lowest-names");
const lowestAverage = document.querySelector("#lowest-average");

const fields = {
  name: {
    input: document.querySelector("#student-name"),
    error: document.querySelector("#student-name-error")
  },
  prelim: {
    input: document.querySelector("#prelim"),
    error: document.querySelector("#prelim-error")
  },
  midterm: {
    input: document.querySelector("#midterm"),
    error: document.querySelector("#midterm-error")
  },
  finals: {
    input: document.querySelector("#finals"),
    error: document.querySelector("#finals-error")
  }
};

let isSubmitting = false;
let reportGeneration = 0;

function hideMessage(element) {
  element.textContent = "";
  element.hidden = true;
}

function showMessage(element, message) {
  element.textContent = message;
  element.hidden = false;
}

function clearFieldErrors() {
  for (const { input, error } of Object.values(fields)) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }
}

function showFieldErrors(fieldErrors) {
  let firstInvalidInput = null;

  for (const [field, message] of Object.entries(fieldErrors)) {
    const target = fields[field];
    if (!target || typeof message !== "string") {
      continue;
    }
    target.input.setAttribute("aria-invalid", "true");
    target.error.textContent = message;
    firstInvalidInput ??= target.input;
  }

  firstInvalidInput?.focus();
}

function inputValues() {
  return {
    name: fields.name.input.value,
    prelim: fields.prelim.input.value,
    midterm: fields.midterm.input.value,
    finals: fields.finals.input.value
  };
}

function appendCell(row, value, header = false) {
  const cell = document.createElement(header ? "th" : "td");
  if (header) {
    cell.scope = "row";
  }
  cell.textContent = value;
  row.append(cell);
}

function buildReportView(report) {
  const rows = document.createDocumentFragment();

  report.students.forEach((student, index) => {
    const row = document.createElement("tr");
    appendCell(row, String(index + 1), true);
    appendCell(row, student.name);
    appendCell(row, formatScore(student.prelim));
    appendCell(row, formatScore(student.midterm));
    appendCell(row, formatScore(student.finals));
    appendCell(row, formatAverage(student.average));
    rows.append(row);
  });

  const view = {
    rows,
    count: `${report.students.length} ${report.students.length === 1 ? "record" : "records"}`,
    isEmpty: report.students.length === 0
  };

  if (!view.isEmpty) {
    view.highestNames = formatNames(report.highest.names);
    view.highestAverage = formatAverage(report.highest.average);
    view.lowestNames = formatNames(report.lowest.names);
    view.lowestAverage = formatAverage(report.lowest.average);
  }

  return view;
}

function renderReport(report) {
  // Build and format the complete next view while detached. Nothing visible is
  // mutated unless every row and summary value is safe to commit.
  const view = buildReportView(report);

  reportBody.replaceChildren(view.rows);
  recordCount.textContent = view.count;
  reportEmpty.hidden = !view.isEmpty;
  reportContent.hidden = view.isEmpty;

  if (!view.isEmpty) {
    highestNames.textContent = view.highestNames;
    highestAverage.textContent = view.highestAverage;
    lowestNames.textContent = view.lowestNames;
    lowestAverage.textContent = view.lowestAverage;
  }
}

async function loadReport() {
  const loadGeneration = ++reportGeneration;
  reportSection.setAttribute("aria-busy", "true");
  reportLoading.hidden = false;
  hideMessage(reportError);

  try {
    const report = await getReport();
    if (loadGeneration !== reportGeneration) {
      return;
    }
    renderReport(report);
  } catch (error) {
    if (loadGeneration !== reportGeneration) {
      return;
    }
    const message = error instanceof ApiError
      ? error.message
      : "Student records could not be loaded. Please refresh the page.";
    showMessage(reportError, message);
  } finally {
    if (loadGeneration === reportGeneration) {
      reportLoading.hidden = true;
      reportSection.removeAttribute("aria-busy");
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) {
    return;
  }

  hideMessage(formError);
  hideMessage(formSuccess);
  clearFieldErrors();

  const rawInput = inputValues();
  const fieldErrors = validateStudentInput(rawInput);
  if (Object.keys(fieldErrors).length > 0) {
    showMessage(formError, "Please correct the highlighted fields.");
    showFieldErrors(fieldErrors);
    return;
  }

  isSubmitting = true;
  form.setAttribute("aria-busy", "true");
  addButton.disabled = true;
  addButton.textContent = "Adding Student…";

  try {
    const report = await addStudent(buildStudentRequest(rawInput));
    renderReport(report);
    reportGeneration += 1;
    hideMessage(reportError);
    reportLoading.hidden = true;
    reportSection.removeAttribute("aria-busy");
    form.reset();
    clearFieldErrors();
    showMessage(formSuccess, "Student added successfully.");
    fields.name.input.focus();
  } catch (error) {
    if (error instanceof ApiError) {
      showMessage(formError, error.message);
      showFieldErrors(error.fieldErrors);
    } else {
      showMessage(formError, "The student could not be added. Please try again.");
    }
  } finally {
    isSubmitting = false;
    form.removeAttribute("aria-busy");
    addButton.disabled = false;
    addButton.textContent = "Add Student";
  }
});

loadReport();
