import { describe, expect, it } from 'vitest';
import { contrast } from '../components/brochure/art/color.js';
import { ICON_NAMES } from '../components/ui/Icon.jsx';
import { BROCHURES, FEATURED_BROCHURES } from './brochures.js';
import { CATEGORIES } from './categories.js';
import { REGIONS } from './regions.js';
import { ART_STYLES, FORMATS, PAGE_TYPES } from './schema.js';
import { SEASONS } from './seasons.js';
import { TEMPLATES } from '../components/studio/templates.js';
import { getPhoto } from './photos/index.js';
import { photoIdsIn } from './photos/registry.js';

const REQUIRED = ['id', 'slug', 'title', 'titleJp', 'subtitle', 'category', 'region', 'seasons', 'organization', 'summary', 'tags', 'format', 'updatedAt', 'readMinutes', 'source', 'theme', 'cover', 'pages'];
const HEX = /^#[0-9a-f]{6}$/i;
const ids = (list) => new Set(list.map((x) => x.id));

/** Every art style a brochure references: its cover plus its gallery tiles. */
function artIn(brochure) {
  return [brochure.cover.art, ...brochure.pages.filter((p) => p.type === 'gallery').flatMap((p) => p.items.map((i) => i.art))];
}

describe('built-in brochures', () => {
  it('ships at least ten brochures with unique ids and slugs, about half featured', () => {
    expect(BROCHURES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(BROCHURES.map((b) => b.id)).size).toBe(BROCHURES.length);
    expect(new Set(BROCHURES.map((b) => b.slug)).size).toBe(BROCHURES.length);
    expect(FEATURED_BROCHURES.length).toBeGreaterThanOrEqual(4);
    expect(FEATURED_BROCHURES.length).toBeLessThanOrEqual(6);
  });

  it('keeps the original Kyoto and Tokyo brochures', () => {
    expect(BROCHURES.map((b) => b.slug)).toEqual(expect.arrayContaining(['kyoto-thousand-gates', 'tokyo-after-dark']));
  });

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s matches the schema', (_slug, b) => {
    for (const key of REQUIRED) expect(b, key).toHaveProperty(key);
    expect(b.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(ids(CATEGORIES).has(b.category)).toBe(true);
    expect(ids(REGIONS).has(b.region)).toBe(true);
    expect(b.seasons.length).toBeGreaterThan(0);
    for (const season of b.seasons) expect(ids(SEASONS).has(season)).toBe(true);
    expect(ids(FORMATS).has(b.format)).toBe(true);
    expect(b.source).toBe('builtin');
    expect(Number.isNaN(Date.parse(b.updatedAt))).toBe(false);
    expect(b.readMinutes).toBeGreaterThan(0);
    expect(ART_STYLES).toContain(b.cover.art);
    expect(Number.isInteger(b.cover.seed)).toBe(true);
    for (const key of ['paper', 'ink', 'accent', 'accent2', 'muted']) expect(b.theme[key]).toMatch(HEX);
    expect(['serif', 'sans', 'mono']).toContain(b.theme.typeface);
  });

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s has 12–15 valid pages, cover first and back last', (_slug, b) => {
    expect(b.pages.length).toBeGreaterThanOrEqual(12);
    expect(b.pages.length).toBeLessThanOrEqual(15);
    expect(b.pages[0].type).toBe('cover');
    expect(b.pages.at(-1).type).toBe('back');
    expect(new Set(b.pages.map((p) => p.id)).size).toBe(b.pages.length);
    for (const page of b.pages) expect(Object.keys(PAGE_TYPES)).toContain(page.type);
    expect(new Set(b.pages.map((p) => p.type)).size).toBeGreaterThanOrEqual(8);
  });

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s uses only known art styles and icons with sensible counts', (_slug, b) => {
    for (const art of artIn(b)) expect(ART_STYLES).toContain(art);
    for (const page of b.pages) {
      if (page.type === 'gallery') expect(page.items.length).toBeGreaterThanOrEqual(2);
      if (page.type === 'stats') for (const item of page.items) expect(Number.isFinite(item.value)).toBe(true);
      if (page.type === 'phrases') {
        expect(page.items.length).toBeGreaterThanOrEqual(3);
        expect(page.items.length).toBeLessThanOrEqual(6);
        for (const item of page.items) expect(item.jp).toMatch(/[぀-ヿ一-龯]/);
      }
      if (page.type === 'features') for (const item of page.items) expect(ICON_NAMES).toContain(item.icon);
      if (page.type === 'contact') {
        for (const d of page.details) {
          expect(ICON_NAMES).toContain(d.icon);
          // Built-ins carry official websites only: no email addresses, no phone numbers.
          expect(d.value).not.toContain('@');
          expect(d.value).not.toMatch(/\+81|^\+?[\d\s().-]{7,}$/);
        }
      }
    }
  });

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s has a legible palette', (_slug, b) => {
    const { paper, ink, accent, muted } = b.theme;
    expect(contrast(ink, paper)).toBeGreaterThanOrEqual(7);
    expect(contrast(muted, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accent, paper)).toBeGreaterThanOrEqual(3);
  });

  it('covers every category and region, with at least three dark papers', () => {
    expect(new Set(BROCHURES.map((b) => b.category))).toEqual(ids(CATEGORIES));
    expect(new Set(BROCHURES.map((b) => b.region))).toEqual(ids(REGIONS));
    const dark = BROCHURES.filter((b) => contrast(b.theme.paper, '#000000') < 2);
    expect(dark.length).toBeGreaterThanOrEqual(3);
  });
});

