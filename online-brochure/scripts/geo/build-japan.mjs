#!/usr/bin/env node
/**
 * Builds src/data/geo/japan.js — the 47 prefectures of Japan as SVG paths for
 * <JapanMap> — from Natural Earth's 1:10m admin-1 states & provinces
 * (public domain, https://www.naturalearthdata.com/).
 *
 *   npm run geo:build              # downloads the source once into .cache/geo/
 *   npm run geo:build -- --refresh # re-download the source
 *
 * Steps: keep the JPN features → map Natural Earth regions to the app's
 * region ids → move the Amami islands back to Kagoshima (Natural Earth files
 * them under Okinawa) → keep polygons inside the main frame or the
 * Okinawa & Amami inset (drops Ogasawara, Minami-Torishima, the Daitō and
 * Tokara islands…) → project
 * (Lambert conformal conic, src/data/geo/projection.js) → simplify with
 * mapshaper (topology-aware, so neighbouring prefectures never gap) →
 * integer SVG path data with relative commands.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';
import { boundsOutline, createProjection, inBounds, lambertConformalConic } from '../../src/data/geo/projection.js';
import { REGIONS } from '../../src/data/regions.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const NE_BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const SOURCES = { admin1: 'ne_10m_admin_1_states_provinces.geojson', lakes: 'ne_10m_lakes.geojson' };
const CACHE_DIR = path.join(ROOT, '.cache/geo');
const OUT_FILE = path.join(ROOT, 'src/data/geo/japan.js');

/** SVG units across the whole map; integer path coordinates are 1/WIDTH of it. */
const WIDTH = 2400;
const MARGIN = 70;
/** Douglas–Peucker tolerance in SVG units (0.6 px when the map is 1200 px wide). */
const SIMPLIFY = 0.35;
/** Rings smaller than this (SVG units²) after simplification are specks; dropped. */
const MIN_RING_AREA = 6;

/** The four main islands and their near islands, Tsushima to Shiretoko, Rebun to Yakushima. */
const MAIN = {
  bounds: [128.0, 29.9, 146.2, 45.7],
  cone: { lat1: 33, lat2: 43, lat0: 37.5, lng0: 137.5 },
};

/**
 * The Nansei islands south of the main frame — Okinawa Prefecture (Yonaguni
 * to Iheya) and Kagoshima's Amami islands (Yoron to Kikai, Amami Ōshima) —
 * drawn larger in a box in the Sea of Japan. Only Tokara (29–29.9°N) and the
 * remote Pacific islands are left out.
 */
const INSETS = [
  {
    id: 'okinawa',
    label: 'Okinawa & Amami',
    labelJp: '沖縄・奄美',
    bounds: [122.75, 23.95, 130.15, 28.62],
    cone: { lat1: 24.8, lat2: 27.8, lat0: 26.3, lng0: 126.45 },
    zoom: 1.12,
  },
];

/** Natural Earth `region` → app region id (src/data/regions.js). Saga and Nagasaki have no NE region. */
const NE_REGIONS = {
  Hokkaido: 'hokkaido',
  Tohoku: 'tohoku',
  Kanto: 'kanto',
  Chubu: 'chubu',
  Kinki: 'kansai',
  Chugoku: 'chugoku',
  Shikoku: 'shikoku',
  Kyushu: 'kyushu',
  Okinawa: 'kyushu',
};
const REGION_FALLBACK = { 'JP-41': 'kyushu', 'JP-42': 'kyushu' };

/** Common English names for the big cities' prefectures (docs/REAL_CONTENT.md). */
const NAME_OVERRIDES = { 'JP-26': 'Kyoto', 'JP-27': 'Osaka' };

const args = new Set(process.argv.slice(2));

