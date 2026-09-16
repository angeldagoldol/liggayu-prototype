# ScoreDesk — Student Score Management System Using Arrays

An HTML/CSS/JavaScript website connected to a real Java backend. Updated for Render Docker hosting and Gmail link sharing. **This package is not an already-published website.**

## Four main features

1. Add up to 100 names and three scores per student using Java arrays.
2. Calculate each student's equally weighted average in Java.
3. Identify all students tied for the highest and lowest average.
4. Display a report table with print styling.

The original core storage remains `String[100]` and `double[100][3]` in `src/StudentStore.java`. The data structure is not replaced by a database. Scores must be 0–100, with at most two decimal places. Comparisons use exact hundredth-point totals to avoid false ties caused by display rounding.

## Deployment and Gmail sharing

Read **[DEPLOY_RENDER.md](DEPLOY_RENDER.md)** for the complete setup. The package includes a multi-stage `Dockerfile`, a `render.yaml` Blueprint, a health endpoint and trusted public-origin handling. Render reads the repository; it does not deploy the ZIP as a static website.

The website's **Share via Gmail** link prepares a compose URL containing the public website address. The user selects recipients and sends the email. **Copy link** provides a fallback. No Gmail credentials, API keys or SMTP service are needed. A link is not a saved copy of the current report.

## Run locally

Install a full JDK 17 or newer. On Windows, run `run.bat`. On macOS/Linux:

```sh
sh run.sh
```

Open `http://localhost:8080`. Keep the Java process running. An optional port argument overrides `PORT`; otherwise the server uses `PORT` when set, or 8080. Gmail sharing is disabled until a public HTTPS origin is configured.

## Files

| File | Responsibility |
| --- | --- |
| `src/StudentStore.java` | Arrays, insertion, validation, averages, extrema, report snapshot |
| `src/StudentServer.java` | HTTP routes, platform settings, trusted origins, JSON responses |
| `web/index.html` | Form, table, array view, sharing controls |
| `web/styles.css` | Responsive screen and print layouts |
| `web/app.js` | Form handling, Java requests and page updates |
| `web/share.js` | Public-link validation and Gmail compose URL generation |
| `Dockerfile` | Compile/test Java, then run it as a non-root user |
| `render.yaml` | One free Docker web service with `/health` checks |
| `DEPLOY_RENDER.md` | Deployment, Gmail sharing and limits |
| `docs/CODE_WALKTHROUGH.md` | Original algorithm explanation plus hosting addendum |
| `docs/VERIFICATION.md` | Tests actually run and verification limitations |

## API

`GET /api/students` returns the report. `POST /api/students` inserts one name and three scores. `POST /api/sample` loads six fictional records only into an empty report. `POST /api/reset` clears the shared arrays. `GET /health` and `HEAD /health` are data-free health checks.

POST requests require URL-encoded forms and `X-ScoreDesk-Request: 1`. Browser mutation origins must match the configured origins. These checks help reject cross-origin browser requests; **they are not user authentication**. Reports include `publicUrl` and `publicDemo` for the sharing controls and the public-demo warning.

## Important limits

All visitors share one temporary report, and anyone with the public link can change it. There is no login, user isolation, database, durable saving, audit trail or production-grade abuse protection. Use fictional records only. Stopping/restarting Java, redeploying or resetting the report clears the arrays. Free-hosting idle shutdowns can also clear them.

## Tests

Java core tests need only the JDK:

```sh
sh test.sh
```

Optional regression tests, after compilation:

```sh
python3 -m unittest discover -s tests -p test_http.py -v
python3 tests/test_render.py
node --test tests/test_share.cjs
```

Optional UI tests require Python Playwright and Chromium; neither is needed by the website itself:

```sh
python3 -m pip install playwright
python3 -m playwright install chromium
python3 -m unittest discover -s tests -p test_browser.py -v
```

For environments that prohibit browser navigation, `SCOREDESK_IN_MEMORY_UI=1` renders the project's own page source and bridges its requests to the real local Java process. This is a partial verification mode, not proof of a live Render deployment. See the verification notes.

## Course documentation

The research paper is not included. Review and customize the code as a group before submission. The supplied examination asks for Chapters I–III at Prelim and expects members to explain their implementation. Keep later documentation aligned with the actual temporary shared-storage behavior; do not describe a database, login or permanent saving that this code does not implement.
