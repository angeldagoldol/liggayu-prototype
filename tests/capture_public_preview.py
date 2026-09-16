"""Capture a LOCAL configured-public-mode preview. The .example URL is NOT a live site."""
import os
from pathlib import Path
from test_browser import BrowserTests, expect

# This script intentionally uses a reserved example address, never a real service URL.
os.environ['PUBLIC_URL'] = 'https://scoredesk.example'
os.environ['SCOREDESK_IN_MEMORY_UI'] = '1'
BrowserTests.setUpClass()
case = BrowserTests('test_capture_actual_demo_screenshots')
try:
    case.setUp()
    case.ready()
    case.page.locator('#sample-btn').click()
    expect(case.page.locator('#student-count')).to_have_text('6')
    expect(case.page.locator('#share-url')).to_have_value('https://scoredesk.example/')
    expect(case.page.locator('#gmail-share')).to_have_attribute('aria-disabled', 'false')
    expect(case.page.locator('#demo-warning')).to_be_visible()
    case.page.evaluate("() => { document.activeElement.blur(); window.scrollTo(0,0); }")
    output = Path(__file__).resolve().parents[1] / 'docs/screenshots'
    case.page.screenshot(path=str(output / 'render-sharing-preview.png'), full_page=True)
    case.page.set_viewport_size({'width':390, 'height':844})
    assert case.page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    case.page.screenshot(path=str(output / 'render-sharing-mobile-preview.png'), full_page=True)
    assert not case.js_errors, case.js_errors
    print('PASS: public-mode controls use the configured URL returned by the real Java backend.')
    print('PASS: desktop/mobile previews captured. The example address is not a live deployment.')
finally:
    if hasattr(case, 'context'):
        case.context.close()
    BrowserTests.tearDownClass()
