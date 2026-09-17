# Student Score Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Render-ready Student Score Management System whose Java `ArrayList` backend accepts three scores per student, calculates averages, reports all highest and lowest scorers, and has matching SJPIIC/CICT Chapter I-II documentation.

**Architecture:** One Spring Boot service hosts a small REST API and the static HTML/CSS/JavaScript interface. A synchronized `StudentScoreService` owns the in-memory `ArrayList<Student>`, while the browser only validates input presentation and renders calculations returned by Java. A separate deterministic Python builder creates the Word document from the supplied template conventions and is verified structurally and visually.

**Tech Stack:** Java 17, Spring Boot 3.5.16, Maven 3.9.11 wrapper, JUnit 5, MockMvc, HTML5, CSS3, browser JavaScript modules, Node 20+ built-in test runner, Python `python-docx` and Pillow, Docker, Render Blueprint.

**Spec:** `docs/superpowers/specs/2026-09-17-student-score-management-system-design.md`

## Global Constraints

- Store records as `List<Student> students = new ArrayList<>();`; do not add a database, authentication, or persistence.
- Accept exactly Student Name, Assessment 1, Assessment 2, and Assessment 3.
- Accept decimal scores from 0 through 100 inclusive and reject blank, nonnumeric, below-zero, or above-100 input.
- Calculate and round the arithmetic mean to two decimal places in Java; compare those same reported values for high/low ties.
- Determine highest and lowest by average with a Java list traversal; return every tied name.
- Preserve insertion order and allow duplicate student names.
- Serve the frontend and API from the same Spring Boot service.
- The browser must not calculate averages or highest/lowest results.
- Records reset when the Java process restarts.
- Do not implement edit, delete, search, sort, rank, export, configurable grading, accounts, or a database.
- Documentation must use the supplied Letter-size, 1-inch-margin, Arial template conventions and stop after Chapter II.
- Leave literal editable cover fields only where the user has not supplied researchers, group leader, instructor, section, and submission date.
- Use Docker for Render and bind to `0.0.0.0` on `PORT`, defaulting locally to 8080.

---

## File Structure

### Java application

- `pom.xml` - pinned Spring Boot dependencies, Java 17 configuration, test and packaging plugins.
- `mvnw`, `mvnw.cmd`, `.mvn/wrapper/*` - reproducible Maven 3.9.11 wrapper.
- `src/main/java/edu/sjpiicd/scores/StudentScoreApplication.java` - application entry point.
- `src/main/java/edu/sjpiicd/scores/student/Student.java` - immutable stored student record and average calculation.
- `src/main/java/edu/sjpiicd/scores/student/StudentRequest.java` - validated request contract.
- `src/main/java/edu/sjpiicd/scores/student/StudentResponse.java` - public student/report row contract.
- `src/main/java/edu/sjpiicd/scores/student/ScoreSummary.java` - one extreme average and all tied names.
- `src/main/java/edu/sjpiicd/scores/student/ReportResponse.java` - complete table/high/low contract.
- `src/main/java/edu/sjpiicd/scores/student/StudentScoreService.java` - synchronized `ArrayList` ownership and traversal algorithm.
- `src/main/java/edu/sjpiicd/scores/student/StudentScoreController.java` - REST endpoints.
- `src/main/java/edu/sjpiicd/scores/error/ApiError.java` - stable validation error contract.
- `src/main/java/edu/sjpiicd/scores/error/RestExceptionHandler.java` - validation and malformed-request mapping.
- `src/main/resources/application.properties` - Render/local port binding.

### Frontend

- `src/main/resources/static/index.html` - semantic working surface.
- `src/main/resources/static/css/styles.css` - responsive academic blue/gold design.
- `src/main/resources/static/js/report-utils.js` - pure input and formatting helpers.
- `src/main/resources/static/js/api.js` - Fetch API client and `ApiError`.
- `src/main/resources/static/js/app.js` - form workflow and DOM rendering.
- `src/main/resources/static/favicon.svg` - simple score-report favicon.
- `package.json` - ESM mode and dependency-free frontend test command.

### Tests, deployment, and documentation

