import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useHotkey } from '../../hooks/useHotkey.js';
import { PaletteContext } from './palette.js';
import { isImmersivePath } from './navItems.js';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { PageLoader } from './PageLoader.jsx';
import { CommandPalette } from './CommandPalette.jsx';
import { RoutePage } from './RouteTransition.jsx';
import styles from './AppShell.module.css';

/** True when `next` only appends segments to `prev` (/studio → /studio/b_12). */
function extendsPath(prev, next) {
  const base = prev.replace(/\/+$/, '');
  return base !== '' && next.startsWith(`${base}/`);
}

/**
 * Persistent chrome (navbar, footer, command palette, grain) around animated
 * route content.
 *
 * The outlet is captured per render, so AnimatePresence keeps rendering the
 * *old* page while it animates out. Routes animate when their pathname
 * changes, except "bookkeeping" URL updates that keep the page mounted: a
 * REPLACE navigation that only appends a segment (Studio's first save,
 * /studio → /studio/:id), or any navigation with
 * `state: { shellTransition: false }`.
 */
export function AppShell() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const mainRef = useRef(null);
  const immersive = isImmersivePath(location.pathname);

  // Derived during render (React's "adjust state on prop change" pattern).
  const [route, setRoute] = useState({ pathname: location.pathname, key: location.pathname });
  if (route.pathname !== location.pathname) {
    const keep =
      location.state?.shellTransition === false ||
      (navigationType === 'REPLACE' && extendsPath(route.pathname, location.pathname));
    setRoute({ pathname: location.pathname, key: keep ? route.key : location.pathname });
  }

  // The palette, like the mobile menu, belongs to the location it opened on.
  const [paletteAt, setPaletteAt] = useState(null);
  const paletteOpen = paletteAt !== null && paletteAt === location.key;
  const openPalette = useCallback(() => setPaletteAt(location.key), [location.key]);
  const closePalette = useCallback(() => setPaletteAt(null), []);
  const togglePalette = useCallback(
    () => setPaletteAt((at) => (at === location.key ? null : location.key)),
    [location.key],
  );
  const palette = useMemo(
    () => ({ isOpen: paletteOpen, open: openPalette, close: closePalette, toggle: togglePalette }),
    [paletteOpen, openPalette, closePalette, togglePalette],
  );

  useHotkey('mod+k', togglePalette, { allowInInputs: true });

  // Runs while the curtain fully covers the screen.
  const onExitComplete = () => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  };

  return (
    <PaletteContext.Provider value={palette}>
      <div className={styles.shell} data-immersive={immersive || undefined}>
        <a
          href="#main"
          className="skip-link"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
        >
          Skip to content
        </a>
        <Navbar immersive={immersive} />
        <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
          <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
            <RoutePage key={route.key}>
              <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
            </RoutePage>
          </AnimatePresence>
        </main>
        {!immersive && <Footer />}
        <CommandPalette open={paletteOpen} onClose={closePalette} />
        <div className="grain" aria-hidden="true" />
      </div>
    </PaletteContext.Provider>
  );
}
