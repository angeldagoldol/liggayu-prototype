// @vitest-environment node
/**
 * Geographic correctness of the baked map: real places, projected with the
 * same project() the pins use, must land inside the right prefecture's
 * outline — checked with a point-in-polygon test on the SVG path data itself,
 * so the projection, the inset routing, the outlines and the prefecture codes
 * are all tested together.
 */
import { describe, expect, it } from 'vitest';
import { BROCHURES } from '../brochures.js';
import * as japan from './japan.js';

/** "M12 34l3-4 5 6zM…" (absolute move, relative lines) → [[[x, y], …], …], one ring per subpath. */
function pathRings(d) {
  const rings = [];
  for (const sub of String(d ?? '').split(/(?=M)/)) {
    const nums = sub.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (nums.length < 6) continue;
    let [x, y] = nums;
    const ring = [[x, y]];
    for (let i = 2; i + 1 < nums.length; i += 2) {
      x += nums[i];
      y += nums[i + 1];
      ring.push([x, y]);
    }
    rings.push(ring);
  }
  return rings;
}

/** Even-odd ray casting over every ring (holes, such as lakes cut from land, count out). */
function insideRings([px, py], rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

const outlines = japan.prefectures.map((p) => ({ code: p.code, name: p.name, main: pathRings(p.d), inset: pathRings(p.insetD) }));

/** Codes of the prefectures whose drawn outline contains this real place. */
function prefecturesAt(lat, lng) {
  const point = japan.project(lat, lng);
  if (!point?.inFrame) return { point, codes: [] };
  const codes = outlines.filter((o) => insideRings([point.x, point.y], point.inset ? o.inset : o.main)).map((o) => o.code);
  return { point, codes };
}

describe('pathRings / insideRings', () => {
  it('reads relative path data and tests points against it', () => {
    const rings = pathRings('M0 0l10 0 0 10-10 0zM3 3l4 0 0 4-4 0z');
    expect(rings).toEqual([
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      [
        [3, 3],
        [7, 3],
        [7, 7],
        [3, 7],
      ],
    ]);
    expect(insideRings([1, 1], rings)).toBe(true);
    expect(insideRings([5, 5], rings)).toBe(false); // in the hole
    expect(insideRings([11, 5], rings)).toBe(false);
  });
});

describe('real places land in the right prefecture', () => {
  it.each([
    // The five reference cities.
    ['Sapporo', 43.0618, 141.3545, 'JP-01', null],
    ['Tokyo Station', 35.6812, 139.7671, 'JP-13', null],
    ['Kyoto', 35.0116, 135.7681, 'JP-26', null],
    ['Hiroshima', 34.3853, 132.4553, 'JP-34', null],
    ['Naha', 26.2124, 127.6809, 'JP-47', 'okinawa'],
    // Neighbours that a shifted projection or a swapped code would confuse.
    ['Osaka', 34.6937, 135.5023, 'JP-27', null],
    ['Nara', 34.6851, 135.8048, 'JP-29', null],
    ['Yokohama', 35.4437, 139.638, 'JP-14', null],
    ['Saitama', 35.8617, 139.6455, 'JP-11', null],
    ['Nagoya', 35.1815, 136.9066, 'JP-23', null],
    ['Sendai', 38.2682, 140.8694, 'JP-04', null],
    ['Aomori', 40.8244, 140.74, 'JP-02', null],
    ['Hakodate', 41.7687, 140.7288, 'JP-01', null],
    ['Kanazawa', 36.5613, 136.6562, 'JP-17', null],
    ['Matsuyama', 33.8392, 132.7657, 'JP-38', null],
    ['Fukuoka', 33.5902, 130.4017, 'JP-40', null],
    ['Kagoshima', 31.5966, 130.5571, 'JP-46', null],
    ['Mount Misen, Miyajima', 34.2794, 132.3197, 'JP-34', null],
    ['Sado Island', 38.018, 138.368, 'JP-15', null],
    ['Tsushima', 34.4, 129.3, 'JP-42', null],
    ['Yakushima', 30.35, 130.53, 'JP-46', null],
    ['Ishigaki', 24.3448, 124.1572, 'JP-47', 'okinawa'],
    // The Amami islands belong to Kagoshima, though they sit in the Okinawa inset.
    ['Naze, Amami Ōshima', 28.3772, 129.4938, 'JP-46', 'okinawa'],
    ['Yoron', 27.0436, 128.4222, 'JP-46', 'okinawa'],
  ])('%s (%f, %f) → %s', (_name, lat, lng, code, inset) => {
    const { point, codes } = prefecturesAt(lat, lng);
    expect(point).toMatchObject({ inset, inFrame: true });
    expect(codes).toEqual([code]);
  });

  it('keeps the inset to the Nansei islands and the main frame to the rest', () => {
    const box = japan.insets[0].box;
    const naha = japan.project(26.2124, 127.6809);
    expect(naha.x).toBeGreaterThan(box.x);
    expect(naha.x).toBeLessThan(box.x + box.width);
    expect(naha.y).toBeGreaterThan(box.y);
    expect(naha.y).toBeLessThan(box.y + box.height);
    // No main-frame land is drawn under the inset box.
    for (const o of outlines) {
      for (const ring of o.main) for (const [x, y] of ring) expect(x > box.x + box.width || y > box.y + box.height, `${o.name} under the inset`).toBe(true);
    }
  });

  it('is north-up with east to the right', () => {
    const sapporo = japan.project(43.0618, 141.3545);
    const tokyo = japan.project(35.6812, 139.7671);
    const fukuoka = japan.project(33.5902, 130.4017);
    expect(sapporo.y).toBeLessThan(tokyo.y);
    expect(fukuoka.x).toBeLessThan(tokyo.x);
  });
});

describe('built-in brochures', () => {
  // Every place a brochure pins (map pages, place pages, its location) must be on the map.
  const points = BROCHURES.flatMap((b) => [
    ...(b.location ? [[b.slug, 'location', b.location]] : []),
    ...b.pages.flatMap((page) => (page.type === 'map' ? (page.places ?? []) : page.type === 'place' ? [page] : []).map((p) => [b.slug, p.name, p])),
  ]).filter(([, , p]) => p.lat !== undefined || p.lng !== undefined);

  it('collects every pinned place', () => {
    expect(points.every(([slug, name]) => typeof slug === 'string' && typeof name === 'string')).toBe(true);
  });

  it.each(points)('%s: %s is inside the drawn map', (_slug, _name, p) => {
    expect(japan.project(p.lat, p.lng)?.inFrame).toBe(true);
  });
});
