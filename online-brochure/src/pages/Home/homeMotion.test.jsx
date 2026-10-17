import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BrochureProvider } from '../../context/BrochureContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';
import { setMotionPaused, useMotionPaused } from './homeMotion.js';
import { MotionToggle } from './sections/MotionToggle.jsx';
import { Regions } from './sections/Regions.jsx';
import { Voices } from './sections/Voices.jsx';
import { WordMarquee } from './sections/WordMarquee.jsx';

afterEach(() => {
  act(() => setMotionPaused(false));
});

const marquees = (container) => [...container.querySelectorAll('[data-reverse], [style*="--duration"]')];

describe('Home "Pause motion" (WCAG 2.2.2)', () => {
  it('pauses and resumes the word marquee from one keyboard-operable button, and remembers it', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <MotionToggle />
        <WordMarquee />
      </>,
    );
    const bands = marquees(container);
    expect(bands).toHaveLength(2);
    bands.forEach((band) => expect(band).not.toHaveAttribute('data-paused'));

    await user.tab();
    const pause = screen.getByRole('button', { name: 'Pause motion' });
    expect(pause).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Play motion' })).toHaveFocus();
    bands.forEach((band) => expect(band).toHaveAttribute('data-paused'));
    expect(window.localStorage.getItem('tabi:motion')).toBe('"paused"');

    await user.click(screen.getByRole('button', { name: 'Play motion' }));
    bands.forEach((band) => expect(band).not.toHaveAttribute('data-paused'));
    expect(window.localStorage.getItem('tabi:motion')).toBe('"auto"');
  });

  it('reads the remembered choice on a fresh load', async () => {
    window.localStorage.setItem('tabi:motion', '"paused"');
    vi.resetModules();
    const fresh = await import('./homeMotion.js');
    const { result } = renderHook(() => fresh.useMotionPaused());
    expect(result.current).toBe(true);
  });

  it('follows a pause made in another tab', () => {
    const { result } = renderHook(() => useMotionPaused());
    expect(result.current).toBe(false);
    window.localStorage.setItem('tabi:motion', '"paused"');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'tabi:motion', storageArea: window.localStorage }));
    });
    expect(result.current).toBe(true);
  });

  it('stops the postcard autoplay too, and hands control back when the page setting changes', async () => {
    const user = userEvent.setup();
    render(<Voices />);
    expect(screen.getByRole('button', { name: 'Pause letters' })).toBeInTheDocument();

    act(() => setMotionPaused(true));
    expect(screen.getByRole('button', { name: 'Play letters automatically' })).toBeInTheDocument();

    // The deck's own Play wins while the page setting stays put…
    await user.click(screen.getByRole('button', { name: 'Play letters automatically' }));
    expect(screen.getByRole('button', { name: 'Pause letters' })).toBeInTheDocument();

    // …until the visitor flips the page-wide setting again.
    act(() => setMotionPaused(false));
    act(() => setMotionPaused(true));
    expect(screen.getByRole('button', { name: 'Play letters automatically' })).toBeInTheDocument();
  });
});

describe('<Regions> map', () => {
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });
  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  it('does not re-announce the whole detail card on every arrow key', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <ToastProvider>
          <BrochureProvider>
            <Regions />
          </BrochureProvider>
        </ToastProvider>
      </MemoryRouter>,
    );
    const tile = screen.getByRole('group', { name: 'Regions of Japan' }).querySelector('button[tabindex="0"]');
    const detail = container.querySelector(`[id="${tile.getAttribute('aria-controls')}"]`);
    expect(detail).toBeInTheDocument();
    expect(detail).not.toHaveAttribute('aria-live');
    expect(container.querySelector('[aria-live]')).toBeNull();

    act(() => tile.focus());
    await user.keyboard('{ArrowUp}');
    const next = document.activeElement;
    expect(next).not.toBe(tile);
    expect(next).toHaveAttribute('aria-pressed', 'true');
    expect(next).toHaveAttribute('aria-controls', detail.id);
    await waitFor(() => expect(detail).toHaveTextContent(next.getAttribute('aria-label').split(',')[0]));
  });
});
