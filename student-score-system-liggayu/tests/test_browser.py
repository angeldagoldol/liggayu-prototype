"""Optional end-to-end tests. Requires Python Playwright and a Chromium installation.
Install test-only dependencies: python -m pip install playwright; playwright install chromium
The website itself does not need Python, Playwright, npm or a browser extension.
"""
import json
import os
import re
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class BrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            cls.port = sock.getsockname()[1]
        cls.base = f"http://127.0.0.1:{cls.port}"
        cls.log = tempfile.TemporaryFile(mode="w+")
        cls.server = subprocess.Popen(["java", "--add-modules", "jdk.httpserver", "-cp", "build",
                                       "StudentServer", str(cls.port)], cwd=ROOT, stdout=cls.log, stderr=cls.log)
        for _ in range(80):
            try:
                urllib.request.urlopen(cls.base + "/api/students", timeout=.2).close()
                break
            except (OSError, urllib.error.URLError):
                time.sleep(.05)
        else:
            cls.server.terminate()
            raise AssertionError("Java server did not start")
        cls.playwright = sync_playwright().start()
        executable = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium") or shutil.which("google-chrome")
        options = {"headless": True}
        if executable:
            options["executable_path"] = executable
        cls.browser = cls.playwright.chromium.launch(**options)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.log.close()

    def setUp(self):
        req = urllib.request.Request(self.base + "/api/reset", data=b"", method="POST", headers={
            "X-ScoreDesk-Request": "1", "Content-Type": "application/x-www-form-urlencoded"})
        urllib.request.urlopen(req, timeout=5).close()
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1100}, device_scale_factor=1)
        self.page = self.context.new_page()
        self.page.set_default_timeout(4000)
        self.js_errors = []
        self.page.on("pageerror", lambda error: self.js_errors.append(str(error)))
        self.in_memory = os.environ.get("SCOREDESK_IN_MEMORY_UI") == "1"
        if self.in_memory:
            # Restricted rendering environments may prohibit all URL navigation.
            # Do not alter browser policy. Render our own source in memory and
            # bridge ONLY this prototype's API to its actual running Java process.
            self.page.expose_function("scoredeskTestHttp", self.forward_local_request)
        self.load_page()

    def forward_local_request(self, path, options):
        if path not in ("/api/students", "/api/sample", "/api/reset"):
            raise ValueError("The test bridge accepts only this prototype's local API.")
        data = options.get("body")
        req = urllib.request.Request(self.base + path,
            data=data.encode("utf-8") if data is not None else None,
            method=options.get("method", "GET"), headers=options.get("headers", {}))
        try:
            response = urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return {"status": response.status, "body": response.read().decode("utf-8"),
                    "headers": {"Content-Type": response.headers.get("Content-Type", "application/json")}}

    def load_page(self):
        if not self.in_memory:
            self.page.goto(self.base)
            return
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        html = re.sub(r'<link rel="stylesheet"[^>]*>', '', html)
        html = re.sub(r'<script src="app.js" defer></script>', '', html)
        self.page.set_content(html)
        self.page.add_style_tag(content=(ROOT / "web" / "styles.css").read_text(encoding="utf-8"))
        self.page.evaluate("""() => { window.fetch = async (path, options = {}) => {
            if (window.scoredeskTestOffline) throw new TypeError('Simulated transport failure');
            const result = await window.scoredeskTestHttp(path, {
                method: options.method || 'GET', headers: options.headers || {},
                body: options.body == null ? null : String(options.body)
            });
            return new Response(result.body, {status: result.status, headers: result.headers});
        }; }""")
        self.page.add_script_tag(content=(ROOT / "web" / "app.js").read_text(encoding="utf-8"))

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.js_errors, [], "No uncaught JavaScript errors")

    def ready(self):
        expect(self.page.locator("#connection-label")).to_have_text("Java connected")

    def add(self, name="Ana Santos", scores=(80, 90, 100)):
        self.ready()
        self.page.get_by_label("Student name", exact=True).fill(name)
        for j, value in enumerate(scores, start=1):
            self.page.get_by_label(f"Score {j}", exact=True).fill(str(value))
        self.page.get_by_role("button", name="Add student", exact=True).click()

    def test_empty_report_has_real_connected_state(self):
        expect(self.page.get_by_role("heading", name="Student score manager", exact=True)).to_be_visible()
        self.ready()
        expect(self.page.locator("#student-count")).to_have_text("0")
        expect(self.page.locator("#class-average")).to_have_text("—")
        expect(self.page.locator("#empty-state")).to_be_visible()
        expect(self.page.locator("#print-btn")).to_be_disabled()
        expect(self.page.locator("#sample-btn")).to_be_enabled()

    def test_add_updates_the_report_and_array_view(self):
        self.add()
        expect(self.page.locator("#student-count")).to_have_text("1")
        expect(self.page.locator("#student-rows tr")).to_have_count(1)
        expect(self.page.locator("#class-average")).to_have_text("90.00")
        expect(self.page.locator("#student-rows")).to_contain_text("Ana Santos")
        expect(self.page.locator("#array-rows")).to_contain_text("Ana Santos")
        expect(self.page.locator("#array-rows")).to_contain_text("80.00, 90.00, 100.00")
        expect(self.page.locator("#student-rows .badge-highest")).to_have_count(1)
        expect(self.page.locator("#student-rows .badge-lowest")).to_have_count(1)
        expect(self.page.get_by_label("Student name", exact=True)).to_have_value("")

    def test_sample_data_shows_every_tie(self):
        self.ready()
        self.page.locator("#sample-btn").click()
        expect(self.page.locator("#student-rows tr")).to_have_count(6)
        expect(self.page.locator("#class-average")).to_have_text("85.83")
        expect(self.page.locator("#highest-average")).to_have_text("95.00")
        expect(self.page.locator("#lowest-average")).to_have_text("70.00")
        expect(self.page.locator("#highest-names")).to_contain_text("Ana Santos")
        expect(self.page.locator("#highest-names")).to_contain_text("Miguel Cruz")
        expect(self.page.locator("#student-rows .badge-highest")).to_have_count(2)
        expect(self.page.locator("#student-rows .badge-lowest")).to_have_count(1)
        expect(self.page.locator("#sample-btn")).to_be_disabled()

    def test_invalid_score_and_missing_score_not_submitted(self):
        self.ready()
        self.page.get_by_label("Student name", exact=True).fill("Ana")
        self.page.get_by_label("Score 1", exact=True).fill("101")
        self.page.get_by_label("Score 2", exact=True).fill("90")
        self.page.get_by_role("button", name="Add student", exact=True).click()
        self.assertFalse(self.page.locator("#student-form").evaluate("form => form.checkValidity()"))
        expect(self.page.locator("#student-count")).to_have_text("0")

    def test_whitespace_name_gets_a_visible_error(self):
        self.add(name="   ")
        expect(self.page.locator("#feedback")).to_contain_text("student name")
        expect(self.page.locator("#student-count")).to_have_text("0")

    def test_html_like_names_render_as_text_not_markup(self):
        name = '<img src=x onerror="alert(1)"> José 李'
        self.add(name=name)
        expect(self.page.locator("#student-rows")).to_contain_text(name)
        expect(self.page.locator("#student-rows img")).to_have_count(0)
        expect(self.page.locator("#array-rows img")).to_have_count(0)

    def test_page_reload_keeps_server_records(self):
        self.add()
        expect(self.page.locator("#student-count")).to_have_text("1")
        self.page.reload()
        if self.in_memory:
            self.load_page()
        self.ready()
        expect(self.page.locator("#student-count")).to_have_text("1")

    def test_reset_can_be_cancelled(self):
        self.add()
        expect(self.page.locator("#student-count")).to_have_text("1")
        self.page.once("dialog", lambda dialog: dialog.dismiss())
        self.page.locator("#reset-btn").click()
        expect(self.page.locator("#student-count")).to_have_text("1")

    def test_confirmed_reset_clears_table_and_summaries(self):
        self.add()
        expect(self.page.locator("#student-count")).to_have_text("1")
        self.page.once("dialog", lambda dialog: dialog.accept())
        self.page.locator("#reset-btn").click()
        expect(self.page.locator("#student-count")).to_have_text("0")
        expect(self.page.locator("#student-rows tr")).to_have_count(0)
        expect(self.page.locator("#highest-average")).to_have_text("—")
        expect(self.page.locator("#sample-btn")).to_be_enabled()

    def test_print_button_and_print_styles(self):
        self.add()
        expect(self.page.locator("#student-count")).to_have_text("1")
        self.page.evaluate("() => { window.testPrintCalled = false; window.print = () => { window.testPrintCalled = true; }; }")
        self.assertFalse(self.page.evaluate("window.testPrintCalled"))
        self.page.locator("#print-btn").click()
        self.assertTrue(self.page.evaluate("window.testPrintCalled === true"))
        expect(self.page.locator("#print-date")).not_to_be_empty()
        self.page.emulate_media(media="print")
        expect(self.page.locator("#entry-panel")).to_be_hidden()
        expect(self.page.locator("#sidebar")).to_be_hidden()
        expect(self.page.locator("#array-section")).to_be_hidden()
        expect(self.page.locator("#student-table")).to_be_visible()

    def test_mobile_layout_does_not_overflow_page(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.ready()
        self.page.locator("#sample-btn").click()
        expect(self.page.locator("#student-count")).to_have_text("6")
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))
        expect(self.page.get_by_role("button", name="Add student", exact=True)).to_be_visible()

    def test_offline_message_and_reconnection(self):
        self.ready()
        if self.in_memory:
            self.page.evaluate("window.scoredeskTestOffline = true")
        else:
            self.page.route("**/api/**", lambda route: route.abort())
        self.page.locator("#refresh-btn").click()
        expect(self.page.locator("#connection-label")).to_have_text("Java offline")
        expect(self.page.locator("#feedback")).to_contain_text("Java server")
        expect(self.page.locator("#submit-btn")).to_be_disabled()
        if self.in_memory:
            self.page.evaluate("window.scoredeskTestOffline = false")
        else:
            self.page.unroute("**/api/**")
        self.page.locator("#refresh-btn").click()
        self.ready()
        expect(self.page.locator("#submit-btn")).to_be_enabled()

    def test_opening_html_directly_explains_java_requirement(self):
        if self.in_memory:
            self.skipTest("Direct file navigation is not available in the in-memory rendering mode.")
        self.page.goto((ROOT / "web" / "index.html").as_uri())
        expect(self.page.locator("#feedback")).to_contain_text("Start the Java server")
        expect(self.page.locator("#submit-btn")).to_be_disabled()

    def test_capture_actual_demo_screenshots(self):
        self.ready()
        self.page.locator("#sample-btn").click()
        expect(self.page.locator("#student-count")).to_have_text("6")
        output = ROOT / "docs" / "screenshots"
        output.mkdir(parents=True, exist_ok=True)
        self.page.evaluate("() => { document.activeElement.blur(); window.scrollTo({top: 0, left: 0, behavior: 'instant'}); }")
        self.page.screenshot(path=str(output / "dashboard.png"), full_page=True)
        self.page.locator("#array-section").screenshot(path=str(output / "array-view.png"))
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.evaluate("() => { document.activeElement.blur(); window.scrollTo({top: 0, left: 0, behavior: 'instant'}); }")
        self.page.screenshot(path=str(output / "mobile.png"), full_page=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