- `src/test/java/edu/sjpiicd/scores/student/StudentTest.java` - average unit tests.
- `src/test/java/edu/sjpiicd/scores/student/StudentScoreServiceTest.java` - list, average, extreme, tie, and ordering tests.
- `src/test/java/edu/sjpiicd/scores/student/StudentScoreControllerTest.java` - endpoint and validation contract tests.
- `src/test/frontend/report-utils.test.js` - pure frontend utility tests.
- `src/test/frontend/api.test.js` - injected-fetch API client tests.
- `scripts/smoke-test.mjs` - running-app acceptance test.
- `Dockerfile`, `.dockerignore`, `render.yaml` - repeatable Render deployment.
- `assets/sjpiicd-logo.png` - verified institution logo used only in the paper.
- `assets/student-score-system-flowchart.png` - deterministic high-resolution flowchart.
- `scripts/build_chapters_1_2_docx.py` - Word document and flowchart builder.
- `tests/test_chapters_1_2_document.py` - structural document checks.
- `deliverables/Implementation_of_ArrayList_in_a_Student_Score_Management_System_Chapters_I_II.docx` - final paper.
- `README.md` - local use, tests, project structure, and Render deployment.
- `Student_Score_Management_System_Render.zip` - final handoff package.

---

### Task 1: Bootstrap the Java Project and Average Model

**Files:**
- Create: `pom.xml`
- Create: `mvnw`
- Create: `mvnw.cmd`
- Create: `.mvn/wrapper/maven-wrapper.properties`
- Create: `.mvn/wrapper/maven-wrapper.jar`
- Create: `.gitignore`
- Create: `src/main/java/edu/sjpiicd/scores/StudentScoreApplication.java`
- Create: `src/main/java/edu/sjpiicd/scores/student/Student.java`
- Test: `src/test/java/edu/sjpiicd/scores/student/StudentTest.java`

**Interfaces:**
- Produces: `Student(String name, double assessment1, double assessment2, double assessment3)`
- Produces: `double Student.average()`

- [ ] **Step 1: Create build scaffolding**

Pin Spring Boot `3.5.16`, Java `17`, `spring-boot-starter-web`, `spring-boot-starter-validation`, and `spring-boot-starter-test` in `pom.xml`. Set `<finalName>app</finalName>`, generate the Maven `3.9.11` wrapper, ignore `target/`, render output, temporary files, and IDE files, and add this entry point:

```java
package edu.sjpiicd.scores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentScoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentScoreApplication.class, args);
    }
}
```

- [ ] **Step 2: Write the failing average tests**

```java
package edu.sjpiicd.scores.student;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class StudentTest {
    @Test
    void calculatesAverageFromThreeAssessments() {
        Student student = new Student("Ana Cruz", 80, 90, 100);
        assertThat(student.average()).isEqualTo(90.0);
    }

    @Test
    void roundsRepeatingAverageToTwoDecimals() {
        Student student = new Student("Ben Lee", 80, 90, 95);
        assertThat(student.average()).isEqualTo(88.33);
    }
}
```

- [ ] **Step 3: Run the focused test and confirm failure**

Run: `./mvnw -q -Dtest=StudentTest test`

Expected: compilation fails because `Student` does not exist.

- [ ] **Step 4: Implement the immutable model**

```java
package edu.sjpiicd.scores.student;

public record Student(
        String name,
        double assessment1,
        double assessment2,
        double assessment3) {

    public double average() {
        double rawAverage = (assessment1 + assessment2 + assessment3) / 3.0;
        return Math.round(rawAverage * 100.0) / 100.0;
    }
}
```

- [ ] **Step 5: Run tests and package the empty application**

Run: `./mvnw -q -Dtest=StudentTest test`

Expected: two passing tests.

Run: `./mvnw -q -DskipTests package`

Expected: `target/app.jar` is created.

- [ ] **Step 6: Commit**

```bash
git add pom.xml mvnw mvnw.cmd .mvn .gitignore src/main/java src/test/java/edu/sjpiicd/scores/student/StudentTest.java
git commit -m "feat: bootstrap score system and student average"
```

### Task 2: Implement the ArrayList Report Algorithm

