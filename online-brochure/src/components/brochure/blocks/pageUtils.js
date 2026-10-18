/**
 * Pure helpers shared by the brochure page blocks: safe field access for
 * user-made content, accessible labels, folios, text fitting and theme vars.
 */
import { PAGE_TYPES } from '../../../data/schema.js';
import { ensureContrast, luminance, mix, normalizeTheme, readableOn } from '../art/color.js';
import { pad } from '../../../lib/format.js';
import { dict } from '../../../data/lookup.js';
import { toLat, toLng } from '../../../data/sanitize.js';

/** Japanese section names, set vertically in the page margin: PAGE_TYPES[type].jp. */
export const SECTION_JP = dict(Object.fromEntries(Object.entries(PAGE_TYPES).map(([type, meta]) => [type, meta.jp])));

/** English section names for the folio line. */
export const SECTION_EN = dict({
  cover: 'Cover',
  intro: 'Introduction',
  features: 'Highlights',
  gallery: 'Gallery',
  stats: 'In numbers',
  agenda: 'Itinerary',
  pricing: 'Journeys',
  phrases: 'Phrasebook',
  quote: 'Words',
  place: 'Spotlight',
  map: 'Map',
  contact: 'Contact',
  back: 'Colophon',
});

const KANJI_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

/** Trimmed string for any field value; numbers are stringified, everything else is ''. */
export function text(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

/** Array items that are objects (or non-empty strings), ignoring junk. */
export function list(value, limit = Infinity) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => (typeof item === 'string' ? item.trim() : item && typeof item === 'object')).slice(0, limit);
}

/** Body copy → paragraphs (split on blank lines). */
export function paragraphs(body) {
  return text(body)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Finite number or null ("12" → 12). */
export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** 1 → "一", 10 → "十"; beyond ten falls back to digits. */
export function kanjiNumeral(n) {
  return KANJI_DIGITS[n] ?? String(n);
}

/** 1 → "①" … 20 → "⑳". */
export function circledNumeral(n) {
  return n >= 1 && n <= 20 ? String.fromCodePoint(0x2460 + n - 1) : `(${n})`;
}

/** "04 / 11" */
export function folio(number, total) {
  return `${pad(number)} / ${pad(Math.max(number, total))}`;
}

/** The main human-readable heading of a page, whatever its type. */
export function pageHeading(page, brochure) {
  const p = page && typeof page === 'object' ? page : {};
  switch (p.type) {
    case 'cover':
      return text(p.title) || text(brochure?.title) || 'Cover';
    case 'quote': {
      const author = text(p.author);
      return author ? `Quote from ${author}` : 'Quote';
    }
    case 'place':
      return text(p.name) || text(p.heading) || 'Place';
    case 'back':
      return text(p.title) || 'Back cover';
    default:
      return text(p.heading) || PAGE_TYPES[p.type]?.label || 'Untitled page';
  }
}

/** Accessible name for the page article: "Page 4 of 11: One perfect day". */
export function pageLabel(page, brochure, index, total) {
  const n = index + 1;
  return `Page ${n} of ${Math.max(n, total)}: ${pageHeading(page, brochure)}`;
}

/**
 * Font size (in cqw) that shrinks as text grows: full size up to `ideal`
 * characters, then scaled by √(ideal / length) — area grows with the square
 * of the size — never below `min`.
 */
export function fitSize(value, { max, min, ideal }) {
  const length = text(value).length;
  if (length <= ideal) return max;
  const size = max * Math.sqrt(ideal / length);
  return Math.round(Math.max(min, size) * 100) / 100;
}

/**
 * A poem's lines: Japanese verse breaks at spaces (full- or half-width, as
 * tanka and inscriptions are often printed), an English translation at " / "
 * (the usual way to quote verse in running text). Empty parts are dropped.
 */
export function verseLines(value, { japanese = false } = {}) {
  const source = text(value);
  if (!source) return [];
  const parts = japanese ? source.split(/[\u3000\s]+/) : source.split(/\s+\/\s+/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/**
 * Type size (cqw) for vertical Japanese verse in a column `height` cqw tall:
 * the longest line fits one column at up to `max`; very long lines (prose
 * inscriptions) wrap into further columns at no less than `min`.
 */
export function verseSize(lines, { height = 92, max = 7.2, min = 3.4, perChar = 1.1, offset = 0 } = {}) {
  // `offset`: characters' worth of space before every line after the first (a stepped tanka).
  const longest = Math.max(1, ...lines.map((line, i) => Array.from(line).length + (i ? offset : 0)));
  const total = lines.reduce((sum, line) => sum + Array.from(line).length, 0);
  // Long single lines wrap: aim for about three columns of text.
  const perColumn = longest > 22 ? Math.ceil(Math.max(longest, total) / 3) : longest;
  const size = height / (perColumn * perChar);
  return Math.floor(Math.min(max, Math.max(min, size)) * 100) / 100;
}

/** "https://www.kiyomizudera.or.jp/en/" → "kiyomizudera.or.jp" ('' for anything that is not a URL). */
export function hostLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\d*\./, '');
  } catch {
    return '';
  }
}

