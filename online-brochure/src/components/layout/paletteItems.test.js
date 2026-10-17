import { describe, expect, it } from 'vitest';
import { actionItems, brochureItem, createPaletteIndex, pageItems, queryPalette } from './paletteItems.js';

const make = (id, extra = {}) => ({
  id,
  slug: id,
  title: `${id} title`,
  titleJp: '旅',
  category: 'food',
  region: 'kansai',
  seasons: ['autumn'],
  tags: [],
  summary: '',
  pages: [],
  source: 'builtin',
  ...extra,
});

const brochures = [
  make('osaka', { title: 'Osaka Eats', titleJp: '大阪', tags: ['takoyaki', 'street food'] }),
  make('kyoto', { title: 'Kyoto: A Thousand Gates', titleJp: '京都', category: 'heritage', featured: true }),
  make('tohoku', { title: 'Northern Baths', titleJp: '東北', region: 'tohoku', category: 'onsen' }),
];

describe('createPaletteIndex / queryPalette', () => {
  const palette = createPaletteIndex({ brochures, theme: 'light' });

  it('shows recent, suggested (featured first), main pages and actions for an empty query', () => {
    const { groups, flat } = queryPalette(palette, '', ['tohoku', 'missing-id']);
    expect(groups.map((g) => g.id)).toEqual(['recent', 'suggested', 'pages', 'actions']);
    expect(groups[0].items.map((i) => i.brochure.id)).toEqual(['tohoku']);
    expect(groups[1].items.map((i) => i.brochure.id)).toEqual(['kyoto', 'osaka']);
    expect(groups[2].items.map((i) => i.title)).toEqual(['Home', 'Brochure library', 'Studio']);
    expect(flat.map((i) => i.index)).toEqual(flat.map((_, i) => i));
    expect(new Set(flat.map((i) => i.id)).size).toBe(flat.length);
  });

  it('omits the recent group when nothing was viewed', () => {
    const { groups } = queryPalette(palette, '', []);
    expect(groups[0].id).toBe('suggested');
  });

  it('finds brochures by region without diacritics, and by tag', () => {
    const tohoku = queryPalette(palette, 'tohoku');
    // The exact region shortcut wins; the brochure matched via its region follows.
    expect(tohoku.flat[0].to).toBe('/brochures?region=tohoku');
    const brochureGroup = tohoku.groups.find((g) => g.id === 'brochures');
    expect(brochureGroup.items.map((i) => i.brochure.id)).toEqual(['tohoku']);

    const takoyaki = queryPalette(palette, 'takoyaki');
    expect(takoyaki.flat.map((i) => i.brochure?.id)).toEqual(['osaka']);
  });

  it('finds library shortcuts and actions', () => {
    const autumn = queryPalette(palette, 'autumn').flat.map((i) => i.to);
    expect(autumn).toContain('/brochures?season=autumn');
    expect(queryPalette(palette, 'dark').flat.some((i) => i.action === 'toggle-theme')).toBe(true);
    expect(queryPalette(palette, 'omakase').flat[0].action).toBe('random-brochure');
    expect(queryPalette(palette, 'スタジオ').flat[0].to).toBe('/studio');
  });

  it('puts the group holding the best match first', () => {
    const studio = queryPalette(createPaletteIndex({ brochures: [make('k', { organization: 'Kōen Travel Studio' })] }), 'studio');
    expect(studio.groups[0].id).toBe('pages');
    expect(studio.flat[0].to).toBe('/studio');
    expect(studio.groups.map((g) => g.id)).toContain('brochures');
  });

  it('returns no groups when nothing matches', () => {
    expect(queryPalette(palette, 'qqqzzz')).toEqual({ groups: [], flat: [] });
  });
});

describe('items', () => {
  it('builds brochure rows that survive missing fields', () => {
    const row = brochureItem({ id: 'b_1', slug: 'x', source: 'user', pages: [] });
    expect(row.title).toBe('Untitled brochure');
    expect(row.meta.startsWith('Your brochure')).toBe(true);
    expect(row.to).toBe('/brochures/x');
    expect(() => createPaletteIndex({ brochures: [row.brochure, null] })).not.toThrow();
  });

  it('labels the theme action with the mode it switches to', () => {
    expect(actionItems('light')[0].title).toBe('Switch to dark mode');
    expect(actionItems('dark')[0].title).toBe('Switch to light mode');
  });

  it('links every category, season and region into the library', () => {
    const tos = pageItems().map((p) => p.to);
    expect(tos).toContain('/brochures?category=heritage');
    expect(tos).toContain('/brochures?season=winter');
    expect(tos).toContain('/brochures?region=hokkaido');
  });
});
