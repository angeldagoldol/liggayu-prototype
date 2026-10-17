import { Suspense, lazy, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';

const loadPanel = () => import('./PalettePanel.jsx');
const PalettePanel = lazy(loadPanel);

/**
 * ⌘K / Ctrl K command palette, mounted once by <AppShell>. The panel itself
 * (search index, cover thumbnails, icon registry) is a separate chunk that is
 * fetched while the browser is idle, so the first ⌘K still opens instantly.
 * Props: open, onClose.
 */
export function CommandPalette({ open, onClose }) {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => {
      loadPanel().catch(() => {
        /* offline: React.lazy retries when the palette is opened */
      });
    });
    return () => cancel(handle);
  }, []);

  return createPortal(
    <AnimatePresence>
      {open && (
        <Suspense key="palette" fallback={null}>
          <PalettePanel onClose={onClose} />
        </Suspense>
      )}
    </AnimatePresence>,
    document.body,
  );
}
