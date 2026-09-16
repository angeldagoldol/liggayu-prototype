"""Optional standard-library HTTP tests. Requires the compiled Java project, not pip."""
import concurrent.futures
import json
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            cls.port = sock.getsockname()[1]
        cls.base = f"http://127.0.0.1:{cls.port}"
        cls.log = tempfile.TemporaryFile(mode="w+")
        cls.server = subprocess.Popen(
            ["java", "--add-modules", "jdk.httpserver", "-cp", "build", "StudentServer", str(cls.port)],
            cwd=ROOT, stdout=cls.log, stderr=cls.log, text=True,
        )
        for _ in range(80):
            if cls.server.poll() is not None:
                break
            try:
                urllib.request.urlopen(cls.base + "/api/students", timeout=.2).close()
                return
            except (OSError, urllib.error.URLError):
                time.sleep(.05)
        cls.log.seek(0)
        output = cls.log.read()
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.log.close()
        raise AssertionError("The real Java HTTP server did not become ready:\n" + output)

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.log.close()

    def request(self, method="GET", path="/api/students", data=None, body=None,
                extra_headers=None, mutation_header=True):
        headers = {}
        if method == "POST":
            headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
            if mutation_header:
                headers["X-ScoreDesk-Request"] = "1"
            if body is None:
                body = urllib.parse.urlencode(data or {}).encode("utf-8")
        headers.update(extra_headers or {})
        req = urllib.request.Request(self.base + path, data=body, headers=headers, method=method)
        try:
            response = urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            raw = response.read()
            content = json.loads(raw) if "application/json" in response.headers.get("Content-Type", "") else raw
            return response.status, content, response.headers

    def setUp(self):
        self.assertEqual(self.request("POST", "/api/reset")[0], 200)

    def add(self, name="Ana", a="80", b="90", c="100"):
        return self.request("POST", data={"name": name, "score1": a, "score2": b, "score3": c})

    def test_static_assets_and_relative_entry_paths(self):
        status, html, _ = self.request(path="/")
        self.assertEqual(status, 200)
        self.assertIn(b'href="styles.css"', html)
        self.assertIn(b'src="app.js"', html)
        for path, kind in [("/styles.css", "text/css"), ("/app.js", "application/javascript")]:
            status, body, headers = self.request(path=path)
            self.assertEqual(status, 200)
            self.assertIn(kind, headers["Content-Type"])
            self.assertTrue(body)

    def test_empty_report_schema(self):
        status, report, _ = self.request()
        self.assertEqual(status, 200)
        self.assertEqual((report["count"], report["capacity"], report["scoreCount"]), (0, 100, 3))
        self.assertEqual(report["students"], [])
        for key in ("classAverage", "highestAverage", "lowestAverage"):
            self.assertIsNone(report[key])

    def test_insert_is_real_java_report(self):
        status, report, _ = self.add()
        self.assertEqual(status, 201)
        row = report["students"][0]
        self.assertEqual(row["name"], "Ana")
        self.assertEqual(row["scores"], [80, 90, 100])
        self.assertEqual(row["average"], 90)
        self.assertTrue(row["highest"] and row["lowest"])

    def test_records_survive_a_new_get(self):
        self.add()
        self.assertEqual(self.request()[1]["count"], 1)

    def test_sample_data_and_ties(self):
        status, report, _ = self.request("POST", "/api/sample")
        self.assertEqual(status, 200)
        self.assertEqual(report["count"], 6)
        self.assertAlmostEqual(report["classAverage"], 515 / 6)
        self.assertEqual([r["name"] for r in report["students"] if r["highest"]], ["Ana Santos", "Miguel Cruz"])
        self.assertEqual([r["name"] for r in report["students"] if r["lowest"]], ["Carlo Reyes"])

    def test_sample_rejects_nonempty_report(self):
        self.add("Keep")
        self.assertEqual(self.request("POST", "/api/sample")[0], 409)
        self.assertEqual(self.request()[1]["students"][0]["name"], "Keep")

    def test_reset_clears_every_record(self):
        self.add()
        self.assertEqual(self.request("POST", "/api/reset")[1]["count"], 0)
        self.assertEqual(self.add()[1]["students"][0]["index"], 0)

    def test_invalid_values_do_not_mutate_store(self):
        for value in ["", "abc", "-1", "101", "100.01", "90.001", "NaN", "Infinity", "1e2"]:
            with self.subTest(value=value):
                status, content, _ = self.add(b=value)
                self.assertEqual(status, 400)
                self.assertIn("error", content)
                self.assertEqual(self.request()[1]["count"], 0)

    def test_blank_name_rejected(self):
        self.assertEqual(self.add(name="  ")[0], 400)

    def test_missing_form_field_rejected(self):
        self.assertEqual(self.request("POST", data={"name": "Ana", "score1": 80, "score2": 90})[0], 400)

    def test_duplicate_form_field_rejected(self):
        body = b"name=Ana&name=Other&score1=80&score2=90&score3=100"
        self.assertEqual(self.request("POST", body=body)[0], 400)

    def test_unknown_form_field_rejected(self):
        self.assertEqual(self.request("POST", data={"name": "Ana", "score1": 80, "score2": 90, "score3": 100, "extra": 1})[0], 400)

    def test_bad_url_encoding_rejected(self):
        self.assertEqual(self.request("POST", body=b"name=%ZZ&score1=80&score2=90&score3=100")[0], 400)

    def test_large_body_rejected(self):
        self.assertEqual(self.request("POST", body=b"x" * 8193)[0], 413)

    def test_wrong_content_type_rejected(self):
        status, _, _ = self.request("POST", body=b"{}", extra_headers={"Content-Type": "application/json"})
        self.assertEqual(status, 415)

    def test_mutation_without_custom_header_rejected(self):
        self.assertEqual(self.request("POST", "/api/reset", mutation_header=False)[0], 403)

    def test_cross_origin_mutation_rejected(self):
        self.assertEqual(self.request("POST", "/api/reset", extra_headers={"Origin": "https://other.example"})[0], 403)

    def test_same_origin_mutation_allowed(self):
        self.assertEqual(self.request("POST", "/api/reset", extra_headers={"Origin": self.base})[0], 200)

    def test_untrusted_host_rejected(self):
        self.assertEqual(self.request(extra_headers={"Host": f"other.example:{self.port}"})[0], 403)

    def test_wrong_method_reports_405_and_allow(self):
        status, _, headers = self.request("DELETE")
        self.assertEqual(status, 405)
        self.assertIn("GET", headers["Allow"])

    def test_get_cannot_mutate_samples_or_reset(self):
        self.add()
        for path in ["/api/sample", "/api/reset"]:
            self.assertEqual(self.request(path=path)[0], 405)
        self.assertEqual(self.request()[1]["count"], 1)

    def test_unrecognized_paths_are_not_prefix_matches(self):
        self.assertEqual(self.request(path="/api/students/other")[0], 404)

    def test_source_files_and_traversal_not_exposed(self):
        for path in ["/src/StudentStore.java", "/../src/StudentStore.java", "/%2e%2e/src/StudentStore.java", "/README.md"]:
            with self.subTest(path=path):
                self.assertEqual(self.request(path=path)[0], 404)

    def test_json_round_trip_escapes_special_and_unicode_names(self):
        name = 'José 李 <script>alert("x")</script> & \\ O\'Neil'
        status, report, _ = self.add(name=name)
        self.assertEqual(status, 201)
        self.assertEqual(report["students"][0]["name"], name)

    def test_no_cache_and_security_headers(self):
        _, _, headers = self.request()
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
        self.assertIn("frame-ancestors 'none'", headers["Content-Security-Policy"])
        self.assertNotIn("Access-Control-Allow-Origin", headers)

    def test_capacity_error_is_409_and_does_not_overwrite(self):
        for i in range(100):
            self.assertEqual(self.add(name=f"Student {i}")[0], 201)
        self.assertEqual(self.add(name="Overflow")[0], 409)
        self.assertEqual(self.request()[1]["count"], 100)

    def test_concurrent_inserts_have_unique_array_indices(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            statuses = list(pool.map(lambda i: self.add(name=f"Student {i}")[0], range(20)))
        self.assertEqual(statuses, [201] * 20)
        report = self.request()[1]
        self.assertEqual(report["count"], 20)
        self.assertEqual([r["index"] for r in report["students"]], list(range(20)))


if __name__ == "__main__":
    unittest.main(verbosity=2)
