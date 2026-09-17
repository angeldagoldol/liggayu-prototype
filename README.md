# Student Score Management System

This project is a working web application for recording a student's three assessment scores, calculating the two-decimal average in Java, and reporting every student tied for the highest or lowest average. A Spring Boot service owns an in-memory `ArrayList<Student>`, exposes a small JSON API, and serves the responsive HTML, CSS, and JavaScript interface from the same process.

The handoff also includes the completed SJPIIC/CICT Chapter I-II paper and a Render Blueprint for deployment.

## Features

- Add a student name and exactly three assessment scores.
- Accept decimal scores from 0 through 100 and reject invalid requests without changing existing records.
- Preserve insertion order and allow duplicate student names.
- Calculate and round each arithmetic mean to two decimal places in Java.
- Identify every student tied for the highest or lowest reported average.
- Serve the interface and API from one Spring Boot application.
- Provide a responsive, keyboard-accessible interface with clear empty, success, and validation states.

The application does not include edit, delete, search, sort, rank, export, authentication, configurable grading, or a database.

## Prerequisites

- Java 17
- Node.js 20 or newer for the dependency-free frontend tests and smoke test
- Python 3 with `pytest`, `python-docx`, and Pillow only when rebuilding or testing the Word document
- Docker is optional and is needed only to reproduce the Render container locally

Maven 3.9.11 is included through the Maven Wrapper. The frontend uses only browser and Node.js built-ins, so there are no Node packages to install and no `npm install` step.

## Run locally

From the project root on macOS, Linux, or another POSIX shell:

```bash
./mvnw spring-boot:run
```

From Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

From Windows Command Prompt:

```bat
mvnw.cmd spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080) after the application starts. To use a different port in a POSIX shell, run `PORT=18080 ./mvnw spring-boot:run`. In PowerShell, run `$env:PORT=18080; .\mvnw.cmd spring-boot:run`.

> Records exist only in the running Java process's memory. Every application restart, Render restart, or Render redeploy permanently clears all entered student records.

## Build and test

Run the frontend test suite; it has no install step:

```bash
npm run test:frontend
```

Run all Java tests:

```bash
./mvnw test
```

On Windows, use:

```powershell
.\mvnw.cmd test
```

Run the complete Java test and packaging lifecycle:

```bash
./mvnw clean test package
```

The executable output is `target/app.jar`. Start that exact package with:

```bash
java -jar target/app.jar
```

With the packaged application running on the default port, exercise the real static and API routes:

```bash
node scripts/smoke-test.mjs http://127.0.0.1:8080
```

### Document workflow prerequisite

The document builder and its 27 structural tests are not self-contained in the ZIP. They intentionally require the instructor-provided source template, which is not redistributed in the handoff package. Before rebuilding or testing the document, create the `upload/` directory and copy your instructor-provided template to this exact path and filename:

`upload/DATA STRUCTURES AND ALGORITHMS MINI-SYSTEM PROJECT(format paper presentation) (1).docx`

With that external template in place and a Python environment containing the document dependencies, run:

```bash
python -m pytest -q tests/test_chapters_1_2_document.py
```

The application verification commands are self-contained in the ZIP:

```bash
npm run test:frontend
./mvnw clean test package
```

For the complete repository verification set, also run the document command above provided the external instructor template is present. In a Git checkout, finish with `git diff --check`. The final DOCX itself is included and does not require the source template to open or submit.

### Verification notes

- In the packaging environment, exact `./mvnw clean test package` was blocked before tests because the dependency proxy could not provide the uncached Maven clean plugin. After safely clearing only generated `target/` output, the equivalent `./mvnw test package` completed successfully with all 32 Java tests.
- Docker/Podman was unavailable, so the container image could not be built or run locally. The packaged JAR smoke test passed, and the Dockerfile and Render Blueprint were checked structurally.
- Public-URL browser viewport and interaction QA remains pending; complete the check described at the end of [Deploy to Render with the Blueprint](#deploy-to-render-with-the-blueprint) after Render assigns the public URL.

## API overview

All endpoints use JSON and share the same host and port as the interface.

| Method | Path | Result |
| --- | --- | --- |
| `GET` | `/api/students` | Returns the stored rows in insertion order. |
| `POST` | `/api/students` | Validates and stores `name`, `assessment1`, `assessment2`, and `assessment3`, then returns the updated report with HTTP 201. |
| `GET` | `/api/report` | Returns `students`, `highest`, and `lowest`; both summaries are `null` when no records exist. |

Example request:

```json
{
  "name": "Ana Cruz",
  "assessment1": 80,
  "assessment2": 90,
  "assessment3": 95
}
```

Successful report rows contain the original three scores plus the backend-calculated `average`. Validation failures return HTTP 400 with a general `message` and field-specific entries in `fieldErrors`.

## Project structure

```text
src/main/java/                    Spring Boot application, API, validation, and ArrayList service
src/main/resources/static/        HTML, CSS, browser JavaScript, and favicon
src/main/resources/application.properties
                                  PORT-aware server binding
src/test/java/                    Java unit and MockMvc integration tests
src/test/frontend/                Dependency-free Node.js frontend tests
tests/                            Word-document structural tests
scripts/smoke-test.mjs            Running-application acceptance test
scripts/build_chapters_1_2_docx.py
                                  Deterministic Chapter I-II document builder
assets/                           Verified school logo and generated flowchart
deliverables/                     Final Chapter I-II Word document
docs/superpowers/                 Approved design specification and implementation plan
Dockerfile                        Multi-stage production container
render.yaml                       Render Blueprint
```

## Final Word document

The completed paper is:

`deliverables/Implementation_of_ArrayList_in_a_Student_Score_Management_System_Chapters_I_II.docx`

Before submitting it, replace these five literal editable cover placeholders with the correct academic details:

1. `[Full Names of Group Members]`
2. `[Full Name]` for the group leader
3. `[Instructor's Name]`
4. `[Section Name/Code]`
5. `[Month, Day, Year]`

## Deploy to Render with the Blueprint

1. Push the complete project to a Git repository that Render can access.
2. Sign in to Render and select **New**, then **Blueprint**.
3. Connect the Git provider if needed and choose the repository containing this project.
4. Confirm that Render detects the repository-root `render.yaml` Blueprint.
5. Apply the Blueprint to create the Docker web service named `student-score-management-system`.
6. Wait for the image build, automated Maven tests, deployment, and `/api/report` health check to finish successfully.
7. Open the assigned public `https://…onrender.com` URL. Do not hard-code a port; Render supplies `PORT`, and the application binds to `0.0.0.0` automatically.
8. Add a few records, including tied averages and one invalid score, and confirm the table, highest/lowest summaries, and validation message update correctly.

Real-browser viewport and interaction QA must be rerun against that assigned public Render URL at 320x568, 375x667, 768x1024, 1024x768, and 1280x720, plus 1280x720 at 200% zoom. It was not completed locally because the approved controlled browser could not access private or localhost URLs; the automated suites and live local smoke test do not replace this public-URL browser check.
