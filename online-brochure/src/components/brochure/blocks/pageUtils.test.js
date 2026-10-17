import { describe, expect, it } from 'vitest';
import { contrast } from '../art/color.js';
import {
  circledNumeral,
  fitSize,
  folio,
  formatEdition,
  kanjiNumeral,
  list,
  pageHeading,
  pageLabel,
  paragraphs,
  text,
  themeVars,
  toNumber,
} from './pageUtils.js';

const brochure = { title: 'Kyoto: A Thousand Gates', titleJp: '京都' };

describe('field helpers', () => {
  it('reads text safely', () => {
    expect(text('  hi  ')).toBe('hi');
    expect(text(12)).toBe('12');
    expect(text(null)).toBe('');
    expect(text({})).toBe('');
    expect(text(Number.NaN)).toBe('');
  });

  it('keeps only usable list items, up to a limit', () => {
    expect(list(undefined)).toEqual([]);
    expect(list([null, { a: 1 }, '', 'x', 3], 5)).toEqual([{ a: 1 }, 'x']);
    expect(list([{}, {}, {}], 2)).toHaveLength(2);
  });

  it('splits paragraphs on blank lines', () => {
    expect(paragraphs('One.\n\nTwo.\n  \nThree.')).toEqual(['One.', 'Two.', 'Three.']);
    expect(paragraphs(undefined)).toEqual([]);
  });

  it('coerces numbers', () => {
    expect(toNumber(5)).toBe(5);
    expect(toNumber('1,074')).toBe(1074);
    expect(toNumber('')).toBeNull();
    expect(toNumber('many')).toBeNull();
    expect(toNumber(Infinity)).toBeNull();
  });
});

describe('labels and numerals', () => {
  it('formats folios and Japanese numerals', () => {
    expect(folio(4, 11)).toBe('04 / 11');
    expect(folio(3, 1)).toBe('03 / 03');
    expect(kanjiNumeral(4)).toBe('四');
    expect(kanjiNumeral(12)).toBe('12');
    expect(circledNumeral(1)).toBe('①');
    expect(circledNumeral(21)).toBe('(21)');
  });

  it('finds a heading for every page type', () => {
    expect(pageHeading({ type: 'cover' }, brochure)).toBe('Kyoto: A Thousand Gates');
    expect(pageHeading({ type: 'intro', heading: 'Welcome' }, brochure)).toBe('Welcome');
    expect(pageHeading({ type: 'agenda' }, brochure)).toBe('Schedule');
    expect(pageHeading({ type: 'quote', author: 'Hannah' }, brochure)).toBe('Testimonial from Hannah');
    expect(pageHeading({ type: 'back' }, brochure)).toBe('Back cover');
    expect(pageHeading({ type: 'mystery' }, brochure)).toBe('Untitled page');
    expect(pageHeading(null, null)).toBe('Untitled page');
  });

  it('builds the page article label', () => {
    expect(pageLabel({ type: 'stats', heading: 'By the numbers' }, brochure, 3, 11)).toBe('Page 4 of 11: By the numbers');
  });

  it('formats the edition date', () => {
    expect(formatEdition('2026-09-18T09:00:00.000Z')).toBe('September 2026');
    expect(formatEdition('nope')).toBe('');
    expect(formatEdition(undefined)).toBe('');
  });
});

describe('fitSize', () => {
  it('keeps short text at full size and shrinks long text down to the floor', () => {
    expect(fitSize('Short', { max: 10, min: 4, ideal: 20 })).toBe(10);
    const medium = fitSize('x'.repeat(80), { max: 10, min: 4, ideal: 20 });
    expect(medium).toBeCloseTo(5, 5);
    expect(fitSize('x'.repeat(5000), { max: 10, min: 4, ideal: 20 })).toBe(4);
    expect(fitSize(undefined, { max: 10, min: 4, ideal: 20 })).toBe(10);
  });
});

describe('themeVars', () => {
  it('maps the theme to CSS variables with readable derived inks', () => {
    const vars = themeVars({ paper: '#f4eee2', ink: '#22140f', accent: '#f2a7b8', accent2: '#1d4f7a', muted: '#c8bfb4', typeface: 'mono' });
    expect(vars['--b-paper']).toBe('#f4eee2');
    expect(vars['--b-font']).toBe('var(--font-mono)');
    expect(contrast(vars['--b-accent-text'], '#f4eee2')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(vars['--b-muted-text'], '#f4eee2')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(vars['--b-on-accent'], '#f2a7b8')).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps accent text readable on the tinted --b-soft panel too (regression: Osaka price)', () => {
    // Osaka: the paper-tuned accent text reads 4.35:1 on the 12% accent tint.
    const vars = themeVars({ paper: '#fbefd9', ink: '#22160f', accent: '#c93a22', accent2: '#e9a21a', muted: '#6b5442', typeface: 'sans' });
    expect(contrast(vars['--b-accent-text'], vars['--b-soft'])).toBeLessThan(4.5);
    expect(contrast(vars['--b-accent-on-soft'], vars['--b-soft'])).toBeGreaterThanOrEqual(4.5);
    // A theme that already passes keeps its own accent.
    const deep = themeVars({ paper: '#ffffff', ink: '#000000', accent: '#7a1a10' });
    expect(deep['--b-accent-on-soft']).toBe('#7a1a10');
  });

  it('falls back to the default theme for missing input', () => {
    expect(themeVars(undefined)['--b-font']).toBe('var(--font-display)');
  });
});
