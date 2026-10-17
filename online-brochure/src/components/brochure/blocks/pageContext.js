import { createContext, useContext } from 'react';

/**
 * Render mode shared by every block of one page:
 *   isStatic — thumbnails / flip back faces: no motion, nothing focusable
 *   active   — the page the reader is looking at (plays entrances, counters)
 *   onCta    — contact-page call-to-action handler
 *   recto    — a right-hand page (odd page number): its outer edge is on the right
 */
export const PageContext = createContext({ isStatic: false, active: false, onCta: undefined, recto: true });

export function usePage() {
  return useContext(PageContext);
}