**Files:**
- Create: `src/main/java/edu/sjpiicd/scores/student/StudentRequest.java`
- Create: `src/main/java/edu/sjpiicd/scores/student/StudentResponse.java`
- Create: `src/main/java/edu/sjpiicd/scores/student/ScoreSummary.java`
- Create: `src/main/java/edu/sjpiicd/scores/student/ReportResponse.java`
- Create: `src/main/java/edu/sjpiicd/scores/student/StudentScoreService.java`
- Test: `src/test/java/edu/sjpiicd/scores/student/StudentScoreServiceTest.java`

**Interfaces:**
- Consumes: `Student.average()`
- Produces: `synchronized ReportResponse StudentScoreService.addStudent(StudentRequest request)`
- Produces: `synchronized List<StudentResponse> StudentScoreService.getStudents()`
- Produces: `synchronized ReportResponse StudentScoreService.getReport()`
- Produces JSON shape: `{ students, highest, lowest }`, with `highest` and `lowest` null for an empty list.

- [ ] **Step 1: Write failing service tests**

Cover an empty report; one student as both highest and lowest; insertion order; correct averages; high/low changes; duplicate names; and all tied names. Use this core scenario:

```java
@Test
void calculatesExtremesAndReturnsEveryTie() {
    service.addStudent(new StudentRequest("Ana", 80.0, 90.0, 100.0));
    service.addStudent(new StudentRequest("Ben", 70.0, 80.0, 90.0));
    ReportResponse report =
            service.addStudent(new StudentRequest("Cara", 100.0, 80.0, 90.0));

    assertThat(report.students()).extracting(StudentResponse::name)
            .containsExactly("Ana", "Ben", "Cara");
    assertThat(report.highest().average()).isEqualTo(90.0);
    assertThat(report.highest().names()).containsExactly("Ana", "Cara");
    assertThat(report.lowest().average()).isEqualTo(80.0);
    assertThat(report.lowest().names()).containsExactly("Ben");
}
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `./mvnw -q -Dtest=StudentScoreServiceTest test`

Expected: compilation fails because request, response, summary, report, and service types do not exist.

- [ ] **Step 3: Add the exact DTO contracts**

```java
public record StudentRequest(
        @NotBlank(message = "Student name is required.")
        @Size(max = 100, message = "Student name must not exceed 100 characters.")
        String name,
        @NotNull(message = "Assessment 1 is required.")
        @DecimalMin(value = "0.0", message = "Assessment 1 must be from 0 to 100.")
        @DecimalMax(value = "100.0", message = "Assessment 1 must be from 0 to 100.")
        Double assessment1,
        @NotNull(message = "Assessment 2 is required.")
        @DecimalMin(value = "0.0", message = "Assessment 2 must be from 0 to 100.")
        @DecimalMax(value = "100.0", message = "Assessment 2 must be from 0 to 100.")
        Double assessment2,
        @NotNull(message = "Assessment 3 is required.")
        @DecimalMin(value = "0.0", message = "Assessment 3 must be from 0 to 100.")
        @DecimalMax(value = "100.0", message = "Assessment 3 must be from 0 to 100.")
        Double assessment3) {}

public record StudentResponse(
        String name, double assessment1, double assessment2,
        double assessment3, double average) {
    static StudentResponse from(Student student) {
        return new StudentResponse(
                student.name(), student.assessment1(), student.assessment2(),
                student.assessment3(), student.average());
    }
}

public record ScoreSummary(double average, List<String> names) {}
public record ReportResponse(
        List<StudentResponse> students, ScoreSummary highest, ScoreSummary lowest) {}
```

- [ ] **Step 4: Implement synchronized ArrayList storage and one-pass extremes**

Use `private final List<Student> students = new ArrayList<>();`. Trim the name before creating the record. In `getReport()`, copy rows into `StudentResponse` objects, initialize min/max from the first record's rounded `average()`, then make one loop that clears/adds tied-name lists with `Double.compare`. Return immutable list copies and return `new ReportResponse(List.of(), null, null)` when empty.

```java
public synchronized ReportResponse addStudent(StudentRequest request) {
    Student student = new Student(
            request.name().trim(),
            request.assessment1(), request.assessment2(), request.assessment3());
    students.add(student);
    return buildReport();
}

public synchronized List<StudentResponse> getStudents() {
    return buildReport().students();
}

