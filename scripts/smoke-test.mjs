import assert from "node:assert/strict";

const rawBaseUrl = process.argv[2] ?? "http://127.0.0.1:8080";
let baseUrl;

try {
  const parsedBaseUrl = new URL(rawBaseUrl);
  assert.match(parsedBaseUrl.protocol, /^https?:$/, "base URL must use HTTP or HTTPS");
  baseUrl = parsedBaseUrl.href.replace(/\/$/, "");
} catch (error) {
  console.error(`Invalid base URL "${rawBaseUrl}": ${error.message}`);
  process.exit(2);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return response;
}

async function readJson(response) {
  assert.match(
    response.headers.get("content-type") ?? "",
    /^application\/json\b/,
    `expected JSON content from ${response.url}`
  );
  return response.json();
}

async function expectJson(path, expectedStatus, options = {}) {
  const response = await request(path, options);
  assert.equal(response.status, expectedStatus, `${options.method ?? "GET"} ${path}`);
  return readJson(response);
}

async function addStudent(name, assessment1, assessment2, assessment3) {
  return expectJson("/api/students", 201, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, assessment1, assessment2, assessment3 })
  });
}

async function expectStaticAsset(path, contentType, expectedContent) {
  const response = await request(path, { headers: { Accept: contentType } });
  assert.equal(response.status, 200, `GET ${path}`);
  assert.match(
    response.headers.get("content-type") ?? "",
    contentType,
    `content type for ${path}`
  );
  assert.match(await response.text(), expectedContent, `content for ${path}`);
}

const emptyReport = await expectJson("/api/report", 200);
assert.deepEqual(emptyReport, { students: [], highest: null, lowest: null });

await addStudent("Ana", 80, 90, 100);
await addStudent("Ben", 70, 80, 90);
await addStudent("Cara", 100, 80, 90);
const tiedReport = await addStudent("Dani", 70, 80, 90);

assert.deepEqual(tiedReport, {
  students: [
    { name: "Ana", assessment1: 80, assessment2: 90, assessment3: 100, average: 90 },
    { name: "Ben", assessment1: 70, assessment2: 80, assessment3: 90, average: 80 },
    { name: "Cara", assessment1: 100, assessment2: 80, assessment3: 90, average: 90 },
    { name: "Dani", assessment1: 70, assessment2: 80, assessment3: 90, average: 80 }
  ],
  highest: { average: 90, names: ["Ana", "Cara"] },
  lowest: { average: 80, names: ["Ben", "Dani"] }
});

const duplicateNameReport = await addStudent("Ana", 80, 90, 95);
assert.deepEqual(duplicateNameReport, {
  students: [
    ...tiedReport.students,
    { name: "Ana", assessment1: 80, assessment2: 90, assessment3: 95, average: 88.33 }
  ],
  highest: tiedReport.highest,
  lowest: tiedReport.lowest
});

const invalidResponse = await request("/api/students", {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "Eli", assessment1: 101, assessment2: 80, assessment3: 90 })
});
assert.equal(invalidResponse.status, 400, "POST /api/students rejects score 101");
const invalidError = await readJson(invalidResponse);
assert.equal(
  invalidError.fieldErrors?.assessment1,
  "Assessment 1 must be from 0 to 100."
);
assert.deepEqual(
  await expectJson("/api/report", 200),
  duplicateNameReport,
  "invalid submission must not mutate the report"
);

await expectStaticAsset("/", /^text\/html\b/, /Student Score Management System/);
await expectStaticAsset("/css/styles.css", /^text\/css\b/, /\.workspace\s*\{/);
await expectStaticAsset("/js/report-utils.js", /^(?:text|application)\/javascript\b/, /export function/);
await expectStaticAsset("/js/api.js", /^(?:text|application)\/javascript\b/, /export class ApiError/);
await expectStaticAsset("/js/app.js", /^(?:text|application)\/javascript\b/, /student-form/);
await expectStaticAsset("/favicon.svg", /^image\/svg\+xml\b/, /<svg/);

console.log(`Smoke test passed against ${baseUrl}`);
console.log("Verified empty report, ordered rounded rows, high/low ties, duplicate names, rejection without mutation, and all static/API routes.");
