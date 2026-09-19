import assert from "node:assert/strict";
import test from "node:test";

import { addStudent, ApiError, getReport } from "../../main/resources/static/js/api.js";

const report = {
  students: [],
  highest: null,
  lowest: null
};

const populatedReport = {
  students: [{
    name: "Ana",
    prelim: 80,
    midterm: 90,
    finals: 100,
    average: 90
  }],
  highest: { average: 90, names: ["Ana"] },
  lowest: { average: 90, names: ["Ana"] }
};

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return body;
    }
  };
}

async function assertInvalidGetReport(payload) {
  await assert.rejects(
    getReport(async () => jsonResponse(payload)),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "The server returned an invalid response.");
      assert.equal(error.status, 200);
      assert.deepEqual(error.fieldErrors, {});
      return true;
    }
  );
}

test("getReport sends a GET request and returns successful JSON", async () => {
  let request;
  const result = await getReport(async (...args) => {
    request = args;
    return jsonResponse(report);
  });

  assert.deepEqual(request, ["/api/report", { headers: { Accept: "application/json" } }]);
  assert.deepEqual(result, report);
});

test("addStudent sends JSON with the required method and headers", async () => {
  const student = { name: "Ana", prelim: 80, midterm: 90, finals: 100 };
  let request;
  const result = await addStudent(student, async (...args) => {
    request = args;
    return jsonResponse(report, { status: 201 });
  });

  assert.deepEqual(request, [
    "/api/students",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(student)
    }
  ]);
  assert.deepEqual(result, report);
});

test("getReport accepts a complete populated report", async () => {
  const result = await getReport(async () => jsonResponse(populatedReport));

  assert.deepEqual(result, populatedReport);
});

test("getReport rejects null and missing or non-array student collections", async () => {
  for (const payload of [null, {}, { students: null }, { students: {} }]) {
    await assertInvalidGetReport(payload);
  }
});

test("getReport rejects null and malformed student rows", async () => {
  for (const student of [null, {}, []]) {
    await assertInvalidGetReport({
      ...populatedReport,
      students: [student]
    });
  }
});

test("getReport rejects non-string student names", async () => {
  await assertInvalidGetReport({
    ...populatedReport,
    students: [{ ...populatedReport.students[0], name: 42 }]
  });
});

test("getReport rejects blank or overlong student names", async () => {
  for (const name of ["  ", "A".repeat(101)]) {
    await assertInvalidGetReport({
      ...populatedReport,
      students: [{ ...populatedReport.students[0], name }]
    });
  }
});

test("getReport rejects non-number and non-finite student score fields", async () => {
  for (const field of ["prelim", "midterm", "finals", "average"]) {
    for (const value of ["90", Number.NaN, Number.POSITIVE_INFINITY]) {
      await assertInvalidGetReport({
        ...populatedReport,
        students: [{ ...populatedReport.students[0], [field]: value }]
      });
    }
  }
});

test("getReport rejects out-of-range student score fields", async () => {
  for (const field of ["prelim", "midterm", "finals", "average"]) {
    for (const value of [-0.01, 100.01]) {
      await assertInvalidGetReport({
        ...populatedReport,
        students: [{ ...populatedReport.students[0], [field]: value }]
      });
    }
  }
});

test("getReport rejects an empty report with non-null summaries", async () => {
  await assertInvalidGetReport({
    students: [],
    highest: { average: 0, names: [] },
    lowest: null
  });
  await assertInvalidGetReport({
    students: [],
    highest: null,
    lowest: { average: 0, names: [] }
  });
});

test("getReport rejects a nonempty report with null or malformed summaries", async () => {
  for (const summary of [null, {}, [], { average: "90", names: ["Ana"] }, { average: 90, names: [] }]) {
    await assertInvalidGetReport({ ...populatedReport, highest: summary });
    await assertInvalidGetReport({ ...populatedReport, lowest: summary });
  }
});

test("getReport rejects non-string summary names", async () => {
  await assertInvalidGetReport({
    ...populatedReport,
    highest: { average: 90, names: ["Ana", 7] }
  });
});

test("getReport rejects blank summary names and invalid summary averages", async () => {
  for (const highest of [
    { average: Number.NaN, names: ["Ana"] },
    { average: 101, names: ["Ana"] },
    { average: 90, names: [" "] },
    { average: 90, names: ["A".repeat(101)] }
  ]) {
    await assertInvalidGetReport({ ...populatedReport, highest });
  }
});

test("addStudent rejects a malformed successful report", async () => {
  await assert.rejects(
    addStudent({}, async () => jsonResponse({ students: null }, { status: 201 })),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "The server returned an invalid response.");
      assert.equal(error.status, 201);
      assert.deepEqual(error.fieldErrors, {});
      return true;
    }
  );
});

test("addStudent preserves server field errors in ApiError", async () => {
  const fieldErrors = { prelim: "Prelim must be from 0 to 100." };

  await assert.rejects(
    addStudent({}, async () => jsonResponse({
      message: "Please correct the highlighted fields.",
      fieldErrors
    }, { ok: false, status: 400 })),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "Please correct the highlighted fields.");
      assert.equal(error.status, 400);
      assert.deepEqual(error.fieldErrors, fieldErrors);
      return true;
    }
  );
});

test("getReport normalizes an HTTP 500 response without an API message", async () => {
  await assert.rejects(
    getReport(async () => jsonResponse({}, { ok: false, status: 500 })),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "The server could not complete the request.");
      assert.equal(error.status, 500);
      assert.deepEqual(error.fieldErrors, {});
      return true;
    }
  );
});

test("getReport normalizes malformed successful responses", async () => {
  await assert.rejects(
    getReport(async () => ({
      ok: true,
      status: 200,
      async json() {
        throw new SyntaxError("Unexpected token");
      }
    })),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "The server returned an invalid response.");
      assert.equal(error.status, 200);
      assert.deepEqual(error.fieldErrors, {});
      return true;
    }
  );
});

test("addStudent normalizes malformed error responses", async () => {
  await assert.rejects(
    addStudent({}, async () => ({
      ok: false,
      status: 400,
      async json() {
        throw new SyntaxError("Unexpected token");
      }
    })),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "The server returned an invalid response.");
      assert.equal(error.status, 400);
      return true;
    }
  );
});

test("getReport normalizes rejected fetches", async () => {
  await assert.rejects(
    getReport(async () => {
      throw new TypeError("fetch failed");
    }),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, "Unable to connect to the server. Please try again.");
      assert.equal(error.status, 0);
      assert.deepEqual(error.fieldErrors, {});
      return true;
    }
  );
});