public synchronized ReportResponse getReport() {
    return buildReport();
}
```

- [ ] **Step 5: Run service and model tests**

Run: `./mvnw -q -Dtest=StudentTest,StudentScoreServiceTest test`

Expected: all tests pass, including tie order and empty-state assertions.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/edu/sjpiicd/scores/student src/test/java/edu/sjpiicd/scores/student
git commit -m "feat: add ArrayList score report algorithm"
```

### Task 3: Add the Validated REST API

**Files:**
- Create: `src/main/java/edu/sjpiicd/scores/student/StudentScoreController.java`
- Create: `src/main/java/edu/sjpiicd/scores/error/ApiError.java`
- Create: `src/main/java/edu/sjpiicd/scores/error/RestExceptionHandler.java`
- Test: `src/test/java/edu/sjpiicd/scores/student/StudentScoreControllerTest.java`

**Interfaces:**
- `GET /api/students -> List<StudentResponse>`
- `GET /api/report -> ReportResponse`
- `POST /api/students + StudentRequest -> 201 ReportResponse`
- Validation error: `{ "message": "Please correct the highlighted fields.", "fieldErrors": { ... } }`
- Nonnumeric score error: status 400 with the affected score key and `Assessment N must be a number.`.
- Other malformed JSON error: status 400 with `message` and an empty `fieldErrors` object.

- [ ] **Step 1: Write failing MockMvc contract tests**

Use `@SpringBootTest`, `@AutoConfigureMockMvc`, and `@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)` so each test exercises the real controller, validation advice, service, and `ArrayList`. Assert GET mappings, a 201 POST, the exact JSON property names, blank-name rejection, each out-of-range score, missing score, nonnumeric score, and malformed JSON. After each rejected request, call `GET /api/students` and assert that the returned array is still empty. One validation assertion must be:

```java
mockMvc.perform(post("/api/students")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"name":"Ana","assessment1":101,"assessment2":90,"assessment3":80}
            """))
    .andExpect(status().isBadRequest())
    .andExpect(jsonPath("$.message")
            .value("Please correct the highlighted fields."))
    .andExpect(jsonPath("$.fieldErrors.assessment1")
            .value("Assessment 1 must be from 0 to 100."));
```

- [ ] **Step 2: Run the controller test and confirm failure**

Run: `./mvnw -q -Dtest=StudentScoreControllerTest test`

Expected: compilation fails because controller and error types do not exist.

- [ ] **Step 3: Implement the controller**

```java
@RestController
@RequestMapping("/api")
public class StudentScoreController {
    private final StudentScoreService service;

    public StudentScoreController(StudentScoreService service) {
        this.service = service;
    }

    @GetMapping("/students")
    public List<StudentResponse> getStudents() {
        return service.getStudents();
    }

    @GetMapping("/report")
    public ReportResponse getReport() {
        return service.getReport();
    }

    @PostMapping("/students")
    public ResponseEntity<ReportResponse> addStudent(
            @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addStudent(request));
    }
}
```

- [ ] **Step 4: Implement deterministic validation errors**

`ApiError` is `record ApiError(String message, Map<String, String> fieldErrors)`. The advice handles `MethodArgumentNotValidException` using a `LinkedHashMap` and `putIfAbsent`. For `HttpMessageNotReadableException`, inspect a Jackson `MismatchedInputException` path: map `assessment1`, `assessment2`, or `assessment3` to `Assessment N must be a number.`; otherwise return `Request body must contain valid names, numbers, and JSON.` with an empty map.

- [ ] **Step 5: Run backend tests**

Run: `./mvnw -q test`