/** A Natural Earth GeoJSON file, downloaded once into .cache/geo/ (gitignored). */
async function loadSource(name) {
  const file = path.join(CACHE_DIR, name);
  if (args.has('--refresh') || !existsSync(file)) {
    const url = NE_BASE + name;
    console.log(`Downloading ${url}`);
    const response = await fetch(url, { headers: { 'User-Agent': 'TabiBrochures-geo-build/1.0 (static map build)' } });
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status} for ${url}`);
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
  }
  const { size } = await stat(file);
  console.log(`Source: ${path.relative(ROOT, file)} (${(size / 1e6).toFixed(1)} MB)`);
  return JSON.parse(await readFile(file, 'utf8'));
}

/** Ray-casting point-in-ring test (lng/lat). */
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const polygonsOf = (geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []);

function ringBoxCentre(ring) {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [lng, lat] of ring) {
    w = Math.min(w, lng);
    e = Math.max(e, lng);
    s = Math.min(s, lat);
    n = Math.max(n, lat);
  }
  return { lat: (s + n) / 2, lng: (w + e) / 2 };
}

/** Signed shoelace area and centroid of a projected ring. */
function ringStats(ring) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    area += cross;
    cx += (ring[j][0] + ring[i][0]) * cross;
    cy += (ring[j][1] + ring[i][1]) * cross;
  }
  area /= 2;
  return area === 0 ? { area: 0, cx: ring[0][0], cy: ring[0][1] } : { area, cx: cx / (6 * area), cy: cy / (6 * area) };
}

/** "M12 34l3-4 5 6z" — integer coordinates, relative after the first point. */
function ringPath(ring) {
  const points = [];
  for (const [x, y] of ring) {
    const p = [Math.round(x), Math.round(y)];
    const last = points[points.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) points.push(p);
  }
  if (points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]) points.pop();
  if (points.length < 3) return '';
  let d = `M${points[0][0]} ${points[0][1]}l`;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    d += `${i > 1 && dx >= 0 ? ' ' : ''}${dx}${dy >= 0 ? ' ' : ''}${dy}`;
  }
  return `${d}z`;
}

function polylinePath(points) {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${Math.round(x)} ${Math.round(y)}`).join('');
}

