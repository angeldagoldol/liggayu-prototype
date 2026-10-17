/** Keyboard and ARIA helpers shared by the Studio's custom widgets. */

/**
 * Index reached from `index` by an arrow / Home / End key in a list of
 * `count` options (wrapping), or -1 for any other key.
 */
export function nextIndex(key, index, count) {
  if (count <= 0) return -1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return -1;
}

/** Movement in a grid of `columns` (no wrapping at the edges), or -1. */
export function gridIndex(key, index, count, columns) {
  if (count <= 0) return -1;
  const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
  if (key in moves) {
    const next = index + moves[key];
    return next < 0 || next >= count ? index : next;
  }
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return -1;
}

/** Props for the tab panel paired with a <PanelTabs> tab of the same idBase. */
export function tabPanelProps(idBase, value) {
  return {
    role: 'tabpanel',
    id: `${idBase}-panel-${value}`,
    'aria-labelledby': `${idBase}-tab-${value}`,
    tabIndex: 0,
  };
}

const TABBABLE = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]';

/** Elements inside `root` that Tab stops on, in document order (roving `tabindex=-1` cells excluded). */
export function tabbablesIn(root) {
  if (!root) return [];
  return [...root.querySelectorAll(TABBABLE)].filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.disabled &&
      el.type !== 'hidden' &&
      !el.closest('[inert]') &&
      (el.checkVisibility?.({ visibilityProperty: true }) ?? true),
  );
}

/** The next Tab stop after `from` in the document, skipping anything inside `exclude` (e.g. a portalled popover). */
export function nextTabbable(from, exclude) {
  if (!from) return null;
  const follows = (el) => el !== from && !from.contains(el) && Boolean(from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  return tabbablesIn(from.ownerDocument.body).find((el) => !exclude?.contains(el) && follows(el)) ?? null;
}

/**
 * Should ⌘Z / ⌘Y pressed at `target` go to the Studio's own history?
 * Yes outside text fields, and in the editor's own fields (inside `root`),
 * whose every keystroke is already in the document. No in fields elsewhere
 * (the command palette, portalled popovers) or in ones marked
 * [data-native-undo] because they hold text that isn't in the document yet.
 */
export function wantsStudioUndo(target, root) {
  if (!isEditableTarget(target)) return true;
  if (!root || !root.contains(target)) return false;
  return !target.closest('[data-native-undo]');
}

/** True when keyboard focus is in a text-editing control (native undo applies there). */
export function isEditableTarget(target) {
  if (!target || typeof target !== 'object' || !('tagName' in target)) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
  if (target.tagName !== 'INPUT') return false;
  return !['button', 'checkbox', 'radio', 'range', 'color', 'file', 'submit', 'reset'].includes(target.type);
}