Expected: model, service, and controller tests all pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/edu/sjpiicd/scores src/test/java/edu/sjpiicd/scores
git commit -m "feat: expose validated student score API"
```

### Task 4: Build the Accessible Browser Interface

**Files:**
- Create: `package.json`
- Create: `src/main/resources/static/index.html`
- Create: `src/main/resources/static/css/styles.css`
- Create: `src/main/resources/static/js/report-utils.js`
- Create: `src/main/resources/static/js/api.js`
- Create: `src/main/resources/static/js/app.js`
- Create: `src/main/resources/static/favicon.svg`
- Test: `src/test/frontend/report-utils.test.js`
- Test: `src/test/frontend/api.test.js`

**Interfaces:**
- `validateStudentInput(rawInput) -> fieldErrors`
- `buildStudentRequest(rawInput) -> StudentRequest`
- `formatScore(value) -> string`
- `formatAverage(value) -> string`
- `formatNames(names) -> string`
- `getReport(fetchImpl = fetch) -> Promise<ReportResponse>`
- `addStudent(student, fetchImpl = fetch) -> Promise<ReportResponse>`
- `ApiError(message, status, fieldErrors)`

- [ ] **Step 1: Write failing dependency-free frontend tests**

Set `"type": "module"` and `"test:frontend": "node --test src/test/frontend/*.test.js"`. Test blank and whitespace names; blank, nonnumeric, negative, and above-100 scores; accepted 0, 100, and decimal scores; trimmed names; `89.666 -> "89.67"`; and joined tie names. Inject a fake fetch function to assert GET `/api/report`, POST method/header/body, successful JSON, field errors, malformed responses, HTTP 500, and rejected fetches.

```javascript
test("buildStudentRequest trims the name and keeps numeric scores", () => {
  assert.deepEqual(
    buildStudentRequest({
      name: "  Ana Cruz  ",
      assessment1: "80",
      assessment2: "90",
      assessment3: "100"
    }),
    { name: "Ana Cruz", assessment1: 80, assessment2: 90, assessment3: 100 }
  );
});
```

- [ ] **Step 2: Run frontend tests and confirm failure**

Run: `npm run test:frontend`

Expected: module-not-found failures for `report-utils.js` and `api.js`.

- [ ] **Step 3: Implement pure utilities and the API client**

Utilities return field keys `name`, `assessment1`, `assessment2`, and `assessment3`; never use truthiness to reject score 0. `requestJson` must parse a JSON response, throw `ApiError` for non-2xx responses, and normalize network/malformed-response errors without erasing `fieldErrors`.

- [ ] **Step 4: Run utility and API tests**

Run: `npm run test:frontend`

Expected: all frontend tests pass.

- [ ] **Step 5: Create the semantic working surface**

Build persistent labels and error text for `student-name`, `assessment-1`, `assessment-2`, and `assessment-3`; a `student-form`; `add-student-button`; `form-error` with `role="alert"`; `form-success` with `role="status"`; loading, report-error, and empty states; a captioned real table with scoped headers and `student-report-body`; and highest/lowest summary cards. Number inputs use `min="0"`, `max="100"`, `step="any"`, and `required`.

- [ ] **Step 6: Implement DOM behavior without duplicating Java calculations**

`app.js` must load `GET /api/report`, validate and submit once, set `aria-busy`, focus the first invalid control, map server field errors, and rebuild table rows using `document.createElement()` and `textContent`. Preserve values and existing rows on failure. After success, render the POST report, reset the form, focus Student Name, and announce success. Keep an `isSubmitting` guard so rapid duplicate clicks send one request.

- [ ] **Step 7: Apply the responsive academic design**

Use navy `#0B2E59`, accessible dark text, a pale cool-gray background, and gold only as a border/accent. Main text and inputs are at least 16px, controls have practical 44px targets, `:focus-visible` is obvious, and reduced-motion is respected. Use a two-column layout at 900px and above, stack below it, apply `min-width: 0` to grid children, and allow horizontal scrolling only inside the labeled `report-table-container`.

- [ ] **Step 8: Run both frontend and backend suites**

