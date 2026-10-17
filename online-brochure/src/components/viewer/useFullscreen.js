import { useCallback, useEffect, useState } from 'react';

function fullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

function canFullscreen() {
  if (typeof document === 'undefined') return false;
  return Boolean(document.fullscreenEnabled ?? document.webkitFullscreenEnabled);
}

/**
 * Fullscreen API for one element, with the WebKit prefix as a fallback.
 * Returns { supported, active, toggle }; `supported` is false on browsers
 * (notably iPhone Safari) that cannot fullscreen arbitrary elements.
 */
export function useFullscreen(ref) {
  const [supported] = useState(canFullscreen);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(Boolean(ref.current) && fullscreenElement() === ref.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [ref]);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el || !supported) return;
    try {
      if (fullscreenElement()) {
        await (document.exitFullscreen ?? document.webkitExitFullscreen)?.call(document);
      } else {
        await (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
      }
    } catch {
      /* the browser refused (e.g. no user gesture) — stay as we are */
    }
  }, [ref, supported]);

  return { supported, active, toggle };
}
