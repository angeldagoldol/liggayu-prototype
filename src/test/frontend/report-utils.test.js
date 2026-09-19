import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStudentRequest,
  formatAverage,
  formatNames,
  formatScore,
  validateStudentInput
} from "../../main/resources/static/js/report-utils.js";

const validInput = {
  name: "Ana Cruz",
  prelim: "80",
  midterm: "90",
  finals: "100"
};

test("validateStudentInput rejects a blank name", () => {
  assert.equal(validateStudentInput({ ...validInput, name: "" }).name,
    "Student name is required.");
});

test("validateStudentInput rejects a whitespace-only name", () => {
  assert.equal(validateStudentInput({ ...validInput, name: "   " }).name,
    "Student name is required.");
});

test("validateStudentInput rejects a name longer than 100 characters", () => {
  assert.equal(validateStudentInput({ ...validInput, name: "A".repeat(101) }).name,
    "Student name must not exceed 100 characters.");
});

for (const [field, label] of [
  ["prelim", "Prelim"],
  ["midterm", "Midterm"],
  ["finals", "Finals"]
]) {
  test(`validateStudentInput rejects blank ${field}`, () => {
    assert.equal(validateStudentInput({ ...validInput, [field]: "  " })[field],
      `${label} is required.`);
  });

  test(`validateStudentInput rejects nonnumeric ${field}`, () => {
    assert.equal(validateStudentInput({ ...validInput, [field]: "not a score" })[field],
      `${label} must be a number.`);
  });

  test(`validateStudentInput rejects ${field} below zero`, () => {
    assert.equal(validateStudentInput({ ...validInput, [field]: "-0.01" })[field],
      `${label} must be from 0 to 100.`);
  });

  test(`validateStudentInput rejects ${field} above 100`, () => {
    assert.equal(validateStudentInput({ ...validInput, [field]: "100.01" })[field],
      `${label} must be from 0 to 100.`);
  });
}

test("validateStudentInput accepts zero, 100, and decimal scores", () => {
  assert.deepEqual(validateStudentInput({
    name: "Ana",
    prelim: "0",
    midterm: "100",
    finals: "89.5"
  }), {});
});

test("buildStudentRequest trims the name and keeps numeric scores", () => {
  assert.deepEqual(
    buildStudentRequest({
      name: "  Ana Cruz  ",
      prelim: "80",
      midterm: "90",
      finals: "100"
    }),
    { name: "Ana Cruz", prelim: 80, midterm: 90, finals: 100 }
  );
});

test("formatScore presents whole and decimal scores without forced zeroes", () => {
  assert.equal(formatScore(80), "80");
  assert.equal(formatScore(89.5), "89.5");
});

test("formatAverage presents backend averages with two decimal places", () => {
  assert.equal(formatAverage(89.666), "89.67");
  assert.equal(formatAverage(90), "90.00");
});

test("formatNames joins tied student names in report order", () => {
  assert.equal(formatNames(["Ana", "Cara", "Dani"]), "Ana, Cara, Dani");
});
