/**
 * Geometry for the schematic region map: grid bounds from REGIONS[].tile,
 * the decorative rail line between tiles, and spatial arrow-key navigation.
 */

/** Smallest grid that holds every tile: { minX, minY, cols, rows }. */
export function tileBounds(regions) {
  const tiles = (regions ?? []).map((r) => r.tile).filter(Boolean);
  if (tiles.length === 0) return { minX: 0, minY: 0, cols: 1, rows: 1 };
  const xs = tiles.map((t) => t.x);
  const ys = tiles.map((t) => t.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { minX, minY, cols: Math.max(...xs) - minX + 1, rows: Math.max(...ys) - minY + 1 };
}

/** Centre of a region's tile in grid units (0…cols, 0…rows). */
export function tileCenter(region, bounds) {
  return { x: region.tile.x - bounds.minX + 0.5, y: region.tile.y - bounds.minY + 0.5 };
}

/** SVG `points` for a line through the regions named in `order` (unknown ids are skipped). */
export function routePoints(regions, order, bounds) {
  const byId = new Map((regions ?? []).map((r) => [r.id, r]));
  return order
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((region) => {
      const { x, y } = tileCenter(region, bounds);
      return `${x},${y}`;
    })
    .join(' ');
}

const DIRECTIONS = {
  ArrowRight: { x: 1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
  ArrowUp: { x: 0, y: -1 },
};

/**
 * The region an arrow key should move to from `fromId`: the nearest tile in
 * that direction, preferring ones straight ahead over ones off to the side.
 * Returns `fromId` when nothing lies that way, or null for unknown input.
 */
export function neighborInDirection(regions, fromId, key) {
  const dir = DIRECTIONS[key];
  const from = (regions ?? []).find((r) => r.id === fromId);
  if (!dir || !from) return from ? from.id : null;

  let best = null;
  let bestScore = Infinity;
  for (const region of regions) {
    if (region.id === fromId) continue;
    const dx = region.tile.x - from.tile.x;
    const dy = region.tile.y - from.tile.y;
    const along = dx * dir.x + dy * dir.y;
    if (along <= 0) continue;
    const across = Math.abs(dx * dir.y - dy * dir.x);
    const score = along + across * 2;
    if (score < bestScore) {
      bestScore = score;
      best = region.id;
    }
  }
  return best ?? from.id;
}