Run: `npm run test:frontend && ./mvnw -q test`

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add package.json src/main/resources/static src/test/frontend
git commit -m "feat: add accessible student score interface"
```

### Task 5: Add Full-Stack Verification and Render Deployment

**Files:**
- Create: `src/main/resources/application.properties`
- Create: `scripts/smoke-test.mjs`
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `render.yaml`

**Interfaces:**
- Application binds to `0.0.0.0:${PORT:8080}`.
- Render health check uses `GET /api/report`, which returns 200 for an empty list.
- Smoke script accepts a base URL as its first argument.

- [ ] **Step 1: Write the running-app smoke test**

The script first asserts an empty report, then posts Ana `80/90/100`, Ben `70/80/90`, Cara `100/80/90`, and Dani `70/80/90`. It must assert averages, insertion order, the Ana/Cara highest tie, the Ben/Dani lowest tie, duplicate-name acceptance, and a 400 response for a score of 101.

- [ ] **Step 2: Configure the port and Docker build**

`application.properties` contains:

```properties
server.address=0.0.0.0
server.port=${PORT:8080}
```

Use a multi-stage Dockerfile with a pinned Maven/Temurin 17 builder, run `mvn test package`, copy only `target/app.jar` into a Temurin 17 JRE image, expose 10000, and execute `java -jar /app/app.jar`. The Blueprint defines one Docker web service, a free plan, and `healthCheckPath: /api/report`.

- [ ] **Step 3: Run complete automated verification**

Run:

```bash
npm run test:frontend
./mvnw -q clean test package
PORT=8080 java -jar target/app.jar
```

In a second process run:

```bash
node scripts/smoke-test.mjs http://127.0.0.1:8080
```

Expected: all assertions pass and the root page, API, and static assets return 200 responses.

- [ ] **Step 4: Perform browser interaction and responsive QA**

Check 320x568, 375x667, 768x1024, 1024x768, 1280x720, and 1280x720 at 200% zoom. Confirm no body-level horizontal scrolling, visible keyboard focus, accurate two-decimal output, table-only overflow, one-record high/low, ties, literal rendering of `<img src=x onerror=alert(1)>`, preserved values on offline failure, and one POST on rapid double submission.

- [ ] **Step 5: Validate the container when Docker is available**

Run: `docker build -t student-score-management-system .`

Run: `docker run --rm -p 10000:10000 -e PORT=10000 student-score-management-system`

Expected: the smoke test passes against `http://127.0.0.1:10000`.

- [ ] **Step 6: Commit**

```bash
git add src/main/resources/application.properties scripts/smoke-test.mjs Dockerfile .dockerignore render.yaml
git commit -m "build: prepare verified Render deployment"
```

### Task 6: Create and Verify the Chapter I-II Word Document

**Files:**
- Use unchanged: `upload/DATA STRUCTURES AND ALGORITHMS MINI-SYSTEM PROJECT(format paper presentation) (1).docx`
- Create: `assets/sjpiicd-logo.png`
- Create: `assets/student-score-system-flowchart.png`
- Create: `scripts/build_chapters_1_2_docx.py`
- Create: `tests/test_chapters_1_2_document.py`
- Create: `deliverables/Implementation_of_ArrayList_in_a_Student_Score_Management_System_Chapters_I_II.docx`

**Interfaces:**
- Builder accepts `--template`, `--logo`, and `--output`.
- Builder preserves Letter size, 1-inch margins, Arial defaults, and the original template bytes.
- Section 1 is a one-page unnumbered cover; Section 2 starts centered Arabic page numbers at 1.
- Flowchart alt text: `Flow from student score input through validation, ArrayList storage, average calculation, high and low traversal, and report display.`

- [ ] **Step 1: Write failing structural document tests**

Tests must assert: the source template SHA-256 is unchanged; Letter size and 1-inch margins; exact title and six subsection headings once each; no Chapter III-VI, References, Appendices, instructional examples, or logo reminder; the approved `ArrayList`, three-score, validation, tie, and in-memory facts; two embedded images with alt text; no PAGE field in the cover section; a centered PAGE field restarted at 1 in the content section; and no excluded feature claimed in Section 2.3.

- [ ] **Step 2: Run tests and confirm the output is missing**

Run: `"$CODEX_PRIMARY_RUNTIME_PYTHON" -m pytest -q tests/test_chapters_1_2_document.py`

Expected: failure because the final DOCX does not exist.

- [ ] **Step 3: Mark the document operation exactly once**

Run before the first builder execution:

```bash
"$CODEX_PRIMARY_RUNTIME_NODE" /root/.codex/skills/builtins/documents/container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format docx
```

- [ ] **Step 4: Acquire and visually verify the authentic logo**

Prefer a user-supplied logo. If none is supplied, use the school-owned JP Connect school-identity asset, preserve its aspect ratio/colors, convert it losslessly to PNG, and inspect it before insertion. Do not generate or redraw the institution logo.

- [ ] **Step 5: Build the flowchart and document**

Draw a high-resolution vertical blue/gold PNG with these states: Start; enter name and three scores; browser required-field check; submit to Java; Java validates; valid-input decision; error loop retaining values; create Student and append to `ArrayList<Student>`; calculate averages; traverse for high/low ties; return JSON; render table/summaries; await next entry.

