/**
 * Geometry for the Regions map: each region as a point (its area-weighted
 * label anchor on the real map, `regionCenters` in data/geo/japan.js), arrow
 * keys that travel across the map spatially, and prev/next stepping for the
 * region card's pager.
 */

/**
 * Regions as points `[{ id, x, y }]` (SVG units, y grows southwards), in the
 * order of `regions`. Regions without a finite centre are skipped.
 *   regionPoints(REGIONS, regionCenters) → [{ id: 'hokkaido', x: 1934, y: 424 }, …]
 */
export function regionPoints(regions, centers) {
  const out = [];
  for (const region of regions ?? []) {
    const at = centers?.[region?.id];
    if (Array.isArray(at) && Number.isFinite(at[0]) && Number.isFinite(at[1])) out.push({ id: region.id, x: at[0], y: at[1] });
  }
  return out;
}

const DIRECTIONS = {
  ArrowRight: { x: 1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
  ArrowUp: { x: 0, y: -1 },
};

/**
 * The region an arrow key should move to from `fromId`: the nearest point in
 * that direction, preferring ones straight ahead over ones off to the side.
 * Returns `fromId` when nothing lies that way, or null for an unknown key or id.
 */
export function neighborInDirection(points, fromId, key) {
  const dir = DIRECTIONS[key];
  const from = (points ?? []).find((p) => p.id === fromId);
  if (!dir || !from) return null;

  let best = null;
  let bestScore = Infinity;
  for (const point of points) {
    if (point.id === fromId) continue;
    const dx = point.x - from.x;
    const dy = point.y - from.y;
    const along = dx * dir.x + dy * dir.y;
    if (along <= 0) continue;
    const across = Math.abs(dx * dir.y - dy * dir.x);
    const score = along + across * 2;
    if (score < bestScore) {
      bestScore = score;
      best = point.id;
    }
  }
  return best ?? from.id;
}

/** The id `delta` steps from `fromId` in `ids`, wrapping round (north → south order). */
export function stepId(ids, fromId, delta) {
  const list = Array.isArray(ids) ? ids : [];
  if (list.length === 0) return null;
  const at = list.indexOf(fromId);
  if (at === -1) return list[0];
  return list[(((at + delta) % list.length) + list.length) % list.length];
}
