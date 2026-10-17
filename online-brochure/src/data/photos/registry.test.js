import { describe, expect, it } from 'vitest';
import { createPhotoRegistry, photoIdsIn, photoUrl, pickWidth } from './registry.js';
import * as live from './index.js';

const manifests = {
  './manifest/kyoto.json': {
    brochure: 'kyoto',
    photos: [
      {
        id: 'kyoto-senbon-torii',
        use: 'cover',
        candidates: ['File:A.jpg'],
        alt: 'A tunnel of vermilion torii gates',
        caption: 'Senbon Torii',
        place: 'Fushimi Inari Taisha',
        focus: '50% 45%',
      },
      { id: 'kyoto-kiyomizu', use: 'wide', candidates: ['File:B.jpg'], alt: 'A wooden temple stage over maples', caption: 'Kiyomizu-dera' },
      { id: 'kyoto-senbon-torii', alt: 'duplicate, ignored' },
      { alt: 'no id' },
      null,
    ],
  },
  './manifest/tokyo.json': [{ id: 'tokyo-shibuya', alt: 'A crossing' }],
};

const generated = {
  'kyoto-senbon-torii': {
    id: 'kyoto-senbon-torii',
    file: 'File:A.jpg',
    width: 1600,
    height: 2400,
    widths: [960, 480, 1600],
    lqip: 'data:image/webp;base64,UklGRl4AAABXRUJQ',
    color: '#b8432a',
    title: 'Senbon Torii, Fushimi Inari',
    author: 'Example Photographer',
    authorUrl: 'https://commons.wikimedia.org/wiki/User:Example',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A.jpg',
    attributionRequired: true,
    fetchedAt: '2026-10-17T00:00:00.000Z',
  },
  'imported-only': {
    id: 'imported-only',
    file: 'local:x.jpg',
    width: 960,
    height: 640,
    widths: [480, 960],
    lqip: 'javascript:alert(1)',
    color: 'red',
    author: 'Me',
    authorUrl: 'javascript:alert(1)',
    license: '© Me',
    licenseUrl: 'data:text/html,<b>x</b>',
    sourceUrl: '/photos/x.jpg',
    attributionRequired: true,
  },
  'css-breakout': {
    widths: [480],
    width: 480,
    height: 320,
    lqip: 'data:image/webp;base64,AAAA"), url("https://tracker.example/x.png',
  },
  'broken-record': 'not an object',
};

const registry = createPhotoRegistry(manifests, generated);

describe('createPhotoRegistry', () => {
  it('merges a downloaded photo with its manifest entry', () => {
    const photo = registry.getPhoto('kyoto-senbon-torii');
    expect(photo).toMatchObject({
      id: 'kyoto-senbon-torii',
      alt: 'A tunnel of vermilion torii gates',
      caption: 'Senbon Torii',
      place: 'Fushimi Inari Taisha',
      focus: '50% 45%',
      use: 'cover',
      width: 1600,
      height: 2400,
      widths: [480, 960, 1600],
      color: '#b8432a',
      available: true,
      attributionRequired: true,
      credit: {
        title: 'Senbon Torii, Fushimi Inari',
        author: 'Example Photographer',
        authorUrl: 'https://commons.wikimedia.org/wiki/User:Example',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:A.jpg',
      },
    });
    expect(photo.lqip).toMatch(/^data:image\/webp;base64,/);
  });

  it('serves relative URLs for the smallest width that covers the slot', () => {
    const photo = registry.getPhoto('kyoto-senbon-torii');
    expect(photo.src(300)).toBe('photos/kyoto-senbon-torii-480.webp');
    expect(photo.src(700)).toBe('photos/kyoto-senbon-torii-960.webp');
    expect(photo.src(5000)).toBe('photos/kyoto-senbon-torii-1600.webp');
    expect(photo.src()).toBe('photos/kyoto-senbon-torii-1600.webp');
    expect(photo.srcSet).toBe('photos/kyoto-senbon-torii-480.webp 480w, photos/kyoto-senbon-torii-960.webp 960w, photos/kyoto-senbon-torii-1600.webp 1600w');
    expect(photo.src(480)).not.toMatch(/^\/|^https?:/);
  });

  it('knows listed photos that are not downloaded yet', () => {
    const photo = registry.getPhoto('kyoto-kiyomizu');
    expect(photo).toMatchObject({ available: false, width: null, height: null, lqip: '', color: '', srcSet: '', focus: '50% 50%', use: 'wide' });
    expect(photo.src(960)).toBeNull();
  });

  it('accepts bare photo arrays and generated-only records, dropping unsafe values', () => {
    expect(registry.getPhoto('tokyo-shibuya')).toMatchObject({ alt: 'A crossing', available: false });
    expect(registry.getPhoto('imported-only')).toMatchObject({
      alt: '',
      available: true,
      lqip: '',
      color: '',
      credit: { license: '© Me', authorUrl: '', licenseUrl: '', sourceUrl: '' },
    });
    expect(registry.getPhoto('css-breakout').lqip).toBe('');
    expect(registry.getPhoto('broken-record')).toBeNull();
  });

  it('returns null for unknown ids and non-strings, including prototype names', () => {
    for (const id of ['nope', '', undefined, null, 7, {}, 'constructor', '__proto__', 'toString']) expect(registry.getPhoto(id)).toBeNull();
  });

  it('lists photos by id', () => {
    expect(registry.listPhotos().map((p) => p.id)).toEqual(['css-breakout', 'imported-only', 'kyoto-kiyomizu', 'kyoto-senbon-torii', 'tokyo-shibuya']);
  });

  it('survives empty input', () => {
    const empty = createPhotoRegistry();
    expect(empty.listPhotos()).toEqual([]);
    expect(createPhotoRegistry(null, null).getPhoto('x')).toBeNull();
  });
});

