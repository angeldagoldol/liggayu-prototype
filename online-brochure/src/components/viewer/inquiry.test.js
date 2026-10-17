import { describe, expect, it } from 'vitest';
import {
  appendInquiry,
  createInquiry,
  initialInquiry,
  MAX_SAVED_INQUIRIES,
  suggestMonth,
  toggleInterest,
  upcomingMonths,
  validateInquiry,
} from './inquiry.js';

const NOW = new Date(2026, 9, 17, 12); // 17 October 2026, local time
const months = upcomingMonths(NOW);
const kyoto = { id: 'b_k', slug: 'kyoto', title: 'Kyoto', organization: 'Kōen', category: 'heritage', seasons: ['spring', 'autumn'] };

describe('upcomingMonths', () => {
  it('lists the next twelve months, starting next month', () => {
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ value: '2026-11', label: 'November 2026', season: 'autumn' });
    expect(months[1].season).toBe('winter');
    expect(months[11].value).toBe('2027-10');
  });

  it('rolls over the year from December', () => {
    expect(upcomingMonths(new Date(2026, 11, 3), 2).map((m) => m.value)).toEqual(['2027-01', '2027-02']);
  });
});

describe('suggestMonth / initialInquiry', () => {
  it('suggests the first month in a best season', () => {
    expect(suggestMonth(months, ['spring'])).toBe('2027-03');
    expect(suggestMonth(months, [])).toBe('2026-11');
  });

  it('pre-fills from the brochure', () => {
    const values = initialInquiry(kyoto, months);
    expect(values.month).toBe('2026-11');
    expect(values.travellers).toBe(2);
    expect(values.interests).toEqual(['temples']);
  });

  it('copes with a brochure missing fields', () => {
    expect(initialInquiry({}, months).interests).toEqual([]);
  });
});

describe('validateInquiry', () => {
  const valid = { name: 'Aiko', email: 'aiko@example.com', month: '2026-11', travellers: 2, interests: [], message: '' };

  it('accepts a complete form', () => {
    expect(validateInquiry(valid, months)).toEqual({});
  });

  it('flags every missing or wrong field', () => {
    const errors = validateInquiry({ name: ' ', email: 'aiko@', month: '1999-01', travellers: 0, message: 'x'.repeat(1001) }, months);
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'month', 'name', 'travellers']);
  });

  it('rejects too many travellers', () => {
    expect(validateInquiry({ ...valid, travellers: 13 }, months).travellers).toBeDefined();
  });
});

describe('toggleInterest', () => {
  it('adds, removes and ignores unknown ids', () => {
    expect(toggleInterest([], 'food')).toEqual(['food']);
    expect(toggleInterest(['food', 'onsen'], 'food')).toEqual(['onsen']);
    expect(toggleInterest(['food'], 'karaoke')).toEqual(['food']);
  });
});

describe('createInquiry / appendInquiry', () => {
  it('builds a trimmed record', () => {
    const record = createInquiry({ name: ' Aiko ', email: ' a@b.jp ', month: '2027-03', travellers: '3', interests: ['food', 'x'], message: ' Hi ' }, kyoto, NOW);
    expect(record).toMatchObject({
      brochureId: 'b_k',
      brochureSlug: 'kyoto',
      name: 'Aiko',
      email: 'a@b.jp',
      travellers: 3,
      interests: ['food'],
      message: 'Hi',
      createdAt: NOW.toISOString(),
    });
  });

  it('appends to corrupt storage and keeps the newest', () => {
    expect(appendInquiry('nope', { id: 1 })).toEqual([{ id: 1 }]);
    const full = Array.from({ length: MAX_SAVED_INQUIRIES }, (_, i) => ({ id: i }));
    const next = appendInquiry(full, { id: 'new' });
    expect(next).toHaveLength(MAX_SAVED_INQUIRIES);
    expect(next.at(-1)).toEqual({ id: 'new' });
    expect(next[0]).toEqual({ id: 1 });
  });
});
