import assert from "node:assert/strict";
import test from "node:test";

const emptyReport = {
  students: [],
  highest: null,
  lowest: null
};

const populatedReport = {
  students: [{
    name: "Ana Cruz",
    assessment1: 80,
    assessment2: 90,
    assessment3: 100,
    average: 90
  }],
  highest: { average: 90, names: ["Ana Cruz"] },
  lowest: { average: 90, names: ["Ana Cruz"] }
};

const appUrl = new URL("../../main/resources/static/js/app.js", import.meta.url);

let appInstance = 0;

class FakeElement {
  constructor(ownerDocument, id = "") {
    this.ownerDocument = ownerDocument;
    this.id = id;
    this.attributes = new Map();
    this.childNodes = [];
    this.disabled = false;
    this.hidden = false;
    this.listeners = new Map();
    this.scope = "";
    this.textContent = "";
    this.value = "";
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  append(...nodes) {
    for (const node of nodes) {
      if (node instanceof FakeDocumentFragment) {
        this.childNodes.push(...node.childNodes);
      } else {
        this.childNodes.push(node);
      }
    }
  }

  async dispatch(type, event) {
    const results = (this.listeners.get(type) ?? []).map((listener) => listener(event));
    await Promise.all(results);
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  replaceChildren(...nodes) {
    this.childNodes = [];
    this.append(...nodes);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

class FakeDocumentFragment extends FakeElement {}

function createDocument() {
  const elements = new Map();
  const document = {
    activeElement: null,
    createDocumentFragment() {
      return new FakeDocumentFragment(document);
    },
    createElement() {
      return new FakeElement(document);
    },
    querySelector(selector) {
      return elements.get(selector) ?? null;
    }
  };

  for (const id of [
    "student-form",
    "add-student-button",
    "form-error",
    "form-success",
    "report-section",
    "report-loading",
    "report-error",
    "report-empty",
    "report-content",
    "student-report-body",
    "record-count",
    "highest-names",
    "highest-average",
    "lowest-names",
    "lowest-average",
    "student-name",
    "student-name-error",
    "assessment-1",
    "assessment-1-error",
    "assessment-2",
    "assessment-2-error",
    "assessment-3",
    "assessment-3-error"
  ]) {
    elements.set(`#${id}`, new FakeElement(document, id));
  }

  for (const id of [
    "form-error",
    "form-success",
    "report-error",
    "report-empty",
    "report-content"
  ]) {
    elements.get(`#${id}`).hidden = true;
  }

  elements.get("#add-student-button").textContent = "Add Student";
  elements.get("#record-count").textContent = "0 records";
  elements.get("#student-form").reset = () => {
    for (const id of ["student-name", "assessment-1", "assessment-2", "assessment-3"]) {
      elements.get(`#${id}`).value = "";
    }
  };

  return { document, elements };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return body;
    }
  };
}

async function flushAsyncWork() {
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

async function installApp(t, fetchImpl) {
  const previousDocument = globalThis.document;
  const previousFetch = globalThis.fetch;
  const { document, elements } = createDocument();

  globalThis.document = document;
  globalThis.fetch = fetchImpl;

  t.after(async () => {
    await flushAsyncWork();
    globalThis.document = previousDocument;
    globalThis.fetch = previousFetch;
  });

  await import(`${appUrl.href}?instance=${++appInstance}`);
  return { document, elements };
}

function enterValidStudent(elements) {
  elements.get("#student-name").value = "Ana Cruz";
  elements.get("#assessment-1").value = "80";
  elements.get("#assessment-2").value = "90";
  elements.get("#assessment-3").value = "100";
}

function submit(elements) {
  return elements.get("#student-form").dispatch("submit", {
    preventDefault() {}
  });
}

function assertPopulatedReport(elements) {
  assert.equal(elements.get("#record-count").textContent, "1 record");
  assert.equal(elements.get("#student-report-body").childNodes.length, 1);
  assert.equal(elements.get("#report-empty").hidden, true);
  assert.equal(elements.get("#report-content").hidden, false);
  assert.equal(elements.get("#highest-names").textContent, "Ana Cruz");
  assert.equal(elements.get("#highest-average").textContent, "90.00");
}

test("an older report load cannot overwrite a successful student submission", async (t) => {
  const initialLoad = deferred();
  const { elements } = await installApp(t, (url, options = {}) => {
    if (options.method === "POST") {
      return Promise.resolve(jsonResponse(populatedReport, { status: 201 }));
    }
    assert.equal(url, "/api/report");
    return initialLoad.promise;
  });

  t.after(() => initialLoad.resolve(jsonResponse(emptyReport)));
  enterValidStudent(elements);
  await submit(elements);
  assertPopulatedReport(elements);

  initialLoad.resolve(jsonResponse(emptyReport));
  await flushAsyncWork();

  assertPopulatedReport(elements);
  assert.equal(elements.get("#report-error").hidden, true);
  assert.equal(elements.get("#form-success").textContent, "Student added successfully.");
  assert.equal(elements.get("#report-loading").hidden, true);
  assert.equal(elements.get("#report-section").hasAttribute("aria-busy"), false);
});

test("an older failed report load cannot disturb a successful student submission", async (t) => {
  const initialLoad = deferred();
  const { elements } = await installApp(t, (_url, options = {}) => {
    if (options.method === "POST") {
      return Promise.resolve(jsonResponse(populatedReport, { status: 201 }));
    }
    return initialLoad.promise;
  });

  t.after(() => initialLoad.resolve(jsonResponse(emptyReport)));
  enterValidStudent(elements);
  await submit(elements);

  initialLoad.reject(new TypeError("fetch failed"));
  await flushAsyncWork();

  assertPopulatedReport(elements);
  assert.equal(elements.get("#report-error").hidden, true);
  assert.equal(elements.get("#report-error").textContent, "");
  assert.equal(elements.get("#form-success").textContent, "Student added successfully.");
  assert.equal(elements.get("#report-loading").hidden, true);
  assert.equal(elements.get("#report-section").hasAttribute("aria-busy"), false);
  assert.equal(elements.get("#student-form").hasAttribute("aria-busy"), false);
  assert.equal(elements.get("#add-student-button").disabled, false);
});

test("the initial report load renders normally", async (t) => {
  const { elements } = await installApp(t, () => Promise.resolve(jsonResponse(populatedReport)));

  await flushAsyncWork();

  assertPopulatedReport(elements);
  assert.equal(elements.get("#report-error").hidden, true);
  assert.equal(elements.get("#report-loading").hidden, true);
  assert.equal(elements.get("#report-section").hasAttribute("aria-busy"), false);
});

test("a pending student submission prevents a duplicate POST", async (t) => {
  const post = deferred();
  let postCount = 0;
  const { elements } = await installApp(t, (_url, options = {}) => {
    if (options.method === "POST") {
      postCount += 1;
      return post.promise;
    }
    return Promise.resolve(jsonResponse(emptyReport));
  });

  t.after(() => post.resolve(jsonResponse(populatedReport, { status: 201 })));
  await flushAsyncWork();
  enterValidStudent(elements);

  const firstSubmission = submit(elements);
  const duplicateSubmission = submit(elements);

  assert.equal(postCount, 1);
  assert.equal(elements.get("#add-student-button").disabled, true);

  post.resolve(jsonResponse(populatedReport, { status: 201 }));
  await Promise.all([firstSubmission, duplicateSubmission]);

  assert.equal(postCount, 1);
  assertPopulatedReport(elements);
  assert.equal(elements.get("#add-student-button").disabled, false);
});