describe('photoIdsIn / creditsFor', () => {
  const brochure = {
    cover: { art: 'torii', seed: 5, photo: 'kyoto-senbon-torii' },
    pages: [
      { id: 'p1', type: 'cover', photo: 'kyoto-senbon-torii' },
      { id: 'p2', type: 'intro', photo: 'kyoto-kiyomizu' },
      { id: 'p3', type: 'place', photo: ' imported-only ' },
      { id: 'p4', type: 'features', items: [{ title: 'x', photo: 'tokyo-shibuya' }, null, { photo: 3 }] },
      { id: 'p5', type: 'gallery', items: [{ photo: 'kyoto-senbon-torii' }, { photo: 'unknown-photo' }] },
      null,
    ],
  };

  it('collects every photo id once, in reading order', () => {
    expect(photoIdsIn(brochure)).toEqual(['kyoto-senbon-torii', 'kyoto-kiyomizu', 'imported-only', 'tokyo-shibuya', 'unknown-photo']);
    expect(photoIdsIn(null)).toEqual([]);
    expect(photoIdsIn({ pages: 'x', cover: 'y' })).toEqual([]);
  });

  it('credits only the photos that are actually shown', () => {
    expect(registry.creditsFor(brochure)).toEqual([
      {
        id: 'kyoto-senbon-torii',
        caption: 'Senbon Torii',
        place: 'Fushimi Inari Taisha',
        title: 'Senbon Torii, Fushimi Inari',
        author: 'Example Photographer',
        authorUrl: 'https://commons.wikimedia.org/wiki/User:Example',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:A.jpg',
        attributionRequired: true,
      },
      expect.objectContaining({ id: 'imported-only', author: 'Me' }),
    ]);
  });
});

describe('helpers', () => {
  it('pickWidth and photoUrl', () => {
    expect(pickWidth([], 100)).toBeNull();
    expect(pickWidth([480, 960], 481)).toBe(960);
    expect(photoUrl('a-b', 480)).toBe('photos/a-b-480.webp');
  });
});

describe('the app registry (src/data/photos)', () => {
  it('loads the manifests with unique, kebab-case ids and alt text', () => {
    const photos = live.listPhotos();
    for (const photo of photos) {
      expect(photo.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      // Every listed photo describes what it shows (docs/REAL_CONTENT.md); <Photo> falls back to the caption.
      expect(photo.alt || photo.caption, photo.id).toBeTruthy();
      if (photo.available) {
        expect(photo.width).toBeGreaterThan(0);
        expect(photo.credit.license).toBeTruthy();
      }
    }
    expect(new Set(photos.map((p) => p.id)).size).toBe(photos.length);
    expect(live.getPhoto('definitely-not-a-photo')).toBeNull();
  });
});
