import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from '../../lib/motion.js';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { PageLoader } from './PageLoader.jsx';

/**
 * Persistent chrome (nav, footer, grain) around animated route content.
 * The outlet is captured per render so the *old* page keeps rendering while
 * it animates out (AnimatePresence holds on to the previous element).
 */
export function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div key={location.pathname} variants={pageTransition} initial="initial" animate="animate" exit="exit">
            <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
