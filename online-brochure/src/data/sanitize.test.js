import { describe, expect, it } from 'vitest';
import { BROCHURES } from './brochures.js';
import { normalizeBrochure, sanitizePages, sanitizeStoredBrochure } from './sanitize.js';

const cover = { id: 'p1', type: 'cover', title: 'Hi' };

describe('sanitizePages', () => {
  it('keeps object pages with a string id and a known type, first id wins', () => {
    const pages = [null, 'x', [], { type: 'intro' }, { id: 7, type: 'intro' }, { id: 'a', type: 'poster' }, { id: 'b', type: 'constructor' }, cover, { ...cover, title: 'dup' }];
    expect(sanitizePages(pages)).toEqual([cover]);
    expect(sanitizePages(undefined)).toEqual([]);
  });
});

describe('normalizeBrochure', () => {
  it('returns every built-in brochure unchanged', () => {
    for (const b of BROCHURES) expect(JSON.stringify(normalizeBrochure(b))).toBe(JSON.stringify(b));
  });

  it('drops values that are not brochures or have no readable pages', () => {
    expect(normalizeBrochure(null)).toBeNull();
    expect(normalizeBrochure([cover])).toBeNull();
    expect(normalizeBrochure({ pages: [null, { id: 'x' }] })).toBeNull();
  });

  it('resets fields of the wrong type and leaves missing ones missing', () => {
    const doc = normalizeBrochure({
      title: { en: 'x' },
      subtitle: 3,
      titleJp: '京都',
      category: 'toString',
      region: 'mars',
      format: 'scroll',
      seasons: ['constructor', 'spring', 'spring', 4],
      tags: ['ok', null],
      theme: 'red',
      cover: { art: 'dragon', seed: '2' },
      readMinutes: { n: 1 },
      featured: 'yes',
      pages: [cover],
    });
    expect(doc).toEqual({
      title: '',
      subtitle: '',
      titleJp: '京都',
      category: 'heritage',
      region: 'kansai',
      format: 'booklet',
      seasons: ['spring'],
      tags: ['ok'],
      theme: {},
      cover: { art: 'hinomaru', seed: 1 },
      readMinutes: 1,
      featured: false,
      pages: [cover],
    });
    expect(normalizeBrochure({ pages: [cover] })).toEqual({ pages: [cover] });
  });
});

describe('sanitizeStoredBrochure', () => {
  it('also needs a non-empty string id and slug', () => {
    expect(sanitizeStoredBrochure({ id: 'b_1', slug: 's', pages: [cover] })).toEqual({ id: 'b_1', slug: 's', pages: [cover] });
    expect(sanitizeStoredBrochure({ id: 'b_1', slug: '', pages: [cover] })).toBeNull();
    expect(sanitizeStoredBrochure({ id: 1, slug: 's', pages: [cover] })).toBeNull();
  });
});
