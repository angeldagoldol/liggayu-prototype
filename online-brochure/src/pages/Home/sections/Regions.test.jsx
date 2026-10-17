import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MotionGlobalConfig } from 'framer-motion';
import { MemoryRouter } from 'react-router-dom';
import { BrochureProvider } from '../../../context/BrochureContext.jsx';
import { ToastProvider } from '../../../context/ToastContext.jsx';
import { Regions } from './Regions.jsx';

// The map's chunk "fails": rendering it throws, as a rejected lazy import would.
vi.mock('./RegionsMap.jsx', () => ({
  default: () => {
    throw new Error('Failed to fetch dynamically imported module');
  },
}));

describe('<Regions> without its map chunk', () => {
  let RealObserver;
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
    RealObserver = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        this.callback([{ target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: target.getBoundingClientRect() }], this);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  });
  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
    window.IntersectionObserver = RealObserver;
  });

  it('keeps the page whole and the card travelling', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToastProvider>
          <BrochureProvider>
            <Regions />
          </BrochureProvider>
        </ToastProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/The map could not load/)).toBeInTheDocument();
    const title = screen.getByRole('heading', { level: 3 }).textContent;
    await user.click(screen.getByRole('button', { name: /^Next region/ }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 3 }).textContent).not.toBe(title));
    quiet.mockRestore();
  });
});
