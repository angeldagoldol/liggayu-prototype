import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BrochureProvider } from '../../context/BrochureContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';
import { setMotionPaused, useMotionPaused } from './homeMotion.js';
import { Haiku } from './sections/Haiku.jsx';
import { MotionToggle } from './sections/MotionToggle.jsx';
import { Regions } from './sections/Regions.jsx';
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
    render(<Haiku />);
    expect(screen.getByRole('button', { name: 'Pause postcards' })).toBeInTheDocument();

    act(() => setMotionPaused(true));
    expect(screen.getByRole('button', { name: 'Play postcards automatically' })).toBeInTheDocument();

    // The deck's own Play wins while the page setting stays put…
    await user.click(screen.getByRole('button', { name: 'Play postcards automatically' }));
    expect(screen.getByRole('button', { name: 'Pause postcards' })).toBeInTheDocument();

    // …until the visitor flips the page-wide setting again.
    act(() => setMotionPaused(false));
    act(() => setMotionPaused(true));
    expect(screen.getByRole('button', { name: 'Play postcards automatically' })).toBeInTheDocument();
  });
});

describe('<Haiku> postcards', () => {
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });
  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  it('sends real poems: the original in Japanese, the translation credited, the poet and place', async () => {
    const user = userEvent.setup();
    render(<Haiku />);
    expect(screen.getByRole('region', { name: 'Haiku postcards' })).toBeInTheDocument();
    const poem = screen.getAllByText('古池や').find((el) => el.closest('blockquote'));
    expect(poem.closest('blockquote')).toHaveAttribute('lang', 'ja');
    expect(screen.getByText('the sound of water.')).toBeInTheDocument();
    expect(screen.getAllByText('Translation: Tabi Guides').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Postcard 5 of 5: Masaoka Shiki, Hōryū-ji, Ikaruga, Nara' }));
    await waitFor(() => expect(screen.getByText('鐘が鳴るなり')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /^Postcard 5 of 5/ })).toHaveAttribute('aria-current', 'true');
  });
});

describe('<Regions> map', () => {
  let RealObserver;
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
    // Everything is "in view", so the lazy map loads as it would near the viewport.
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

  const renderRegions = () =>
    render(
      <MemoryRouter>
        <ToastProvider>
          <BrochureProvider>
            <Regions />
          </BrochureProvider>
        </ToastProvider>
      </MemoryRouter>,
    );
  const cardTitle = (name) => screen.getByRole('heading', { level: 3, name });

  it('draws the accurate map; regions are buttons, arrow keys travel across it and the card follows', async () => {
    const user = userEvent.setup();
    const { container } = renderRegions();
    const map = await screen.findByRole('group', { name: 'Map of Japan’s eight regions' }, { timeout: 4000 });
    const kanto = within(map).getByRole('button', { name: 'Kantō 関東' });

    act(() => kanto.focus());
    await waitFor(() => expect(cardTitle('Kantō')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Browse Kantō/ })).toHaveAttribute('href', '/brochures?region=kanto');

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(within(map).getByRole('button', { name: 'Tōhoku 東北' }));
    await waitFor(() => expect(cardTitle('Tōhoku')).toBeInTheDocument());
    expect(map.querySelector('[data-region="tohoku"]')).toHaveAttribute('data-highlighted');

    await user.keyboard('{End}');
    expect(document.activeElement).toHaveAttribute('data-region', 'kyushu');

    // Not a live region: arrowing across the map must not read the whole card out each time.
    expect(container.querySelector('[aria-live]')).toBeNull();
  });

  it('has a pager on the card, and clicking a region selects it', async () => {
    const user = userEvent.setup();
    renderRegions();
    const map = await screen.findByRole('group', { name: 'Map of Japan’s eight regions' }, { timeout: 4000 });

    await user.click(within(map).getByRole('button', { name: 'Shikoku 四国' }));
    await waitFor(() => expect(cardTitle('Shikoku')).toBeInTheDocument());
    expect(screen.getByText('祖谷のかずら橋')).toHaveAttribute('lang', 'ja');

    await user.click(screen.getByRole('button', { name: 'Next region: Kyūshū & Okinawa' }));
    await waitFor(() => expect(cardTitle('Kyūshū & Okinawa')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Next region: Hokkaidō' }));
    await waitFor(() => expect(cardTitle('Hokkaidō')).toBeInTheDocument());
  });
});
