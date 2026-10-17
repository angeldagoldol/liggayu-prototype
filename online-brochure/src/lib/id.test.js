import { createId, slugify, uniqueSlug } from './id.js';

describe('createId', () => {
  it('prefixes short random ids', () => {
    const id = createId('pg');
    expect(id).toMatch(/^pg_[a-z0-9]{10}$/);
    expect(createId()).toMatch(/^id_/);
  });

  it('does not repeat itself', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId('b')));
    expect(ids.size).toBe(500);
  });
});

describe('slugify', () => {
  it('folds accents and punctuation into hyphens', () => {
    expect(slugify('Hello, Wörld!')).toBe('hello-world');
    expect(slugify('Tōhoku Summer Festivals')).toBe('tohoku-summer-festivals');
    expect(slugify('  --Kyoto & Nara--  ')).toBe('kyoto-nara');
  });

  it('drops scripts it cannot spell and caps the length', () => {
    expect(slugify('京都')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify('a'.repeat(100))).toHaveLength(64);
  });
});

describe('uniqueSlug', () => {
  it('returns the slug when free and appends -2, -3… when taken', () => {
    expect(uniqueSlug('Kyoto', [])).toBe('kyoto');
    expect(uniqueSlug('Kyoto', ['kyoto'])).toBe('kyoto-2');
    expect(uniqueSlug('Kyoto', new Set(['kyoto', 'kyoto-2']))).toBe('kyoto-3');
  });

  it('falls back to "untitled" for titles without Latin letters', () => {
    expect(uniqueSlug('京都', [])).toBe('untitled');
    expect(uniqueSlug('', ['untitled'])).toBe('untitled-2');
  });
});
