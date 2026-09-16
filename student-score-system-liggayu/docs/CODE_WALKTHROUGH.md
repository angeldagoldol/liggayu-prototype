# Code walkthrough and study notes

**System title:** Student Score Management System Using Arrays  
**Website name:** ScoreDesk  
**Primary technique:** Array / Multidimensional Array

These notes explain the delivered implementation. They are not the institutionally formatted research paper.

## 1. Read the files in this order

Read `src/StudentStore.java` first: it contains the data structure and the important algorithms. Then read `web/index.html` for the screen layout, `web/app.js` for requests and display updates, and `web/styles.css` for screen/print styling. Read `src/StudentServer.java` last: its routing, request parsing and JSON encoding connect the first four files.

## 2. The arrays really store the data

The actual Java declarations are:

```java
public static final int MAX_STUDENTS = 100;
public static final int SCORE_COUNT = 3;
private final String[] studentNames = new String[MAX_STUDENTS];
private final double[][] studentScores = new double[MAX_STUDENTS][SCORE_COUNT];
private int studentCount = 0;
```

`studentNames[0]` belongs to the same student as `studentScores[0][0]`, `[0][1]` and `[0][2]`. The first index selects the student; the second selects a score. After loading sample data, row zero contains Ana Santos and `[91.00, 94.00, 100.00]`.

The arrays have room for 100 students, but loops only visit `0` through `studentCount - 1`. Unused slots must not be treated as students with zero averages. Human-facing report numbers start at 1; Java array indices start at 0.

No ArrayList or Map owns student records. A small Map in `StudentServer.readForm` is only a temporary parser for HTTP form fields, not the chosen storage technique.

## 3. Add a student: insertion

The `add` method checks the name, confirms that three scores exist, validates every score and checks capacity. It validates the complete record before modifying any array, preventing a bad third score from leaving a half-stored student.

```text
ADD_STUDENT(name, scoreInputs)
    validate name
    require exactly 3 score inputs
    validate all 3 scores: 0–100, maximum 2 decimals
    if studentCount equals 100: report "array is full"
    studentNames[studentCount] = trimmed name
    for j = 0 to 2:
        studentScores[studentCount][j] = validatedScores[j]
    studentCount = studentCount + 1
    return BUILD_REPORT()
```

## 4. Calculate the average: traversal

The mathematical rule is `(Score 1 + Score 2 + Score 3) / 3`. To make exact decimal ties reliable, Java first converts each valid score into hundredth-points. For example, 91.25 becomes 9125. It adds those integer values and divides the total by `100 × 3`, or 300.

```text
TOTAL_HUNDREDTHS(studentIndex)
    total = 0
    for j = 0 to 2:
        total = total + round(studentScores[studentIndex][j] × 100)
    return total

average = TOTAL_HUNDREDTHS(studentIndex) / 300.0
```

This produces the same equal-weight arithmetic mean while avoiding addition-order differences such as `0.1 + 0.2 + 0.3` versus `0.3 + 0.2 + 0.1`. Do not round the average before comparing students.

## 5. Find highest and lowest: compare every row

`getReport` first traverses occupied rows to compute totals, accumulate a class total and identify maximum/minimum totals. A second loop copies each record into a report row and sets its `highest`/`lowest` flags. Because every student has the same number of scores, comparing totals and comparing means gives the same ordering.

```text
BUILD_REPORT()
    if studentCount equals 0:
        return empty rows and null averages
    highestTotal = smallest possible integer
    lowestTotal = largest possible integer
    classTotal = 0
    for i = 0 to studentCount - 1:
        totals[i] = TOTAL_HUNDREDTHS(i)
        classTotal = classTotal + totals[i]
        if totals[i] > highestTotal: highestTotal = totals[i]
        if totals[i] < lowestTotal: lowestTotal = totals[i]
    for i = 0 to studentCount - 1:
        create a report row with copied name and scores
        average = totals[i] / 300.0
        highest = totals[i] equals highestTotal
        lowest = totals[i] equals lowestTotal
    classAverage = classTotal / (300.0 × studentCount)
    return rows, classAverage, highestTotal / 300.0, lowestTotal / 300.0
```

Both highest/lowest flags can be true: that is correct for a single student or a class where all averages are identical. Distinct exact averages may both display, for example, `90.00` after rounding; that alone is not a tie.

## 6. How the website talks to Java

```text
HTML form
  -> JavaScript captures the name and three score fields
  -> fetch sends form URL-encoded data to the local Java server
  -> StudentServer parses input and calls StudentStore.add
  -> StudentStore stores values in the arrays and builds a report
  -> StudentServer serializes the report as JSON
  -> JavaScript creates table cells, summary cards and the array view
  -> CSS controls screen layout and the printable report
```

| HTTP operation | Purpose |
|---|---|
| `GET /api/students` | Read a fresh report from the current Java arrays. |
| `POST /api/students` | Add a name and three scores; return the updated report. |
| `POST /api/sample` | Load six fictional records only when empty. |
| `POST /api/reset` | Clear the arrays after the website's confirmation dialog. |

The request fields are `name`, `score1`, `score2`, `score3`. Mutation requests use `X-ScoreDesk-Request: 1`. The response contains `count`, `capacity`, `scoreCount`, three nullable summary values and `students`. Each student row contains `index`, `name`, `scores`, `average`, `highest` and `lowest`.

JavaScript formats numbers to two decimal places, but does **not** recalculate averages or independently determine the highest/lowest. Student names are inserted with `textContent`, never interpreted as HTML.

## 7. A useful classroom demonstration

Start Java, open the website and load fictional sample data. Show that Ana Santos and Miguel Cruz both have 95.00 and are both Highest; Carlo Reyes has 70.00 and is Lowest. Expand Array view and match report record 1 with Java index `[0]`. Reset, add one student and explain why both labels appear. Try an invalid score and show that the student count does not increase. Reload the page to demonstrate that records still live in Java memory, then restart Java to demonstrate the stated session-only limitation.

## 8. Material for the later Prelim paper

The uploaded PDF's Chapter II headings can be grounded in the actual architecture, data flow and implemented features described here. Its Chapter III headings can use these array definitions, algorithm steps and code locations, accompanied by your own execution screenshots. The supplied images use fictional sample values and are visual references; they are not survey findings, performance experiments or actual student research data. Do not claim a database, permanent saving, user authentication, sorting, editing or features that this code does not implement.

Chapter I still needs your group's actual context, objectives and explanation of significance. Research participants, methods, measured benefits and school-specific practices cannot be inferred from this code. Chapters IV–VI are not part of this Prelim code deliverable.
