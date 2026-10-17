import { estimateReadMinutes, formatCompact, formatDate, formatNumber, pad, pluralize } from './format.js';

describe('format', () => {
  it('formats dates and returns "" for invalid ones', () => {
    expect(formatDate('2026-10-17T12:00:00Z')).toBe('Oct 17, 2026');
    expect(formatDate(new Date(2026, 0, 2))).toBe('Jan 2, 2026');
    expect(formatDate('not a date')).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formats numbers with grouping and in compact form', () => {
    expect(formatNumber(14125)).toBe('14,125');
    expect(formatNumber(3.5)).toBe('3.5');
    expect(formatCompact(1_250_000)).toBe('1.3M');
    expect(formatCompact(980)).toBe('980');
  });

  it('pluralizes with an optional irregular plural', () => {
    expect(pluralize(1, 'page')).toBe('1 page');
    expect(pluralize(0, 'page')).toBe('0 pages');
    expect(pluralize(3, 'ferry', 'ferries')).toBe('3 ferries');
  });

  it('zero-pads folios', () => {
    expect(pad(3)).toBe('03');
    expect(pad(12)).toBe('12');
    expect(pad(7, 3)).toBe('007');
  });

  it('estimates at least one minute of reading', () => {
    expect(estimateReadMinutes(undefined)).toBe(1);
    expect(estimateReadMinutes({ pages: [] })).toBe(1);
    const long = { pages: [{ body: Array.from({ length: 2200 }, () => 'word').join(' ') }] };
    expect(estimateReadMinutes(long)).toBe(10);
  });
});
