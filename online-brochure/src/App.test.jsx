import { render, screen } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { BrochureProvider } from './context/BrochureContext.jsx';
import { BROCHURES } from './data/brochures.js';
import App from './App.jsx';

/**
 * Smoke test across slices: every route renders inside the real shell
 * (navbar, footer, route transition, lazy pages) with exactly one <h1>.
 */
function renderAt(hash) {
  window.location.hash = hash;
  return render(
    <ThemeProvider>
      <ToastProvider>
        <BrochureProvider>
          <App />
        </BrochureProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
}

const darkPaper = BROCHURES.find((b) => b.slug === 'tokyo-after-dark');

const ROUTES = [
  ['#/', /Japan/i],
  ['#/brochures', /brochure/i],
  [`#/brochures/${BROCHURES[0].slug}`, new RegExp(BROCHURES[0].title.split(':')[0], 'i')],
  [`#/brochures/${darkPaper.slug}?p=3`, /Tokyo/i],
  ['#/brochures/no-such-brochure', /.+/],
  ['#/studio', /.+/],
  ['#/nope', /.+/],
];

describe('<App> routes', () => {
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });
  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
    window.location.hash = '';
  });

  it.each(ROUTES)('renders %s with one h1', async (hash, heading) => {
    const errors = vi.spyOn(console, 'error');
    renderAt(hash);
    const h1 = await screen.findByRole('heading', { level: 1 }, { timeout: 4000 });
    expect(h1).toHaveTextContent(heading);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