/** Where a link leads, short enough to print: the host, plus the first path segment when it is short
 *  ("https://kyoto.travel/en/responsible-travel/" → "kyoto.travel/en"). */
export function linkLabel(url) {
  const host = hostLabel(url);
  if (!host) return '';
  const first = new URL(url).pathname.split('/').filter(Boolean)[0];
  return first && first.length <= 12 ? `${host}/${first}` : host;
}

/** "34.9949° N · 135.7850° E" — '' unless both are real coordinates. */
export function formatLatLng(lat, lng) {
  const a = toLat(lat);
  const b = toLng(lng);
  if (a === null || b === null) return '';
  return `${Math.abs(a).toFixed(4)}° ${a >= 0 ? 'N' : 'S'} · ${Math.abs(b).toFixed(4)}° ${b >= 0 ? 'E' : 'W'}`;
}

/** "October 2026" — empty string for missing or invalid dates. */
export function formatEdition(iso) {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/** --font-display starts with 'Tabi Macrons' (base.css), which keeps ā ē ī ō ū whole. */
const FONTS = { serif: 'var(--font-display)', sans: 'var(--font-sans)', mono: 'var(--font-mono)' };

/**
 * CSS custom properties for a page root. Accent and muted text colours are
 * nudged toward the ink until they read at 4.5:1 on the paper (and on the
 * tinted --b-soft), so any theme (including user-made ones) stays legible.
 * Small accent-coloured text uses --b-accent-text; raw --b-accent is for
 * rules, dots and type at 24px or more. Type set over photographs uses
 * --b-light on a --b-shade scrim (the lighter and darker of paper and ink,
 * so dark-paper themes work too).
 */
export function themeVars(theme) {
  const t = normalizeTheme(theme);
  const onAccent = readableOn(t.accent, [t.paper, t.ink, '#ffffff', '#16140f']);
  const soft = mix(t.paper, t.accent, 0.12);
  const paperIsLight = luminance(t.paper) >= luminance(t.ink);
  const light = paperIsLight ? t.paper : t.ink;
  const shade = paperIsLight ? t.ink : t.paper;
  return {
    '--b-light': mix(light, '#ffffff', 0.35),
    '--b-shade': mix(shade, '#000000', 0.35),
    '--b-paper': t.paper,
    '--b-ink': t.ink,
    '--b-accent': t.accent,
    '--b-accent2': t.accent2,
    '--b-muted': t.muted,
    '--b-font': FONTS[t.typeface],
    '--b-accent-text': ensureContrast(t.accent, t.paper, 4.5, t.ink),
    '--b-muted-text': ensureContrast(t.muted, t.paper, 4.5, t.ink),
    '--b-on-accent': onAccent,
    '--b-soft': soft,
    // Accent text on the tinted --b-soft panels (the highlighted price).
    '--b-accent-on-soft': ensureContrast(t.accent, soft, 4.5, t.ink),
  };
}
