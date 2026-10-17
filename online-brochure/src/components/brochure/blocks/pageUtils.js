/**
 * Pure helpers shared by the brochure page blocks: safe field access for
 * user-made content, accessible labels, folios, text fitting and theme vars.
 */
import { PAGE_TYPES } from '../../../data/schema.js';
import { ensureContrast, mix, normalizeTheme, readableOn } from '../art/color.js';
import { pad } from '../../../lib/format.js';

/** Japanese section names, set vertically in the page margin. */
export const SECTION_JP = {
  cover: '表紙',
  intro: 'はじめに',
  features: '見どころ',
  gallery: '写真',
  stats: '数字',
  agenda: '旅程',
  pricing: '料金',
  phrases: '会話',
  quote: 'お客様の声',
  contact: 'お問い合わせ',
  back: '裏表紙',
};

/** English section names for the folio line. */
export const SECTION_EN = {
  cover: 'Cover',
  intro: 'Introduction',
  features: 'Highlights',
  gallery: 'Gallery',
  stats: 'In numbers',
  agenda: 'Itinerary',
  pricing: 'Journeys',
  phrases: 'Phrasebook',
  quote: 'Voices',
  contact: 'Contact',
  back: 'Colophon',
};

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
      return author ? `Testimonial from ${author}` : 'Testimonial';
    }
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
 * nudged toward the ink until they read at 4.5:1 on the paper, so any theme
 * (including user-made ones) stays legible.
 */
export function themeVars(theme) {
  const t = normalizeTheme(theme);
  const onAccent = readableOn(t.accent, [t.paper, t.ink, '#ffffff', '#16140f']);
  return {
    '--b-paper': t.paper,
    '--b-ink': t.ink,
    '--b-accent': t.accent,
    '--b-accent2': t.accent2,
    '--b-muted': t.muted,
    '--b-font': FONTS[t.typeface],
    '--b-accent-text': ensureContrast(t.accent, t.paper, 4.5, t.ink),
    '--b-muted-text': ensureContrast(t.muted, t.paper, 4.5, t.ink),
    '--b-on-accent': onAccent,
    '--b-soft': mix(t.paper, t.accent, 0.12),
  };
}