describe('real places (docs/REAL_CONTENT.md)', () => {
  const inJapan = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat > 20 && lat < 46 && lng > 122 && lng < 154;

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s is a Tabi Guides brochure about a real, located, sourced place', (_slug, b) => {
    expect(b.organization).toBe('Tabi Guides');
    expect(b.location).toBeTruthy();
    expect(b.location.name).toBeTruthy();
    expect(b.location.nameJp).toMatch(/[぀-ヿ一-龯]/);
    expect(inJapan(b.location.lat, b.location.lng)).toBe(true);
    expect(Array.isArray(b.sources)).toBe(true);
    expect(b.sources.length).toBeGreaterThanOrEqual(2);
    for (const source of b.sources) {
      expect(source.label).toBeTruthy();
      expect(source.url).toMatch(/^https:\/\//);
    }
  });

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s has no invented testimonials and honest "checked" claims', (_slug, b) => {
    for (const page of b.pages) {
      if (page.type === 'quote') expect(page.role ?? '').not.toMatch(/traveller|traveler|guest|customer|member since|visitor,/i);
      if (page.type === 'place') {
        expect(inJapan(page.lat, page.lng)).toBe(true);
        if (page.website) expect(page.website).toMatch(/^https:\/\//);
      }
      if (page.type === 'map') for (const place of page.places) expect(inJapan(place.lat, place.lng)).toBe(true);
    }
    const back = b.pages.at(-1);
    if (/facts checked/i.test(back.tagline ?? '')) expect(b.factsChecked).toBeTruthy();
  });

  it.each(BROCHURES.map((b) => [b.slug, b]))('%s only references photos that exist in a manifest', (_slug, b) => {
    for (const id of photoIdsIn(b)) expect(getPhoto(id), id).not.toBeNull();
  });
});

// Only the Studio templates' testimonials are fictional now: Home's postcards
// are real haiku (docs/research/home.md §1.1; checked in pages/Home/homeContent.test.js).
describe('fictional readers', () => {
  it('never reuse a first name across template testimonials (regression)', () => {
    const quotes = TEMPLATES.map((t) => t.brochure).flatMap((b) => b.pages.filter((p) => p.type === 'quote').map((p) => p.author));
    const people = quotes.flatMap((name) => name.split(/\s*&\s*/));
    const firstNames = people.map((person) => person.trim().split(/\s+/)[0]);
    expect(firstNames.length).toBeGreaterThan(1);
    expect(firstNames.filter((name, i) => firstNames.indexOf(name) !== i)).toEqual([]);
  });
});
