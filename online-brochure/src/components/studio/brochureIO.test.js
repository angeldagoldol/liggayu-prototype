import { describe, expect, it } from 'vitest';
import { EXPORT_FORMAT, MAX_IMPORT_BYTES, exportFileName, parseBrochureJson, serializeBrochure } from './brochureIO.js';
import { createFromTemplate } from './templates.js';

let n = 0;
const makeId = (prefix) => `${prefix}_${(n += 1)}`;
const now = new Date('2026-10-01T00:00:00Z');

describe('export', () => {
  it('wraps the brochure in a versioned envelope without volatile fields', () => {
    const doc = { ...createFromTemplate('food-crawl', { makeId, now }), slug: 'x', featured: true };
    const data = JSON.parse(serializeBrochure(doc));
    expect(data.format).toBe(EXPORT_FORMAT);
    expect(data.brochure.title).toBe(doc.title);
    expect(data.brochure).not.toHaveProperty('slug');
    expect(data.brochure).not.toHaveProperty('featured');
  });

  it('names files after the title', () => {
    expect(exportFileName({ title: 'Tokyo in 48 Hours' })).toBe('tokyo-in-48-hours.tabi.json');
    expect(exportFileName({ title: '東京' })).toBe('brochure.tabi.json');
  });
});

describe('import', () => {
  it('round-trips an export into a fresh draft', () => {
    const doc = createFromTemplate('temple-trail', { makeId, now });
    const result = parseBrochureJson(serializeBrochure(doc), { makeId, now });
    expect(result.ok).toBe(true);
    expect(result.doc.title).toBe(doc.title);
    expect(result.doc.id).not.toBe(doc.id);
    expect(result.doc.pages.map((p) => p.type)).toEqual(doc.pages.map((p) => p.type));
    expect(result.doc.pages[2].items).toEqual(doc.pages[2].items);
    expect(result.dropped).toBe(0);
  });

  it('accepts a bare brochure object', () => {
    const result = parseBrochureJson(JSON.stringify({ title: 'Bare', pages: [{ type: 'cover', title: 'Hi' }] }), { makeId, now });
    expect(result.ok).toBe(true);
    expect(result.doc.pages[0]).toMatchObject({ type: 'cover', title: 'Hi' });
  });

  it('sanitises enums, colours, tags and cover art', () => {
    const raw = {
      title: 'T',
      category: 'spaceships',
      region: 'mars',
      seasons: ['spring', 'monsoon', 'spring'],
      format: 'scroll',
      tags: ['Ramen', 'ramen', 42, '  Night  '],
      theme: { paper: 'red', ink: '#000', typeface: 'comic' },
      cover: { art: 'dragon', seed: '-3' },
      featured: true,
      source: 'builtin',
      pages: [{ type: 'cover', id: 'dup' }, { type: 'poster' }, { type: 'back', id: 'dup', fn: null }],
    };
    const { ok, doc, dropped } = parseBrochureJson(JSON.stringify(raw), { makeId, now });
    expect(ok).toBe(true);
    expect(doc).toMatchObject({ category: 'heritage', region: 'kansai', seasons: ['spring'], format: 'booklet', source: 'user', featured: false });
    expect(doc.tags).toEqual(['ramen', 'night']);
    expect(doc.theme.ink).toBe('#000');
    expect(doc.theme.paper).toMatch(/^#[0-9a-f]{6}$/);
    expect(doc.theme.typeface).toBe('serif');
    expect(doc.cover).toEqual({ art: 'hinomaru', seed: 1 });
    expect(dropped).toBe(1);
    expect(new Set(doc.pages.map((p) => p.id)).size).toBe(2);
  });

  it('explains what went wrong', () => {
    expect(parseBrochureJson('', { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/empty/) });
    expect(parseBrochureJson('{nope', { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/valid JSON/) });
    expect(parseBrochureJson('{"title":"x"}', { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/no pages/) });
    expect(parseBrochureJson('{"pages":[{"type":"poster"}]}', { makeId })).toMatchObject({ ok: false });
    expect(parseBrochureJson('x'.repeat(MAX_IMPORT_BYTES + 1), { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/too large/) });
  });
});
