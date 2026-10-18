/**
 * Which prefecture a coordinate falls in, read from the very outlines the map
 * draws (data/geo/japan.js): the point is projected with the map's own
 * project() and tested against each prefecture's path with even-odd ray
 * casting. Pure; the geo data is passed in, so only lazy code (the Studio's
 * coordinate preview) pulls the 46 KB of outlines into the page.
 */

/** "M12 34l3-4 5 6zM…" (absolute move, relative lines — the format japan.js is baked in) → rings of [x, y]. */
export function pathRings(d) {
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

/** Even-odd ray casting over every ring (a lake cut out of the land counts as outside). */
export function insideRings([px, py], rings) {
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

const ringCache = new WeakMap();

function ringsOf(prefecture, inset) {
  let entry = ringCache.get(prefecture);
  if (!entry) {
    entry = {};
    ringCache.set(prefecture, entry);
  }
  const key = inset ? 'inset' : 'main';
  entry[key] ??= pathRings(inset ? prefecture.insetD : prefecture.d);
  return entry[key];
}

/**
 * Where a coordinate lands on the map:
 *   { state: 'land', prefecture: { code, name, nameJp, region } }  inside a prefecture's outline
 *   { state: 'sea' }       on the map but outside every outline (offshore, or on a coast the
 *                          1:10m outlines smooth away — a shrine in the water, a small island)
 *   { state: 'off' }       outside the frames the map draws
 *   null                   not a usable pair
 */
export function locate(lat, lng, { project, prefectures }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const point = project(lat, lng);
  if (!point) return null;
  if (!point.inFrame) return { state: 'off' };
  const hit = prefectures.find((p) => insideRings([point.x, point.y], ringsOf(p, Boolean(point.inset))));
  if (!hit) return { state: 'sea' };
  return { state: 'land', prefecture: { code: hit.code, name: hit.name, nameJp: hit.nameJp, region: hit.region } };
}

/** "Kyoto" from "Kyoto" / "Tokyo" / "Ōita" — the English prefecture name as brochures store it. */
export function prefectureLabel(prefecture) {
  return String(prefecture?.name ?? '').trim();
}
