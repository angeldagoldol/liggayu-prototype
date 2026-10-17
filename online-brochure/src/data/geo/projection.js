/**
 * Map projection maths shared by the geo build (scripts/geo/build-japan.mjs),
 * which bakes prefecture outlines into SVG paths, and the app, which projects
 * pins with the very same numbers (src/data/geo/japan.js → project()).
 *
 * Japan is drawn in a Lambert conformal conic projection, the projection of
 * printed atlases: shapes stay true (it is conformal) and the meridians lean
 * in towards the pole, so Hokkaidō sits at its familiar slight tilt. Okinawa
 * gets an inset with its own cone. Pure functions, no DOM, no data.
 */

const RAD = Math.PI / 180;
const quarter = Math.PI / 4;

/**
 * Raw Lambert conformal conic on a unit sphere, y pointing north.
 * `lat1`/`lat2` are the standard parallels (true scale), `lat0`/`lng0` the origin.
 * Returns (lat, lng) → [x, y].
 */
export function lambertConformalConic({ lat1, lat2, lat0, lng0 }) {
  const p1 = lat1 * RAD;
  const p2 = lat2 * RAD;
  const t = (phi) => Math.tan(quarter + phi / 2);
  const n = lat1 === lat2 ? Math.sin(p1) : Math.log(Math.cos(p1) / Math.cos(p2)) / Math.log(t(p2) / t(p1));
  const f = (Math.cos(p1) * t(p1) ** n) / n;
  const rho0 = f / t(lat0 * RAD) ** n;
  return (lat, lng) => {
    const rho = f / t(lat * RAD) ** n;
    const theta = n * (lng - lng0) * RAD;
    return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
  };
}

/**
 * Sample the outline of a lat/lng rectangle ([west, south, east, north]) —
 * in a conic projection its edges are curves, so corners alone are not enough.
 */
export function boundsOutline([west, south, east, north], steps = 24) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const k = i / steps;
    points.push([south, west + (east - west) * k], [north, west + (east - west) * k]);
    points.push([south + (north - south) * k, west], [south + (north - south) * k, east]);
  }
  return points;
}

/**
 * Scale and offset that fit `bounds` ([west, south, east, north]) into `box`
 * ({ x, y, width, height }, SVG units, y down), centred, keeping the aspect.
 */
export function fitTransform(raw, bounds, box) {
  const projected = boundsOutline(bounds).map(([lat, lng]) => raw(lat, lng));
  const xs = projected.map((p) => p[0]);
  const ys = projected.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(box.width / (maxX - minX), box.height / (maxY - minY));
  return {
    scale,
    tx: box.x + (box.width - (maxX - minX) * scale) / 2 - minX * scale,
    ty: box.y + (box.height - (maxY - minY) * scale) / 2 + maxY * scale,
  };
}

/** A complete projection: { lat1, lat2, lat0, lng0, scale, tx, ty } → (lat, lng) → [x, y] in SVG units. */
export function createProjection({ lat1, lat2, lat0, lng0, scale, tx, ty }) {
  const raw = lambertConformalConic({ lat1, lat2, lat0, lng0 });
  return (lat, lng) => {
    const [x, y] = raw(lat, lng);
    return [tx + x * scale, ty - y * scale];
  };
}

/** True when the point lies in [west, south, east, north]. */
export function inBounds([west, south, east, north], lat, lng) {
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

const round = (n) => Math.round(n * 10) / 10;

/**
 * Pin projector for a baked map: points inside an inset's geographic bounds
 * use the inset's projection, everything else the main one.
 *   project(lat, lng) → { x, y, inset: null | 'okinawa', inFrame } or null for bad input.
 * `inFrame` is false for points the map does not show (Ogasawara, Daitō…).
 */
export function createProjector({ main, insets = [] }) {
  const mainProject = createProjection(main.projection);
  const insetProjectors = insets.map((inset) => ({ inset, project: createProjection(inset.projection) }));
  return function project(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    for (const { inset, project: projectInset } of insetProjectors) {
      if (inBounds(inset.bounds, lat, lng)) {
        const [x, y] = projectInset(lat, lng);
        return { x: round(x), y: round(y), inset: inset.id, inFrame: true };
      }
    }
    const [x, y] = mainProject(lat, lng);
    return { x: round(x), y: round(y), inset: null, inFrame: inBounds(main.bounds, lat, lng) };
  };
}
