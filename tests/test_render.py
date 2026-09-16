"""Deployment regressions; uses only Python's standard library and the real Java server."""
import json
import os
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

class RenderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            cls.port = sock.getsockname()[1]
        cls.base = f'http://127.0.0.1:{cls.port}'
        cls.origin = 'https://scoredesk-test.onrender.com'
        cls.env = {**os.environ, 'PORT': str(cls.port), 'BIND_ADDRESS': '0.0.0.0',
                   'RENDER': 'true', 'RENDER_EXTERNAL_HOSTNAME': 'scoredesk-test.onrender.com',
                   'RENDER_EXTERNAL_URL': cls.origin}
        cls.env.pop('PUBLIC_URL', None)
        cls.log = tempfile.TemporaryFile(mode='w+')
        # No command-line port: this must use the platform PORT variable.
        cls.server = subprocess.Popen(['java', '--add-modules', 'jdk.httpserver', '-cp', 'build',
                                      'StudentServer'], cwd=ROOT, env=cls.env,
                                     stdout=cls.log, stderr=cls.log, text=True)
        for _ in range(50):
            if cls.server.poll() is not None:
                break
            try:
                with socket.create_connection(('127.0.0.1', cls.port), timeout=.1):
                    return
            except OSError:
                time.sleep(.05)
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.log.seek(0)
        message = cls.log.read()
        cls.log.close()
        raise AssertionError('Server must listen on the PORT environment variable. Log: ' + message)

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate()
        cls.server.wait(timeout=5)
        cls.log.close()

    def request(self, path='/', method='GET', headers=None, data=None):
        defaults = {'Host': 'scoredesk-test.onrender.com'}
        defaults.update(headers or {})
        body = None
        if method == 'POST':
            body = urllib.parse.urlencode(data or {}).encode()
            defaults.setdefault('Content-Type', 'application/x-www-form-urlencoded')
            defaults.setdefault('X-ScoreDesk-Request', '1')
            defaults.setdefault('Origin', self.origin)
        request = urllib.request.Request(self.base + path, data=body, headers=defaults, method=method)
        try:
            response = urllib.request.urlopen(request, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.status, response.read(), response.headers

    def test_render_host_serves_homepage(self):
        status, body, _ = self.request()
        self.assertEqual(status, 200)
        self.assertIn(b'ScoreDesk', body)

    def test_server_listens_on_all_interfaces(self):
        # Linux /proc shows the actual listening address, not a claimed configuration.
        tcp_table = Path('/proc/net/tcp')
        if not tcp_table.exists():
            self.skipTest('/proc socket inspection is available on Linux only')
        tables = [tcp_table, Path('/proc/net/tcp6')]
        entries = [line.split() for table in tables if table.exists()
                   for line in table.read_text().splitlines()[1:]]
        # Java may use a dual-stack wildcard socket, shown in tcp6 rather than tcp.
        wildcards = {f'00000000:{self.port:04X}', f'{"0" * 32}:{self.port:04X}'}
        self.assertTrue(any(row[1] in wildcards and row[3] == '0A' for row in entries),
                        'Expected a wildcard listening socket accepting IPv4 connections')

    def test_health_get_and_head_support_internal_host(self):
        for method in ('GET', 'HEAD'):
            status, body, _ = self.request('/health', method, {'Host': '10.1.2.3:10000'})
            self.assertEqual(status, 200)
            self.assertEqual(body, b'' if method == 'HEAD' else b'{"status":"ok"}')

    def test_health_rejects_mutating_method(self):
        self.assertEqual(self.request('/health', 'POST')[0], 405)

    def test_report_contains_canonical_public_url(self):
        status, body, _ = self.request('/api/students')
        self.assertEqual(status, 200)
        report = json.loads(body)
        self.assertEqual(report['publicUrl'], self.origin + '/')
        self.assertTrue(report['publicDemo'])

    def test_https_mutation_and_java_calculation(self):
        self.assertEqual(self.request('/api/reset', 'POST')[0], 200)
        status, body, _ = self.request('/api/students', 'POST', data={
            'name': 'Fictional Render Student', 'score1': '80', 'score2': '90', 'score3': '100'})
        self.assertEqual(status, 201)
        self.assertEqual(json.loads(body)['students'][0]['average'], 90)

    def test_foreign_host_still_rejected(self):
        self.assertEqual(self.request(headers={'Host': 'evil.example'})[0], 403)

    def test_foreign_origin_still_rejected(self):
        self.assertEqual(self.request('/api/reset', 'POST', {'Origin': 'https://evil.example'})[0], 403)

    def test_http_version_of_public_origin_rejected(self):
        self.assertEqual(self.request('/api/reset', 'POST', {'Origin': self.origin.replace('https:', 'http:')})[0], 403)

    def test_mutation_still_requires_custom_header(self):
        self.assertEqual(self.request('/api/reset', 'POST', {'X-ScoreDesk-Request': '0'})[0], 403)

    def test_share_script_is_served(self):
        status, body, headers = self.request('/share.js')
        self.assertEqual(status, 200)
        self.assertIn('javascript', headers['Content-Type'])
        self.assertIn(b'Gmail', body)

    def test_noindex_headers_and_robots(self):
        _, _, headers = self.request()
        self.assertIn('noindex', headers['X-Robots-Tag'])
        status, body, _ = self.request('/robots.txt')
        self.assertEqual(status, 200)
        self.assertIn(b'Disallow: /', body)

    def test_invalid_public_url_fails_closed(self):
        for bad in ('https://example.com/path', 'http://example.com', 'https://u:p@example.com',
                    'https://example.com/?token=secret', 'https://example.com/#token'):
            with self.subTest(url=bad):
                result = subprocess.run(['java', '-cp', 'build', 'StudentServer'], cwd=ROOT,
                    env={**self.env, 'PUBLIC_URL': bad}, capture_output=True, text=True, timeout=5)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('PUBLIC_URL', result.stderr)

if __name__ == '__main__':
    unittest.main(verbosity=2)
