# Student Score Management System Design

## Purpose

The project is a beginner-friendly web-based Student Score Management System for the Data Structures and Algorithms Mini-System Project. It demonstrates how a Java `ArrayList` can store a flexible number of student records and how simple traversal algorithms can calculate averages and identify the highest and lowest scorer.

The finished submission has two matching deliverables:

1. A working Java, HTML, CSS, and JavaScript prototype that can be deployed to Render.
2. A Word document following the supplied SJPIIC/CICT format and containing only Chapter I and Chapter II.

## Scope

### Included

- Add a student's name and three fixed assessment scores.
- Store each student as a Java object inside an `ArrayList<Student>`.
- Calculate each student's average from Assessment 1, Assessment 2, and Assessment 3.
- Identify the highest and lowest scorer by average.
- Show all student records in a formatted report table.
- Show every student involved when two or more averages tie for highest or lowest.
- Validate required fields and scores from 0 through 100.
- Provide a responsive interface for desktop and mobile browsers.
- Include Render deployment configuration and setup instructions.
- Complete the cover page, table of contents, Chapter I, Chapter II, flowchart, and bottom page numbering in the documentation.

### Excluded

- Database storage or accounts.
- Login and authentication.
- Editing, deleting, sorting, searching, ranking, or exporting student records.
- Weighted grading or configurable assessment categories.
- Chapters III through VI, references, and appendices.

Because no database is included, records exist only in the Java application's memory and reset whenever the Render service restarts or redeploys.

## Architecture

The project uses one Spring Boot application so the prototype can run as one Render web service.

- The browser loads the static HTML, CSS, and JavaScript files from Spring Boot.
- JavaScript submits student data to a small JSON REST API.
- The Java service validates the data and appends a `Student` object to an in-memory `ArrayList`.
- The Java service traverses the list to calculate the report and highest and lowest results.
- The API returns JSON, and JavaScript updates the report table and summary without reloading the page.

This single-service design keeps deployment simple and ensures the Java data structure is the actual core of the working prototype rather than a separate demonstration.

## Data Model

Each `Student` record contains:

- `name`: required text after trimming surrounding spaces.
- `assessment1`: number from 0 to 100.
- `assessment2`: number from 0 to 100.
- `assessment3`: number from 0 to 100.
- `average`: derived as `(assessment1 + assessment2 + assessment3) / 3` and displayed to two decimal places.

The service stores records as `List<Student> students = new ArrayList<>();`. Service methods synchronize access so overlapping web requests cannot corrupt the list. Duplicate names are allowed because different students can share the same name.

## API Design

### `GET /api/students`

Returns the current student records and their calculated averages in insertion order.

### `POST /api/students`

Accepts a name and the three assessment scores. On valid input, it stores the student and returns the updated report. On invalid input, it returns a clear client error without changing the list.

### `GET /api/report`

Returns the records plus the highest and lowest average values and all names tied at either value. For an empty list, the student collection is empty and the highest and lowest summaries are absent.

## Interface Design

The application opens directly on the working student-score surface.

- A compact header identifies the Student Score Management System.
- The entry form contains Student Name, Assessment 1, Assessment 2, Assessment 3, and Add Student.
- The report table contains number, student name, the three scores, and average.
- Two summary panels display Highest Scorer and Lowest Scorer.
- Before the first record is added, the table area explains that no student records are available.
- Success and validation feedback appears next to the form and is announced accessibly.
- On desktop, the form and report share the first viewport; on mobile, they stack without horizontal page scrolling, while the table itself can scroll if needed.

The visual direction is a clean academic interface using the school's blue and gold as restrained accents, readable typography, clear table hierarchy, and no decorative imagery.

## Processing Flow

1. The user enters a student name and three scores.
2. The browser checks that all fields are present and submits the values.
3. Java validates the name and score range.
4. Java creates a `Student` object and adds it to the `ArrayList`.
5. Java calculates every stored student's average.
6. Java traverses the records to determine the highest and lowest average, including ties.
7. The backend returns the updated report.
8. JavaScript renders the table and summary panels.

## Error Handling

- Blank names are rejected.
- Missing, nonnumeric, negative, or above-100 scores are rejected.
- Invalid requests return a concise field-specific message and do not alter stored records.
- Network or server failures show a recoverable message while preserving the form values.
- The empty dataset is handled as a normal state, not an error.

## Documentation Design

The supplied Word template is the formatting reference. The final document is a new completed copy so the original remains unchanged.

### Front Matter

- Official SJPIICD logo centered at the top of the cover.
- Study title: `Implementation of ArrayList in a Student Score Management System`.
- Editable cover details for researchers, group leader, instructor, section, and submission date when exact information has not been supplied.
- A table of contents containing only Chapter I and Chapter II.
- Page numbers centered at the bottom of content pages; the cover remains unnumbered.

### Chapter I Introduction

- `1.1 Background of the Study`: explains the student-score problem, the flexible storage provided by `ArrayList`, and the use of traversal for calculations.
- `1.2 Objectives of the Study`: states the goals of building the prototype, applying `ArrayList`, calculating results accurately, observing its operation, and identifying improvements.
- `1.3 Significance of the Study`: explains value to students, instructors, beginner programmers, and the researchers' understanding of data structures.

### Chapter II System Overview and Design

- `2.1 System Description`: describes the Java web application, inputs, processing, and formatted output.
- `2.2 System Architecture or Flowchart`: contains a vertical flowchart matching the implemented input-validation-storage-calculation-report sequence and a prose explanation of input, process, and output.
- `2.3 System Features`: enumerates only the functions present in the prototype.

## Testing Strategy

- Unit tests verify average calculations, high and low selection, tie handling, and empty-list behavior.
- Validation tests cover blank names, missing scores, nonnumeric JSON values, and values outside 0 through 100.
- API tests verify successful additions and error responses.
- Browser checks verify form submission, report updates, empty state, feedback, keyboard use, and responsive layouts.
- The Word document is rendered to page images and every page is visually checked for correct logo placement, hierarchy, flowchart clarity, page numbering, clipping, and spacing.

## Render Deployment

- Maven produces an executable Spring Boot JAR.
- The server reads Render's `PORT` environment variable and defaults to port 8080 locally.
- A Dockerfile and `render.yaml` make deployment repeatable.
- A README gives local run, test, and Render deployment steps.

## Acceptance Criteria

The project is complete when:

1. A user can add any number of students during one running session.
2. Each accepted record shows the three original scores and the correct two-decimal average.
3. The highest and lowest summaries update after every addition and handle ties correctly.
4. Invalid records are rejected with an understandable message.
5. The application builds and its automated tests pass.
6. The application starts using Render's assigned port and serves the interface and API from one service.
7. The Word document follows the supplied format, matches the prototype, and stops after Chapter II.
8. The final package contains the complete source code, deployment files, README, and completed Word document.
