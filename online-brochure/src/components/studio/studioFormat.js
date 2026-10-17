/** Small pure helpers for Studio labels and preview layout. */

/** "just now", "1 min ago", "12 min ago", "at 14:05", or "on Oct 3" for older saves. */
export function relativeSaved(savedAt, now) {
  if (!savedAt) return '';
  const seconds = Math.max(0, Math.round((now - savedAt) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const date = new Date(savedAt);
  const sameDay = new Date(now).toDateString() === date.toDateString();
  return sameDay
    ? `at ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date)}`
    : `on ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)}`;
}

/**
 * Booklet spreads as page-index groups: the cover sits alone, then facing
 * pairs, and a final odd page alone. 6 pages → [[0], [1, 2], [3, 4], [5]].
 */
export function buildSpreads(count) {
  if (count <= 0) return [];
  const spreads = [[0]];
  for (let i = 1; i < count; i += 2) spreads.push(i + 1 < count ? [i, i + 1] : [i]);
  return spreads;
}

/** Index of the spread that contains `pageIndex`. */
export function spreadOf(pageIndex, count) {
  if (pageIndex <= 0 || count <= 0) return 0;
  return Math.ceil(Math.min(pageIndex, count - 1) / 2);
}

/** Keep `value` within `max` characters for counters: { count, over, near }. */
export function charCount(value, max) {
  const count = Array.from(String(value ?? '')).length;
  return { count, over: count > max, near: count > max * 0.85 };
}

/** Normalise a free-typed tag: trimmed, lower-case, single spaces, ≤ 32 chars. */
export function normalizeTag(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^#/, '')
    .slice(0, 32);
}