async function main() {
  const source = await loadSource(SOURCES.admin1);
  const lakeSource = await loadSource(SOURCES.lakes);
  const japan = source.features.filter((f) => f.properties.adm0_a3 === 'JPN');
  if (japan.length !== 47) throw new Error(`Expected 47 prefectures, found ${japan.length}`);

  const regionIds = new Set(REGIONS.map((r) => r.id));
  const prefectures = new Map();
  for (const feature of japan) {
    const p = feature.properties;
    const code = p.iso_3166_2;
    const region = NE_REGIONS[p.region] ?? REGION_FALLBACK[code];
    if (!regionIds.has(region)) throw new Error(`No app region for ${code} ${p.name} (NE region ${p.region})`);
    prefectures.set(code, {
      code,
      name: NAME_OVERRIDES[code] ?? p.name,
      nameJp: p.name_ja,
      region,
      polygons: polygonsOf(feature.geometry),
    });
  }

  // Natural Earth files the Amami islands (Kagoshima) under Okinawa: everything
  // north of 27°N and east of 128.35°E in that feature belongs to Kagoshima.
  const okinawa = prefectures.get('JP-47');
  const kagoshima = prefectures.get('JP-46');
  const amami = okinawa.polygons.filter((poly) => {
    const c = ringBoxCentre(poly[0]);
    return c.lat >= 27 && c.lng >= 128.35;
  });
  okinawa.polygons = okinawa.polygons.filter((poly) => !amami.includes(poly));
  kagoshima.polygons.push(...amami);
  console.log(`Moved ${amami.length} Amami island polygons from Okinawa to Kagoshima`);

  // Assign each polygon to the main frame or an inset; drop the rest.
  const frames = [{ id: null, bounds: MAIN.bounds }, ...INSETS];
  const dropped = [];
  for (const pref of prefectures.values()) {
    pref.parts = [];
    for (const poly of pref.polygons) {
      const c = ringBoxCentre(poly[0]);
      const frame = INSETS.find((f) => inBounds(f.bounds, c.lat, c.lng)) ?? (inBounds(MAIN.bounds, c.lat, c.lng) ? frames[0] : null);
      if (frame) pref.parts.push({ frame: frame.id, poly });
      else dropped.push(`${pref.name} @ ${c.lat.toFixed(2)},${c.lng.toFixed(2)}`);
    }
  }
  console.log(`Dropped ${dropped.length} remote polygons outside the frames (${[...new Set(dropped.map((d) => d.split(' @')[0]))].join(', ')})`);

  // Fit the main frame to its land, then the inset into the top-left sea.
  const mainRaw = lambertConformalConic(MAIN.cone);
  const mainPoints = [...prefectures.values()].flatMap((pref) => pref.parts.filter((p) => p.frame === null).flatMap((p) => p.poly[0]));
  const projectedMain = mainPoints.map(([lng, lat]) => mainRaw(lat, lng));
  const minX = Math.min(...projectedMain.map((p) => p[0]));
  const maxX = Math.max(...projectedMain.map((p) => p[0]));
  const minY = Math.min(...projectedMain.map((p) => p[1]));
  const maxY = Math.max(...projectedMain.map((p) => p[1]));
  const scale = (WIDTH - 2 * MARGIN) / (maxX - minX);
  const height = Math.ceil((maxY - minY) * scale + 2 * MARGIN);
  const mainProjection = { ...MAIN.cone, scale: round(scale, 4), tx: round(MARGIN - minX * scale, 3), ty: round(MARGIN + maxY * scale, 3) };

  const insets = INSETS.map((inset) => {
    // Same scale as the main map × zoom, placed against the top-left margin (open sea).
    const raw = lambertConformalConic(inset.cone);
    const outline = boundsOutline(inset.bounds).map(([lat, lng]) => raw(lat, lng));
    const ix = outline.map((p) => p[0]);
    const iy = outline.map((p) => p[1]);
    const insetScale = scale * inset.zoom;
    const box = {
      x: MARGIN / 2,
      y: MARGIN / 2,
      width: Math.round((Math.max(...ix) - Math.min(...ix)) * insetScale),
      height: Math.round((Math.max(...iy) - Math.min(...iy)) * insetScale),
    };
    return {
      id: inset.id,
      label: inset.label,
      labelJp: inset.labelJp,
      bounds: inset.bounds,
      projection: {
        ...inset.cone,
        scale: round(insetScale, 4),
        tx: round(box.x - Math.min(...ix) * insetScale, 3),
        ty: round(box.y + Math.max(...iy) * insetScale, 3),
      },
      box,
    };
  });

  const projectors = new Map([[null, createProjection(mainProjection)], ...insets.map((inset) => [inset.id, createProjection(inset.projection)])]);

  // Projected GeoJSON (planar, SVG units) for mapshaper; one feature per prefecture × frame.
  const features = [];
  for (const pref of prefectures.values()) {
    for (const frame of [null, ...insets.map((i) => i.id)]) {
      const polys = pref.parts.filter((p) => p.frame === frame).map((p) => p.poly);
      if (polys.length === 0) continue;
      const project = projectors.get(frame);
      const coordinates = polys.map((poly) => poly.map((ring) => ring.map(([lng, lat]) => project(lat, lng))));
      features.push({ type: 'Feature', properties: { code: pref.code, frame: frame ?? '' }, geometry: { type: 'MultiPolygon', coordinates } });
    }
  }

  const output = await mapshaper.applyCommands(`-i in.json -simplify dp planar interval=${SIMPLIFY} keep-shapes -o out.json format=geojson`, {
    'in.json': { type: 'FeatureCollection', features },
  });
  const simplified = JSON.parse(String(output['out.json']));

  // Lakes (Natural Earth 1:10m has Lake Biwa for Japan): those whose centre lies on Japanese land.
  const landRings = [...prefectures.values()].flatMap((pref) => pref.parts.map((p) => p.poly[0]));
  const lakeFeatures = [];
  for (const lake of lakeSource.features) {
    for (const poly of polygonsOf(lake.geometry)) {
      const c = ringBoxCentre(poly[0]);
      if (!landRings.some((ring) => inRing([c.lng, c.lat], ring))) continue;
      const inset = insets.find((i) => inBounds(i.bounds, c.lat, c.lng));
      const project = projectors.get(inset?.id ?? null);
      lakeFeatures.push({
        type: 'Feature',
        properties: { name: lakeName(lake.properties), nameJp: lake.properties.name_ja ?? '', frame: inset?.id ?? '' },
        geometry: { type: 'Polygon', coordinates: poly.map((ring) => ring.map(([lng, lat]) => project(lat, lng))) },
      });
    }
  }
  const lakeOutput = await mapshaper.applyCommands(`-i lakes.json -simplify dp planar interval=${SIMPLIFY} keep-shapes -o out.json format=geojson`, {
    'lakes.json': { type: 'FeatureCollection', features: lakeFeatures },
  });
  const lakes = JSON.parse(String(lakeOutput['out.json']))
    .features.map((f) => ({
      name: f.properties.name,
      nameJp: f.properties.nameJp,
      inset: f.properties.frame || null,
      d: polygonsOf(f.geometry)
        .flatMap((poly) => poly.map(ringPath))
        .join(''),
    }))
    .filter((lake) => lake.d);
  console.log(`Lakes: ${lakes.map((l) => l.name).join(', ') || 'none'}`);

  // Paths and label anchors.
  const insetBoxes = insets.map((i) => i.box);
  const insideBox = (x, y) => insetBoxes.some((b) => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height);
  const out = new Map([...prefectures.values()].map((p) => [p.code, { code: p.code, name: p.name, nameJp: p.nameJp, region: p.region, d: '', insetD: '', center: null, best: 0 }]));
  let rings = 0;
  let specks = 0;
  for (const feature of simplified.features) {
    const record = out.get(feature.properties.code);
    const frame = feature.properties.frame || null;
    for (const poly of polygonsOf(feature.geometry)) {
      const parts = [];
      const outer = ringStats(poly[0]);
      if (Math.abs(outer.area) < MIN_RING_AREA) {
        specks += 1;
        continue;
      }
      // Main-frame specks that would sit under the inset box are hidden anyway.
      if (frame === null && insideBox(outer.cx, outer.cy)) continue;
      for (const ring of poly) {
        if (Math.abs(ringStats(ring).area) < MIN_RING_AREA) continue;
        const d = ringPath(ring);
        if (d) {
          parts.push(d);
          rings += 1;
        }
      }
      if (frame === null) record.d += parts.join('');
      else record.insetD += parts.join('');
      if (frame === null && Math.abs(outer.area) > record.best) {
        record.best = Math.abs(outer.area);
        record.center = [Math.round(outer.cx), Math.round(outer.cy)];
      }
      if (frame !== null && !record.center) record.center = [Math.round(outer.cx), Math.round(outer.cy)];
    }
  }

  // Overlap check: the inset box must sit on open sea.
  for (const record of out.values()) {
    const xs = [...record.d.matchAll(/M(-?\d+) (-?\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    for (const [x, y] of xs) if (insideBox(x, y)) console.warn(`! ${record.name} has land under the inset box at ${x},${y}`);
  }

  // Region label anchors: area-weighted centre of each region's main-frame land.
  const regionAnchors = REGIONS.map((region) => {
    let a = 0;
    let x = 0;
    let y = 0;
    for (const feature of simplified.features) {
      if (feature.properties.frame || out.get(feature.properties.code).region !== region.id) continue;
      for (const poly of polygonsOf(feature.geometry)) {
        const s = ringStats(poly[0]);
        a += Math.abs(s.area);
        x += s.cx * Math.abs(s.area);
        y += s.cy * Math.abs(s.area);
      }
    }
    return { id: region.id, center: [Math.round(x / a), Math.round(y / a)] };
  });

  // Graticule: every 5° on the main map, 1° in the inset.
  const mainProject = projectors.get(null);
  const lines = [];
  for (const lng of [130, 135, 140, 145]) lines.push(polylinePath(range(29, 46.5, 0.5).map((lat) => mainProject(lat, lng))));
  for (const lat of [30, 35, 40, 45]) lines.push(polylinePath(range(126, 148, 0.5).map((lng) => mainProject(lat, lng))));
  const graticule = { main: lines.join('') };
  for (const inset of insets) {
    const project = projectors.get(inset.id);
    const [w, s, e, n] = inset.bounds;
    const parts = [];
    for (let lng = Math.ceil(w); lng <= e; lng += 1) parts.push(polylinePath(range(s, n, 0.25).map((lat) => project(lat, lng))));
    for (let lat = Math.ceil(s); lat <= n; lat += 1) parts.push(polylinePath(range(w, e, 0.25).map((lng) => project(lat, lng))));
    graticule[inset.id] = parts.join('');
  }

  const records = [...out.values()].sort((a, b) => a.code.localeCompare(b.code));
  const missing = records.filter((r) => !r.d && !r.insetD);
  if (missing.length) throw new Error(`No outline for ${missing.map((r) => r.name).join(', ')}`);

  const module = `// GENERATED by scripts/geo/build-japan.mjs — do not edit by hand (npm run geo:build).
// Source: Natural Earth 1:10m Admin 1 – States, Provinces (public domain), naturalearthdata.com,
// with the Amami islands returned to Kagoshima. Lambert conformal conic (projection.js);
// Okinawa and the Amami islands are drawn ×${INSETS[0].zoom} in an inset box. Islands outside both
// frames (Ogasawara, Daitō, Minami-Torishima, Okinotorishima, the Tokara islands) are left out.
import { createProjector } from './projection.js';

export const width = ${WIDTH};
export const height = ${height};
export const viewBox = '0 0 ${WIDTH} ${height}';

/** Main frame: geographic bounds [west, south, east, north] and its projection. */
export const main = ${JSON.stringify({ bounds: MAIN.bounds, projection: mainProjection })};

/** Inset boxes: { id, label, labelJp, bounds, projection, box: { x, y, width, height } } in SVG units. */
export const insets = ${JSON.stringify(insets)};

/** Region label anchors [x, y], area-weighted over the main frame. */
export const regionCenters = ${JSON.stringify(Object.fromEntries(regionAnchors.map((r) => [r.id, r.center])))};

/** Lakes drawn over the land: { name, nameJp, inset, d }. */
export const lakes = ${JSON.stringify(lakes)};

/** Graticule paths (5° on the main map, 1° in insets). */
export const graticule = ${JSON.stringify(graticule)};

/**
 * The 47 prefectures in JIS order: { code (ISO 3166-2), name, nameJp, region (data/regions.js),
 * d (main-frame outline), insetD (outline inside an inset box, '' if none), center [x, y] }.
 */
export const prefectures = [
${records.map((r) => `  ${JSON.stringify({ code: r.code, name: r.name, nameJp: r.nameJp, region: r.region, inset: r.insetD ? insets[0].id : null, center: r.center, d: r.d, insetD: r.insetD })},`).join('\n')}
];

/** project(lat, lng) → { x, y, inset: null | 'okinawa', inFrame } in SVG units, or null for bad input. */
export const project = createProjector({ main, insets });
`;
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, module);
  const bytes = Buffer.byteLength(module);
  const points = records.reduce((n, r) => n + (r.d + r.insetD).split(/[lM ]|(?=-)/).length / 2, 0);
  console.log(
    `Wrote ${path.relative(ROOT, OUT_FILE)}: ${(bytes / 1024).toFixed(1)} KB, ${records.length} prefectures, ${rings} rings, ~${Math.round(points)} points, ${specks} specks dropped`,
  );
  console.log(`viewBox 0 0 ${WIDTH} ${height}; inset box ${JSON.stringify(insets[0].box)}`);
}

/** "Lake Biwa" (Natural Earth: name "Biwa Ko", name_en "Biwa"). */
function lakeName(props) {
  const name = props.name_en || props.name || '';
  return /lake/i.test(name) ? name : `Lake ${name}`;
}

function range(from, to, step) {
  const out = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
