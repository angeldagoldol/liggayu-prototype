// Optional: node --test tests/test_share.cjs (no npm dependencies).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scriptPath = path.join(__dirname, '../web/share.js');
const scope = {URL};
if (fs.existsSync(scriptPath)) vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), scope);

test('a public HTTPS website creates a Gmail compose link', () => {
  assert.equal(typeof scope.ScoreDeskSharing?.gmailUrl, 'function', 'Gmail share helper is implemented');
  const url = new URL(scope.ScoreDeskSharing.gmailUrl('https://scoredesk-demo.onrender.com/'));
  assert.equal(url.origin, 'https://mail.google.com');
  assert.equal(url.searchParams.get('view'), 'cm');
  assert.equal(url.searchParams.get('fs'), '1');
  assert.equal(url.searchParams.get('su'), 'ScoreDesk - Student Score Management System');
  assert.match(url.searchParams.get('body'), /https:\/\/scoredesk-demo.onrender.com\//);
});

test('sharing never picks recipients or automatically sends email', () => {
  const url = new URL(scope.ScoreDeskSharing.gmailUrl('https://scoredesk-demo.onrender.com/'));
  for (const key of ['to', 'cc', 'bcc', 'send']) assert.equal(url.searchParams.has(key), false);
  assert.match(url.searchParams.get('body'), /fictional/i);
  assert.match(url.searchParams.get('body'), /temporary/i);
});

test('local, invalid, non-HTTPS and credential-bearing URLs cannot be shared', () => {
  for (const url of [null, '', 'file:///index.html', 'http://localhost:8080', 'https://localhost/',
    'https://127.0.0.1/', 'https://[::1]/', 'https://10.0.0.1/', 'https://192.168.1.1/',
    'https://172.16.2.3/', 'https://intranet/', 'https://u:p@example.com/', 'javascript:alert(1)']) {
    assert.equal(scope.ScoreDeskSharing.gmailUrl(url), null, String(url));
  }
});

test('email only includes the canonical origin, never queries, hashes or records', () => {
  const url = new URL(scope.ScoreDeskSharing.gmailUrl('https://scoredesk-demo.onrender.com/?name=Private&score=99#secret'));
  const body = url.searchParams.get('body');
  assert.ok(body.includes('https://scoredesk-demo.onrender.com/'));
  assert.ok(!body.includes('Private') && !body.includes('secret') && !body.includes('99'));
});

test('webpage has an initially disabled Gmail link and a copy-link button', () => {
  const html = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
  assert.match(html, /id="gmail-share"[^>]*aria-disabled="true"/);
  assert.match(html, /id="copy-link-btn"/);
  assert.match(html, /src="share.js"/);
});
