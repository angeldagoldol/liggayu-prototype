# ScoreDesk
## Student Score Management System Using Arrays

A CC104 classroom prototype using **HTML, CSS, JavaScript and Java**. The Java backend actually stores the student records in arrays and calculates the report. There is no JavaScript-only replacement disguised as a Java project.

### Run the website

Extract the complete project folder first. Install a **full JDK 17 or newer**, with both `java` and `javac` available in your terminal. This is a computer-run local project, not a hosted website or an iPhone Java app.

**Windows:** double-click `run.bat`, or run it from Command Prompt.  
**macOS/Linux:** open a terminal in this folder and run:

```sh
sh run.sh
```

Keep the terminal open and visit **http://localhost:8080** in a browser. Do not open `index.html` directly or use a separate Live Server port; the Java server serves the website and its API together.

No Maven, Spring, Tomcat, database, Node.js, npm, Python or internet connection is required to run the project after the JDK is installed. Python is used only by optional supplementary tests.

Check the JDK:

```sh
java -version
javac -version
```

If port 8080 is occupied, use `run.bat 8081` on Windows or `sh run.sh 8081` on macOS/Linux, then open `http://localhost:8081`. Press **Ctrl+C** in the server terminal to stop.

### The four requested features

| Requirement | Implementation |
|---|---|
| Add student names and scores using arrays | `String[100] studentNames` and `double[100][3] studentScores`, connected by the same index. |
| Calculate each student's average | Java traverses three scores and computes their equal-weight arithmetic mean. |
| Find highest and lowest scorer | Java compares exact hundredth-point totals and marks **every** tied student. |
| Display a simple formatted report | A browser table displays names, three scores, averages and highest/lowest labels; print CSS creates a paper report. |

The dashboard also shows class average, capacity, fictional sample data, a confirmed reset and a view of occupied array rows. The sample button is disabled when records exist, so it does not overwrite your work. Reloading the page retrieves the same Java-session data.

### Rules and limitations

This prototype accepts 100 students, each with exactly three equally weighted scores from 0 to 100 and at most two decimal places. Names are trimmed, limited to 80 characters, and must not be blank or contain control characters. Duplicate names are allowed as separate records; row numbers distinguish them.

The highest and lowest are based on each student's **average**, not their single best or worst assessment. All exact ties share the label. One student is both highest and lowest; everyone receives both labels if all averages are equal. An empty report shows dashes, not invented zero averages. Averages are displayed to two decimals, but comparisons happen before display rounding. Two different averages can therefore display the same rounded number without being an exact tie.

**All records are temporary.** Stopping/restarting the Java server or choosing Reset all clears them. There is no database, permanent file saving, login, individual record editing/removal, subject weighting, pass/fail rule or public deployment. The server listens only on this computer, at 127.0.0.1. Use fictional data for demonstrations. This is not a production school information system.

### Sample results

All sample names and scores are fictional.

| Student | Score 1 | Score 2 | Score 3 | Average | Standing |
|---|---:|---:|---:|---:|---|
| Ana Santos | 91 | 94 | 100 | 95.00 | Highest |
| Beatriz Dela Cruz | 78 | 82 | 80 | 80.00 | — |
| Miguel Cruz | 100 | 90 | 95 | 95.00 | Highest |
| Carlo Reyes | 68 | 70 | 72 | 70.00 | Lowest |
| Sofia Garcia | 88 | 90 | 92 | 90.00 | — |
| Luis Mendoza | 80 | 85 | 90 | 85.00 | — |

Expected class average: **85.83**, highest: **95.00**, lowest: **70.00**.

### Project files

```text
student-score-system/
  START_HERE.txt
  README.md
  run.bat / run.sh
  test.bat / test.sh
  web/
    index.html
    styles.css
    app.js
  src/
    StudentStore.java
    StudentServer.java
  tests/
    StudentStoreTest.java
    test_http.py
    test_browser.py
  docs/
    CODE_WALKTHROUGH.md
    VERIFICATION.md
    screenshots/
      dashboard.png
      array-view.png
      mobile.png
      print-report.png
```

The launch scripts create `build/` automatically. The source archive intentionally does not include precompiled `.class` files.

### Manual compilation

From the project root, make `build/`, then:

```sh
javac --release 17 --add-modules jdk.httpserver -encoding UTF-8 -d build src/StudentStore.java src/StudentServer.java
java --add-modules jdk.httpserver -cp build StudentServer
```

Forward slashes also work for these Java file arguments on Windows. The server uses the JDK's `HttpServer`; JavaScript sends form data with `fetch` and receives JSON. HTML, CSS and JavaScript run in the browser, while Java runs as a separate server process.

### Test the algorithms

**Windows:** run `test.bat` from Command Prompt.  
**macOS/Linux:** run `sh test.sh`.

The core suite uses only Java. Optional HTTP verification, after compilation:

```sh
python3 tests/test_http.py
```

Optional browser tests require Python Playwright and Chromium:

```sh
python3 -m pip install playwright
python3 -m playwright install chromium
python3 tests/test_browser.py
```

On Windows, use `python` instead of `python3` where appropriate. `CHROMIUM_PATH` can select an existing Chromium executable. The browser test script also contains a documented in-memory rendering mode for environments that block URL navigation; that mode is not equivalent to a native browser-to-server end-to-end test. See `docs/VERIFICATION.md` for the actual checks performed here.

### Printing

Choose **Print report**. The form, navigation and array inspector are hidden; the table, summary and tie explanation remain. The print stylesheet uses **Letter / short bond paper (8.5 × 11 inches), portrait**, with 12 mm margins. Disable your browser's optional headers and footers for a cleaner output. Save as PDF is available through browsers that provide that destination. Do not treat the fictional sample report as real student evidence.

### Connection to the supplied CC104 PDF

The basis is the uploaded **CC104 Preliminary Laboratory Examination — Proposed System**, S.Y. 2026–2027, Saint John Paul II College of Davao.

- Page 2, Instructions 2–4: reserve one technique, make it the core, and demonstrate working operations on sample data. This implementation makes parallel name/score arrays the core and exposes insertion, traversal and comparison in the array view.
- Page 3, Technique Bank: **Array / Multidimensional Array** supports fixed-size record storage.
- Page 2, Instruction 6: the later Prelim documentation should contain the Cover Page and **Chapter I – Introduction**, **Chapter II – System Overview and Design**, and **Chapter III – Algorithm Description** with prototype screenshots. This package supplies study notes and screenshots, **not a completed research paper or Chapters IV–VI**.
- Page 2, Instructions 7–8: submit the compressed source folder as `CC104_Prelim_Prototype_Group[No.]_[Section].zip`, and ensure every member can run and explain it. Replace the group and section parts with your real details.

The 100-student capacity, three equal-weight scores, two-decimal input rule and session-only storage are **this project's implementation decisions**, not extra rules stated in the PDF. Confirm that your instructor has reserved arrays for your group. Review, adapt and understand this AI-assisted starting implementation; follow your instructor's academic-integrity rules rather than representing generated code as unaided work.

### Technical references used for implementation

These are programming references, not a substitute for the later paper's literature review:

- Oracle, Java SE 17 `HttpServer`: https://docs.oracle.com/en/java/javase/17/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html
- MDN, Using the Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
