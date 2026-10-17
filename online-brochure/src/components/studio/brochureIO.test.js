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
    expect(exportFileName({ title: '東京' })).toBe('東京.tabi.json');
    expect(exportFileName({ title: '🗻' })).toBe('brochure.tabi.json');
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

  it('treats Object.prototype names as unknown ids (regression)', () => {
    const raw = JSON.stringify({
      title: 'x',
      category: 'toString',
      region: '__proto__',
      seasons: ['constructor', 'hasOwnProperty', 'winter'],
      pages: [{ type: 'constructor' }, { type: 'cover' }, { type: 'features', items: [{ icon: 'constructor', title: 'Hi' }] }],
    });
    const { ok, doc, dropped } = parseBrochureJson(raw, { makeId, now });
    expect(ok).toBe(true);
    expect(doc).toMatchObject({ category: 'heritage', region: 'kansai', seasons: ['winter'] });
    expect(doc.pages.map((p) => p.type)).toEqual(['cover', 'features']);
    expect(dropped).toBe(1);
  });

  it('never lets a "__proto__" key re-parent imported content (regression)', () => {
    const raw = '{"pages":[{"type":"features","items":[{"text":"Hi","__proto__":{"title":"inherited"}}]}]}';
    const { doc } = parseBrochureJson(raw, { makeId, now });
    const [item] = doc.pages[0].items;
    expect(Object.getPrototypeOf(item)).toBe(Object.prototype);
    expect(item.title).toBeUndefined();
    expect(item).toEqual({ text: 'Hi' });
  });

  it('explains what went wrong', () => {
    expect(parseBrochureJson('', { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/empty/) });
    expect(parseBrochureJson('{nope', { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/valid JSON/) });
    expect(parseBrochureJson('{"title":"x"}', { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/no pages/) });
    expect(parseBrochureJson('{"pages":[{"type":"poster"}]}', { makeId })).toMatchObject({ ok: false });
    expect(parseBrochureJson('x'.repeat(MAX_IMPORT_BYTES + 1), { makeId })).toMatchObject({ ok: false, error: expect.stringMatching(/too large/) });
  });
});

describe('import of real-place fields', () => {
  const brochure = {
    title: 'Kyoto',
    cover: { art: 'torii', seed: 5, photo: ' kyoto-senbon-torii ' },
    location: { name: 'Fushimi Inari Taisha', nameJp: '伏見稲荷大社', prefecture: 'Kyoto', lat: 34.9671, lng: 135.7727, extra: { deep: true } },
    sources: [
      { label: 'Fushimi Inari Taisha', url: 'https://inari.jp/en/' },
      { label: 'Evil', url: 'javascript:alert(document.cookie)' },
      { label: 'Data', url: 'data:text/html;base64,PHNjcmlwdD4=' },
    ],
    factsChecked: 'October 2026',
    pages: [
      { type: 'cover', title: 'Kyoto', photo: 'kyoto-senbon-torii' },
      {
        type: 'place',
        name: 'Kiyomizu-dera',
        nameJp: '清水寺',
        photo: 'kyoto-kiyomizu-dera',
        body: 'A wooden stage.',
        facts: [
          { label: 'Hours', value: '6:00–18:00' },
          { label: 'Admission', value: 500 },
        ],
        lat: 34.9949,
        lng: 135.785,
        website: 'https://www.kiyomizudera.or.jp/en/',
      },
      { type: 'place', name: 'Bad', website: 'javascript:alert(1)', lat: 123, lng: 'east', photo: ['x'] },
      {
        type: 'map',
        heading: 'Where',
        places: [
          { name: 'Kyoto Station', lat: 34.9858, lng: 135.7588 },
          { name: 'Nowhere', lat: Infinity },
        ],
      },
      { type: 'quote', quote: 'An old pond', quoteJp: '古池や蛙飛び込む水の音', author: 'Matsuo Bashō' },
      {
        type: 'contact',
        ctaUrl: 'javascript:alert(1)',
        details: [
          { label: 'Web', value: 'kyoto.travel', url: 'https://kyoto.travel/en/' },
          { label: 'X', url: 'vbscript:msgbox' },
        ],
      },
      { type: 'gallery', items: [{ photo: 'kyoto-yasaka-pagoda', caption: 'Pagoda' }, { photo: 42 }] },
    ],
  };
  const { ok, doc } = parseBrochureJson(JSON.stringify(brochure), { makeId, now });

  it('keeps photo ids, location, sources and the facts date', () => {
    expect(ok).toBe(true);
    expect(doc.cover).toEqual({ art: 'torii', seed: 5, photo: 'kyoto-senbon-torii' });
    expect(doc.location).toEqual(brochure.location);
    expect(doc.sources).toEqual([{ label: 'Fushimi Inari Taisha', url: 'https://inari.jp/en/' }]);
    expect(doc.factsChecked).toBe('October 2026');
    expect(doc.pages[0].photo).toBe('kyoto-senbon-torii');
  });

  it('keeps valid place, map, quote and contact fields', () => {
    const [, place, , map, quote, contact, gallery] = doc.pages;
    expect(place).toMatchObject({
      name: 'Kiyomizu-dera',
      nameJp: '清水寺',
      photo: 'kyoto-kiyomizu-dera',
      lat: 34.9949,
      lng: 135.785,
      website: 'https://www.kiyomizudera.or.jp/en/',
    });
    expect(place.facts).toEqual([
      { label: 'Hours', value: '6:00–18:00' },
      { label: 'Admission', value: '500' },
    ]);
    expect(map.places).toEqual([{ name: 'Kyoto Station', lat: 34.9858, lng: 135.7588 }, { name: 'Nowhere' }]);
    expect(quote.quoteJp).toBe('古池や蛙飛び込む水の音');
    expect(contact.details[0].url).toBe('https://kyoto.travel/en/');
    expect(gallery.items).toEqual([{ photo: 'kyoto-yasaka-pagoda', caption: 'Pagoda' }, { photo: '' }]);
  });

  it('drops unsafe links and impossible coordinates', () => {
    const bad = doc.pages[2];
    expect(bad.website).toBe('');
    expect(bad).not.toHaveProperty('lat');
    expect(bad).not.toHaveProperty('lng');
    expect(bad.photo).toBe('');
    expect(doc.pages[5].ctaUrl).toBe('');
    expect(doc.pages[5].details[1].url).toBe('');
    expect(JSON.stringify(doc)).not.toMatch(/javascript:|vbscript:|data:text/);
  });

  it('leaves location and sources out when the file has none usable', () => {
    const { doc: bare } = parseBrochureJson(
      JSON.stringify({ pages: [{ type: 'cover' }], location: 'Kyoto', sources: [{ url: 'javascript:x' }], factsChecked: 7, cover: { photo: 5 } }),
      { makeId, now },
    );
    expect(bare).not.toHaveProperty('location');
    expect(bare).not.toHaveProperty('sources');
    expect(bare).not.toHaveProperty('factsChecked');
    expect(bare.cover).toEqual({ art: 'hinomaru', seed: 1 });
  });
});
