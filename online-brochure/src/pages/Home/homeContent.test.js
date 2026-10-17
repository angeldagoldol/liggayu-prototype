import { describe, expect, it } from 'vitest';
import { insets, main } from '../../data/geo/japan.js';
import { getPhoto } from '../../data/photos/index.js';
import { REGIONS } from '../../data/regions.js';
import { ART_STYLES } from '../../data/schema.js';
import { SEASONS } from '../../data/seasons.js';
import { FACTS, HAIKU, HERO_PANELS, MAP_SOURCE, REGION_NOTES, SEASON_LINES, SEASON_PHOTOS, SECTIONS, TRANSLATION_CREDIT, WORDS } from './homeContent.js';

/** The poems exactly as logged in docs/research/home.md §1.1. */
const RESEARCHED_HAIKU = {
  'basho-furuike': '古池や蛙飛びこむ水の音',
  'basho-hiraizumi': '夏草や兵どもが夢の跡',
  'basho-yamadera': '閑さや岩にしみ入る蝉の声',
  'issa-kashiwabara': '是がまあつひの栖か雪五尺',
  'shiki-horyuji': '柿食へば鐘が鳴るなり法隆寺',
};

describe('haiku postcards (no invented people)', () => {
  it('are the five researched poems, word for word', () => {
    expect(Object.fromEntries(HAIKU.map((h) => [h.id, h.jp.join('')]))).toEqual(RESEARCHED_HAIKU);
  });

  it('are by real poets of the public-domain era, with their names in Japanese', () => {
    const poets = { 'Matsuo Bashō': '松尾芭蕉', 'Kobayashi Issa': '小林一茶', 'Masaoka Shiki': '正岡子規' };
    for (const h of HAIKU) {
      expect(poets[h.poet], h.id).toBe(h.poetJp);
    }
  });

  it('give each poem three phrases in Japanese, romaji and translation, plus a place, postmark and year', () => {
    for (const h of HAIKU) {
      for (const lines of [h.jp, h.romaji, h.en]) {
        expect(lines, h.id).toHaveLength(3);
        lines.forEach((line) => expect(line.trim(), h.id).not.toBe(''));
      }
      expect(h.place, h.id).toBeTruthy();
      expect(h.postmark, h.id).toMatch(/^[A-Z]+$/);
      expect(h.year, h.id).toMatch(/^(c\. )?\d{4}$/);
      expect(ART_STYLES, h.id).toContain(h.art);
    }
  });

  it('softens the year the research marks uncertain, and credits our translations', () => {
    expect(HAIKU.find((h) => h.id === 'issa-kashiwabara').year).toBe('c. 1812');
    expect(TRANSLATION_CREDIT).toBe('Translation: Tabi Guides');
    expect(SECTIONS.haiku).toEqual({ num: '08', label: 'Haiku', jp: '俳句' });
  });
});

describe('Japan in numbers (research corrections)', () => {
  const note = (id) => FACTS.find((f) => f.id === id).note;

  it('does not claim more than the sources support', () => {
    expect(note('volcanoes')).toMatch(/^About 50 /);
    expect(note('shinkansen')).toContain('between Utsunomiya and Morioka');
    expect(note('islands')).toContain('6,852');
  });

  it('keeps the figures themselves', () => {
    expect(Object.fromEntries(FACTS.map((f) => [f.id, f.value]))).toEqual({ prefectures: 47, islands: 14125, volcanoes: 111, shinkansen: 320 });
  });
});

describe('copy corrections', () => {
  const meaning = (romaji) => WORDS.flat().find((w) => w.romaji === romaji).meaning;

  it('glosses ma and wabi-sabi as the research suggests', () => {
    expect(meaning('ma')).toBe('the space between');
    expect(meaning('wabi-sabi')).toBe('beauty in the imperfect and impermanent');
  });

  it('matches the summer line to its photograph (lavender)', () => {
    expect(SEASON_LINES.summer).toContain('lavender in Hokkaidō');
    expect(SEASON_LINES.autumn).toContain('from the peaks down');
  });
});

describe('photo slots', () => {
  it('point at photos the home manifest lists', () => {
    const ids = [...Object.values(HERO_PANELS).map((p) => p.photo), ...Object.values(SEASON_PHOTOS), ...Object.values(REGION_NOTES).map((n) => n.photo)];
    for (const id of ids) {
      expect(id).toMatch(/^home-/);
      expect(getPhoto(id), id).not.toBeNull();
    }
  });

  it('cover every season and every region, each with fallback art', () => {
    expect(Object.keys(SEASON_PHOTOS).sort()).toEqual(SEASONS.map((s) => s.id).sort());
    expect(Object.keys(REGION_NOTES).sort()).toEqual(REGIONS.map((r) => r.id).sort());
    for (const [id, note] of Object.entries(REGION_NOTES)) {
      expect(ART_STYLES, id).toContain(note.art);
      expect(note.place, id).toBeTruthy();
      expect(note.placeJp, id).toMatch(/[぀-ヿ一-鿿]/);
      expect(note.knownFor.length, id).toBeLessThanOrEqual(100);
    }
  });

  it('keep the hero panel bodies short enough for the panel (≤ 80 characters)', () => {
    for (const panel of Object.values(HERO_PANELS)) {
      expect(panel.body.length, panel.title).toBeLessThanOrEqual(80);
      expect(ART_STYLES).toContain(panel.art);
    }
  });
});

describe('map source line', () => {
  it('states the inset scale the generated map really uses', () => {
    const okinawa = insets.find((i) => i.id === 'okinawa');
    const scale = (okinawa.projection.scale / main.projection.scale).toFixed(2);
    expect(MAP_SOURCE).toContain(`Okinawa & Amami inset ×${scale}`);
    expect(okinawa.label).toBe('Okinawa & Amami');
  });
});
