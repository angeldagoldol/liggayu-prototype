import { createContext, useContext } from 'react';

/**
 * Render mode shared by every block of one page:
 *   isStatic — thumbnails / flip back faces: no motion, nothing focusable
 *   active   — the page the reader is looking at (plays entrances, counters)
 *   onCta    — contact-page call-to-action handler
 */
export const PageContext = createContext({ isStatic: false, active: false, onCta: undefined });

export function usePage() {
  return useContext(PageContext);
}