Generate a new output copy with:

- One-page cover, centered 1.25-1.5 inch logo, exact study title, institution/course values, and literal editable fields for the five unsupplied metadata values.
- New-page static table of contents containing only Chapters I-II and their six subsections.
- New-page Chapter I with three focused Background paragraphs; one general and five specific Objectives; and Significance for researchers, DSA students, instructors, and beginner programmers.
- New-page Chapter II with the implemented Spring Boot/HTML/CSS/JavaScript description; the flowchart plus input-process-output explanation; and exactly eight implemented features.
- Arial 11pt justified body text with 1.15 spacing and 0.5-inch first-line indents; centered bold 17pt chapter headings; centered bold 13pt subsection headings; no decorative rules.
- Caption `Figure 1 Student Score Management System Flowchart`.

- [ ] **Step 6: Run structural tests**

Run: `"$CODEX_PRIMARY_RUNTIME_PYTHON" -m pytest -q tests/test_chapters_1_2_document.py`

Expected: every structural check passes.

- [ ] **Step 7: Render, reconcile the static TOC, and inspect every page**

Run the document skill's `render_docx.py --emit_pdf`. Locate the actual Chapter I, Chapter II, and subsection pages in the rendered PDF, update the static TOC numbers if needed, rebuild, rerun tests, and rerender. Inspect every PNG at 100% for a one-page cover, crisp centered logo, correct page separation and footer numbers, readable flowchart/caption, clean lists, no clipping/overlap, no orphaned headings, and no excessive blank space.

- [ ] **Step 8: Run document audits**

Run the heading, section, image, and accessibility audit scripts from the document skill. Fix genuine issues and repeat structural tests plus a complete render-and-inspect cycle after every layout-sensitive correction.

- [ ] **Step 9: Commit**

```bash
git add assets scripts/build_chapters_1_2_docx.py tests/test_chapters_1_2_document.py deliverables
git commit -m "docs: complete Chapter I and II project paper"
```

### Task 7: Write the Handoff Guide, Package, and Final Verification

**Files:**
- Create: `README.md`
- Create: `Student_Score_Management_System_Render.zip`
- Modify: `.gitignore`

**Interfaces:**
- README gives Windows and cross-platform local commands, test commands, in-memory limitation, exact Render steps, and the output document location.
- ZIP includes source, Maven wrapper, frontend, tests, assets, document, Docker/Render files, spec, plan, and README; it excludes `.git/`, `target/`, render QA images/PDFs, temporary Maven downloads, and the uploaded source template.

- [ ] **Step 1: Write the README**

Lead with what the project does. Include prerequisites; `./mvnw spring-boot:run` and `mvnw.cmd spring-boot:run`; `npm run test:frontend`; `./mvnw test`; the `http://localhost:8080` URL; the in-memory reset warning; project structure; and Render steps: push to a Git repository, New Blueprint, select `render.yaml`, create the Docker service, wait for a healthy deploy, and open the assigned `onrender.com` URL.

- [ ] **Step 2: Run the complete verification matrix**

Run:

```bash
npm run test:frontend
./mvnw -q clean test package
"$CODEX_PRIMARY_RUNTIME_PYTHON" -m pytest -q tests/test_chapters_1_2_document.py
git diff --check
git status --short
```

Start the packaged JAR and rerun `scripts/smoke-test.mjs`. Rerender the final DOCX and inspect every page. Confirm the source template checksum still matches its pre-build value.

- [ ] **Step 3: Package the handoff**

Create `Student_Score_Management_System_Render.zip` from the verified repository state with the exclusions above. List the archive and confirm the required JAR source, static assets, wrapper, Dockerfile, `render.yaml`, README, and final DOCX are present.

- [ ] **Step 4: Commit**

```bash
git add README.md .gitignore Student_Score_Management_System_Render.zip
git commit -m "docs: add setup guide and final project package"
```

- [ ] **Step 5: Perform completion review**

Use `superpowers:verification-before-completion`, then `superpowers:requesting-code-review`. Resolve only verified findings, rerun affected tests, and report the final artifacts and any environment-limited check explicitly.
