const scoreFields = [
  ["assessment1", "Assessment 1"],
  ["assessment2", "Assessment 2"],
  ["assessment3", "Assessment 3"]
];

export function validateStudentInput(rawInput) {
  const fieldErrors = {};
  const name = String(rawInput.name ?? "").trim();

  if (name.length === 0) {
    fieldErrors.name = "Student name is required.";
  } else if (name.length > 100) {
    fieldErrors.name = "Student name must not exceed 100 characters.";
  }

  for (const [field, label] of scoreFields) {
    const rawValue = rawInput[field];
    if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") {
      fieldErrors[field] = `${label} is required.`;
      continue;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      fieldErrors[field] = `${label} must be a number.`;
    } else if (value < 0 || value > 100) {
      fieldErrors[field] = `${label} must be from 0 to 100.`;
    }
  }

  return fieldErrors;
}

export function buildStudentRequest(rawInput) {
  return {
    name: String(rawInput.name ?? "").trim(),
    assessment1: Number(rawInput.assessment1),
    assessment2: Number(rawInput.assessment2),
    assessment3: Number(rawInput.assessment3)
  };
}

export function formatScore(value) {
  return String(value);
}

export function formatAverage(value) {
  return Number(value).toFixed(2);
}

export function formatNames(names) {
  return names.join(", ");
}
