export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isName(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 100;
}

function isScore(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isStudent(student) {
  return isRecord(student)
    && isName(student.name)
    && isScore(student.assessment1)
    && isScore(student.assessment2)
    && isScore(student.assessment3)
    && isScore(student.average);
}

function isSummary(summary) {
  return isRecord(summary)
    && isScore(summary.average)
    && Array.isArray(summary.names)
    && summary.names.length > 0
    && summary.names.every(isName);
}

function isReportResponse(report) {
  if (!isRecord(report)
      || !Array.isArray(report.students)
      || !report.students.every(isStudent)) {
    return false;
  }

  if (report.students.length === 0) {
    return report.highest === null && report.lowest === null;
  }

  return isSummary(report.highest) && isSummary(report.lowest);
}

function invalidResponse(status) {
  return new ApiError("The server returned an invalid response.", status, {});
}

async function requestJson(url, options, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(url, options);
  } catch {
    throw new ApiError("Unable to connect to the server. Please try again.", 0, {});
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw invalidResponse(response.status);
  }

  if (!response.ok) {
    const message = typeof payload?.message === "string" && payload.message.trim()
      ? payload.message
      : "The server could not complete the request.";
    const fieldErrors = payload?.fieldErrors && typeof payload.fieldErrors === "object"
      ? payload.fieldErrors
      : {};
    throw new ApiError(message, response.status, fieldErrors);
  }

  if (!isReportResponse(payload)) {
    throw invalidResponse(response.status);
  }

  return payload;
}

export function getReport(fetchImpl = fetch) {
  return requestJson("/api/report", {
    headers: { Accept: "application/json" }
  }, fetchImpl);
}

export function addStudent(student, fetchImpl = fetch) {
  return requestJson("/api/students", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(student)
  }, fetchImpl);
}
