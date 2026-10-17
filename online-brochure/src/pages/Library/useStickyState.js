import { useEffect, useState } from 'react';
import { useNavHidden } from '../../components/layout/navState.js';

/**
 * True while the site navbar is tucked away, so the sticky toolbar can slide
 * up into the bar's place and back down when it returns. Reads the Navbar's
 * own published state (focus inside the bar, the palette and the mobile menu
 * all keep it visible), rather than re-deriving it from the scroll position.
 */
export function useNavTucked() {
  return useNavHidden();
}

/**
 * True once a sticky element has stuck. Watches a zero-height sentinel placed
 * just before it: when the sentinel scrolls under the navbar line, we're stuck.
 */
export function useStuck(sentinelRef) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const navHeight = parseFloat(getComputedStyle(sentinel).getPropertyValue('--nav-h')) || 72;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < navHeight + 1),
      { rootMargin: `-${navHeight + 1}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  return stuck;
}
