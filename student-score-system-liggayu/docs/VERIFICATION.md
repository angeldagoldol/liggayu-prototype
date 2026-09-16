# Verification record

Verified on 16 September 2026. These are software checks of this prototype, not research results or measurements of educational effectiveness.

## Environment

- Linux (Debian environment)
- OpenJDK 21.0.11, compiled with `--release 17` and the `jdk.httpserver` module
- Chromium 144.0.7559.96, driven by Python Playwright
- JavaScript syntax checked with Node.js 22.16.0; Node.js is not needed to run the website

## Executed checks

| Area | Actual result |
|---|---|
| Clean Java compilation and core algorithms | **26 tests passed, 0 failed.** |
| Real Java HTTP endpoints and static assets | **27 tests passed, 0 failed.** |
| Chromium UI tests, in-memory rendering with a real Java API transport bridge | **13 tests passed; 1 direct-file-navigation test skipped.** |
| JavaScript syntax | `node --check web/app.js` passed. |
| Shell script syntax | `sh -n run.sh test.sh` passed. |
| Sample print rendering | Six fictional rows fit one Letter page; names, summaries and tie labels verified. |
| Full-capacity print rendering | All 100 rows appear across five Letter pages, with repeated table headings. |
| Visual inspection | Desktop, mobile and printable report images inspected. |

The Java tests cover empty data, insertion, trimming, three-score averages, repeating decimals, all extrema/ties, exact decimal totals, equal-looking rounded values, 0 and 100, invalid values, Unicode whitespace, names and control characters, atomic validation, duplicates, snapshot isolation, capacity and reset. The HTTP tests exercise the actual Java process, including input errors, JSON escaping, incorrect methods, source-file protection, body limits, origin/header checks, capacity and concurrent insertions.

UI checks exercise actual form events and report rendering: add, sample data, every tied student, invalid/missing scores, whitespace names, HTML-like names treated as text, reloading the view while retaining Java records, cancelling/confirming reset, offline messaging and reconnection, mobile page width, print-button invocation and print CSS.

## Important browser-test limitation

This environment's Chromium policy prohibits URL navigation. The browser policy was not changed or bypassed. For UI verification, the project's HTML, CSS and JavaScript were rendered in an in-memory document. A **test-only** transport bridge forwarded the page's API requests to the actual running local Java server and returned its real HTTP responses. The score calculations were not mocked or duplicated in JavaScript.

This confirms the UI behavior against the Java backend through that bridge, but it is **not a native browser-to-localhost end-to-end test**. The one `file://` navigation test was skipped in this mode. Static HTML/CSS/JavaScript serving and relative asset paths were checked through real HTTP separately. The ordinary browser test mode remains in `tests/test_browser.py` for running on a computer that permits local navigation. No bridge is included in the production website's HTML, CSS or JavaScript.

## Platform and printing limitations

Windows `.bat` scripts and macOS execution were not run natively in this Linux environment. The shell launcher and Java compilation were executed on Linux. The project targets JDK 17 APIs, but the actual runtime used here was JDK 21. A physical printer and Safari/Firefox were not tested. Printed PDF output was rendered in Chromium and inspected with a PDF renderer.

Run the extracted project on the actual demonstration computer before presenting. Verify its installed JDK, chosen port, browser and print settings. The project has not been deployed to a public website, and no security certification or production-readiness claim is made.

## Reproduce the checks

```sh
sh test.sh
python3 tests/test_http.py
python3 tests/test_browser.py
```

The final command uses a normal local browser connection by default. Only for a restricted rendering environment that requires the documented alternative:

```sh
SCOREDESK_IN_MEMORY_UI=1 python3 tests/test_browser.py
```

The screenshots use fictional sample data, not real student records. They show the actual interface rendered with real responses from the Java backend. Use your group's own execution screenshots for your classroom submission when required.

## Clean-archive smoke test

The source ZIP was extracted into a fresh directory whose path contains spaces. Its `sh test.sh` passed all 26 Java tests. Its `sh run.sh` compiled from source, served the actual HTML through localhost, and accepted an HTTP student insertion returning the expected Java average of 90.00. The test process was then stopped.
