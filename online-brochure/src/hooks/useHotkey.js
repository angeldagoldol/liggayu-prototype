import { useEffect, useRef } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function matches(event, combo) {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());
  const key = parts.pop();
  const want = {
    mod: parts.includes('mod'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  };
  const modPressed = isMac ? event.metaKey : event.ctrlKey;
  if (want.mod !== modPressed) return false;
  if (want.shift !== event.shiftKey && key.length > 1) return false;
  if (want.alt !== event.altKey) return false;
  return event.key.toLowerCase() === key || event.code.toLowerCase() === key;
}

/**
 * Bind a keyboard shortcut.
 *   useHotkey('mod+k', openPalette)          // ⌘K on Mac, Ctrl+K elsewhere
 *   useHotkey(['ArrowRight', 'l'], next)     // several combos
 *   useHotkey('/', focusSearch)              // ignored while typing in a field
 * Options: { enabled = true, allowInInputs = false, preventDefault = true }
 */
export function useHotkey(combos, handler, options = {}) {
  const { enabled = true, allowInInputs = false, preventDefault = true } = options;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  const key = Array.isArray(combos) ? combos.join('|') : combos;

  useEffect(() => {
    if (!enabled) return undefined;
    const list = key.split('|');
    const onKeyDown = (event) => {
      if (event.defaultPrevented && !allowInInputs) return;
      const hasModifier = /mod\+|alt\+/i.test(key);
      if (!allowInInputs && !hasModifier && isTypingTarget(event.target)) return;
      if (list.some((combo) => matches(event, combo))) {
        if (preventDefault) event.preventDefault();
        handlerRef.current?.(event);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, enabled, allowInInputs, preventDefault]);
}

export const modKeyLabel = isMac ? '⌘' : 'Ctrl';
