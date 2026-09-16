"use strict";

// JavaScript manages the page. StudentStore.java owns the records and calculations.
const byId = (id) => document.getElementById(id);
const form = byId("student-form");
const formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let report = null;
let connected = false;
let busy = false;

function numberText(value) {
  return value === null || value === undefined ? "—" : formatter.format(value);
}

function showFeedback(message, kind = "info") {
  const feedback = byId("feedback");
  feedback.textContent = message;
  feedback.dataset.kind = kind;
  feedback.setAttribute("role", kind === "error" ? "alert" : "status");
}

function updateControls() {
  const count = report ? report.count : 0;
  const full = report && count >= report.capacity;
  byId("input-fields").disabled = !connected || busy || full;
  byId("submit-btn").disabled = !connected || busy || full;
  byId("sample-btn").disabled = !connected || busy || count > 0;
  byId("reset-btn").disabled = !connected || busy || count === 0;
  byId("print-btn").disabled = !connected || busy || count === 0;
  byId("refresh-btn").disabled = busy || location.protocol === "file:";
  form.setAttribute("aria-busy", String(busy));
}

function setConnection(isConnected) {
  connected = isConnected;
  byId("connection").dataset.state = connected ? "online" : "offline";
  byId("connection-label").textContent = connected ? "Java connected" : "Java offline";
}

// Build text nodes, never HTML from a student's name. This also protects the array view.
function cell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function badge(label, className) {
  const span = document.createElement("span");
  span.className = `badge ${className}`;
  span.textContent = label;
  return span;
}

function renderReport(snapshot) {
  report = snapshot;
  const count = snapshot.count;
  byId("student-count").textContent = String(count);
  byId("class-average").textContent = numberText(snapshot.classAverage);
  byId("highest-average").textContent = numberText(snapshot.highestAverage);
  byId("lowest-average").textContent = numberText(snapshot.lowestAverage);
  // Highest/lowest flags and means come from Java, not a second JS scoring algorithm.
  byId("highest-names").textContent = snapshot.students.filter((row) => row.highest).map((row) => row.name).join(" · ") || "No student records yet";
  byId("lowest-names").textContent = snapshot.students.filter((row) => row.lowest).map((row) => row.name).join(" · ") || "No student records yet";
  byId("report-count").textContent = `${count} ${count === 1 ? "student" : "students"}`;
  byId("array-count").textContent = `${count} occupied ${count === 1 ? "row" : "rows"}`;
  byId("capacity-detail").textContent = `${snapshot.capacity - count} array slots available`;
  byId("capacity-label").textContent = `${count} / ${snapshot.capacity}`;
  byId("capacity-meter").max = snapshot.capacity;
  byId("capacity-meter").value = count;
  byId("capacity-meter").textContent = `${count} / ${snapshot.capacity}`;

  const tableRows = document.createDocumentFragment();
  const arrayRows = document.createDocumentFragment();
  for (const student of snapshot.students) {
    const tr = document.createElement("tr");
    tr.append(cell(String(student.index + 1)), cell(student.name, "name-cell"));
    for (const score of student.scores) tr.append(cell(numberText(score)));
    tr.append(cell(numberText(student.average), "average-cell"));
    const standing = cell("", "standing-cell");
    if (student.highest) standing.append(badge("Highest", "badge-highest"));
    if (student.lowest) standing.append(badge("Lowest", "badge-lowest"));
    if (!student.highest && !student.lowest) standing.textContent = "—";
    tr.append(standing);
    tableRows.append(tr);

    const arrayRow = document.createElement("tr");
    arrayRow.append(cell(`[${student.index}]`), cell(student.name),
      cell(`[${student.scores.map(numberText).join(", ")}]`));
    arrayRows.append(arrayRow);
  }
  byId("student-rows").replaceChildren(tableRows);
  byId("array-rows").replaceChildren(arrayRows);
  byId("empty-state").hidden = count > 0;
  byId("report-table-wrap").hidden = count === 0;
  byId("array-empty").hidden = count > 0;
  byId("array-table-wrap").hidden = count === 0;
}

class ApiError extends Error {}

async function requestReport(path, method = "GET", values = null) {
  busy = true;
  updateControls();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const options = { method, cache: "no-store", signal: controller.signal, headers: {} };
    if (method === "POST") {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
      options.headers["X-ScoreDesk-Request"] = "1";
      options.body = new URLSearchParams(values || {});
    }
    const response = await fetch(path, options);
    const payload = await response.json();
    setConnection(true);
    if (!response.ok) throw new ApiError(payload.error || `Request failed (${response.status}).`);
    renderReport(payload);
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      showFeedback(error.message, "error");
    } else {
      setConnection(false);
      const actionNote = method === "POST" ? " The request may have reached Java; refresh the report before submitting again." : "";
      showFeedback("Cannot reach the Java server. Keep its terminal open, then choose Refresh report." + actionNote, "error");
    }
    return false;
  } finally {
    clearTimeout(timeout);
    busy = false;
    updateControls();
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !connected || !form.reportValidity()) return;
  // Capture the data BEFORE disabling the fieldset for the request.
  const values = Object.fromEntries(new FormData(form));
  values.name = values.name.trim();
  if (!values.name) {
    showFeedback("Enter a student name, not just spaces.", "error");
    byId("student-name").focus();
    return;
  }
  if (await requestReport("/api/students", "POST", values)) {
    form.reset();
    showFeedback(`${values.name} was added. Java updated the average, standings and array view.`);
    if (report.count < report.capacity) byId("student-name").focus();
    else showFeedback("The array is full: 100 students recorded. Print the report before resetting.");
  }
});

byId("clear-fields-btn").addEventListener("click", () => {
  form.reset();
  byId("student-name").focus();
});

byId("sample-btn").addEventListener("click", async () => {
  if (busy || (report && report.count > 0)) return;
  if (await requestReport("/api/sample", "POST")) {
    showFeedback("Six fictional sample records loaded. Ana Santos and Miguel Cruz share the highest average.");
  }
});

byId("reset-btn").addEventListener("click", async () => {
  if (busy || !report || report.count === 0) return;
  if (!window.confirm("Clear every student record from the Java arrays? This cannot be undone. Print the report first to keep a copy.")) return;
  if (await requestReport("/api/reset", "POST")) {
    form.reset();
    showFeedback("All records cleared. The next student will use array index [0].");
    byId("student-name").focus();
  }
});

byId("refresh-btn").addEventListener("click", async () => {
  if (!busy && await requestReport("/api/students")) showFeedback("Report refreshed from the Java arrays.");
});

function preparePrint() {
  byId("print-date").textContent = new Date().toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  });
}

byId("print-btn").addEventListener("click", () => {
  if (!report || report.count === 0) return;
  preparePrint();
  window.print();
});
window.addEventListener("beforeprint", preparePrint);
byId("array-link").addEventListener("click", () => { byId("array-section").open = true; });

async function initialize() {
  updateControls();
  if (location.protocol === "file:") {
    setConnection(false);
    showFeedback("Start the Java server, then open http://localhost:8080. Opening index.html directly cannot connect to Java.", "error");
    updateControls();
    return;
  }
  if (await requestReport("/api/students")) {
    showFeedback(report.count === 0
      ? "Ready for your first record. Add a student or load fictional sample data."
      : "Your records are loaded from Java. Refreshing the page does not clear the arrays.");
  }
}
initialize();
