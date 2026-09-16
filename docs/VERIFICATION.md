# Verification — Render and Gmail update

## Results from this preparation session

| Check | Observed result |
| --- | --- |
| Java core tests, `sh test.sh` | 26 passed |
| Local HTTP tests, `tests/test_http.py` | 27 passed |
| Render-configuration HTTP tests, `tests/test_render.py` | 13 passed |
| Gmail-link unit checks, `node --test tests/test_share.cjs` | 5 passed |
| Chromium UI suite in the in-memory test mode | 16 passed; 1 direct-file navigation test skipped |
| Configured-public-mode UI preview using the real Java backend | Passed; Gmail control enabled with the example configured URL |
| JavaScript syntax checks | app.js and share.js passed |
| render.yaml parse and configuration assertions | Passed; one Free Docker web service, /health, commit-triggered deploys |

Java was compiled with `--release 17` using OpenJDK 21.0.11 on Linux. Runtime dependencies remain the Java standard library only. The unchanged StudentStore file was compared byte-for-byte with the original project.

## What was exercised

The regression suite checks the platform PORT variable, wildcard listening, the configured Render HTTPS host/origin, a data-free health route, rejection of untrusted hosts and origins, validation errors, public URL metadata and real Java averages. The unchanged tests cover ties, zero/100 boundaries, invalid input, array capacity, reset, Unicode/text rendering and unchanged state after rejected input.

The sharing checks verify the Gmail compose URL's subject/body, no preselected recipients or automatic sending, exclusion of names/scores/query strings from the email, disabled localhost sharing, new-tab safety attributes, copy-link fallback, and hiding controls when printing.

The original code first failed the new platform-port and sharing checks. Those tests then passed after the implementation. During verification, a Linux socket test was corrected to recognize Java's IPv6 dual-stack wildcard socket as well as an IPv4 wildcard socket; the app already accepted IPv4 traffic on the configured port.

## Limits — these are not live-deployment results

- Docker is not installed in this execution environment. The Dockerfile was reviewed and its Java compile/test steps were executed locally, but an actual Docker image build has not been performed here.
- No ScoreDesk Render service has been created and no live ScoreDesk URL has been verified. Simulated Render environment variables do not prove a successful Render deployment.
- Browser navigation to HTTP/file URLs is blocked by an administrator policy here. That policy was not changed. The alternate test mode renders this project's own HTML/CSS/JavaScript source in memory and bridges only its local API to the real Java process. Direct browser routing, TLS and live Render connectivity still need a check after deployment.
- Gmail authentication, its live compose interface and email delivery were not exercised. Only the generated sharing URLs and local controls were checked. No emails were sent.
- Windows and macOS launcher scripts were not tested on those operating systems.
- No load test, independent security audit, user authentication, persistent database or per-user isolation is included. Treat this as a public classroom demo with fictional information, not a production record system.

## Screenshots

`dashboard.png`, `mobile.png`, `array-view.png` and `print-report.png` show the updated application in local mode, using fictional sample data.

`render-sharing-preview.png` and `render-sharing-mobile-preview.png` show a **local preview** configured with `https://scoredesk.example/`. That is an example address, **not an assigned or live website URL**. The link metadata in that preview was supplied by the actual running Java backend. Use `python3 tests/capture_public_preview.py` to reproduce that preview in the in-memory rendering mode.

## External account status

The connected GitHub account exposed an existing unrelated repository, which was left unchanged. Existing Render services were also left unchanged. New source publishing awaits a separate authorized repository. The available Render creation action documents that it does not support Docker service creation; use the Render dashboard or included Blueprint to create the Java service.
