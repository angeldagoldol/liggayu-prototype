/**
 * Pure layout for <JapanMap>: which part of the map to show, where the pin
 * markers go (pins at nearly the same spot fan out on a ring with leader
 * lines) and where their labels fit without overlapping. Every size is in
 * SVG units of the current view, so the map scales as one picture.
 */

/** "Map of Japan with 3 places: 1 Fushimi Inari Taisha, 2 …; Kansai highlighted" — the static map's accessible name. */
export function mapSummary(pins, regionLabel) {
  const named = (Array.isArray(pins) ? pins : [])
    .map((pin, i) => (pin && typeof pin === 'object' && typeof pin.label === 'string' && pin.label.trim() ? `${i + 1} ${pin.label.trim()}` : null))
    .filter(Boolean);
  let text = 'Map of Japan';
  if (named.length) text += ` with ${named.length} ${named.length === 1 ? 'place' : 'places'}: ${named.join(', ')}`;
  if (regionLabel) text += `${named.length ? '; ' : ', '}${regionLabel} highlighted`;
  return text;
}

/** Pins → projected points. `number` is the 1-based position in the input (it matches the place list);
 *  pins without finite coordinates are dropped, pins outside the drawn frames come back with inFrame false. */
export function projectPins(pins, project) {
  if (!Array.isArray(pins)) return [];
  const out = [];
  pins.forEach((pin, i) => {
    if (!pin || typeof pin !== 'object') return;
    const lat = typeof pin.lat === 'string' ? Number(pin.lat) : pin.lat;
    const lng = typeof pin.lng === 'string' ? Number(pin.lng) : pin.lng;
    const p = project(lat, lng);
    if (!p) return;
    out.push({ ...pin, id: pin.id ?? `pin-${i}`, number: i + 1, x: p.x, y: p.y, inset: p.inset, inFrame: p.inFrame });
  });
  return out;
}

/**
 * The view box to show inside `frame` ({ x, y, width, height }: the whole map,
 * or an inset box when every pin is in that inset): the frame itself, or —
 * when the pins sit close together — a zoomed window around them, never
 * narrower than `minSpan` of the frame. The view has the frame's aspect ratio
 * unless `aspect` (width / height) asks for another — then the whole-frame
 * view grows around the frame's centre to that shape.
 */
export function fitView(points, frame, { minSpan = 0.26, padding = 0.22, aspect: wanted } = {}) {
  const full = { x: frame.x ?? 0, y: frame.y ?? 0, width: frame.width, height: frame.height };
  const aspect = Number.isFinite(wanted) && wanted > 0 ? wanted : full.width / full.height;
  const whole = () => {
    const width = Math.max(full.width, full.height * aspect);
    const height = width / aspect;
    return { x: round(full.x + (full.width - width) / 2), y: round(full.y + (full.height - height) / 2), width: round(width), height: round(height) };
  };
  if (!points.length) return wanted ? whole() : full;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max((maxX - minX) * (1 + 2 * padding), (maxY - minY) * (1 + 2 * padding) * aspect, minSpan * Math.max(full.width, full.height * aspect));
  const height = width / aspect;
  if (width >= full.width * 0.85 || height >= full.height * 0.85) return wanted ? whole() : full;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  return {
    x: round(clamp((minX + maxX) / 2 - width / 2, full.x, full.x + full.width - width)),
    y: round(clamp((minY + maxY) / 2 - height / 2, full.y, full.y + full.height - height)),
    width: round(width),
    height: round(height),
  };
}

/** The frame to fit pins in: an inset's box when every pin lies in that inset, else the whole map. */
export function pinFrame(points, map, insets) {
  const ids = new Set(points.map((p) => p.inset));
  if (points.length && ids.size === 1 && !ids.has(null)) {
    const inset = insets.find((i) => i.id === points[0].inset);
    if (inset) return { ...inset.box };
  }
  return { x: 0, y: 0, width: map.width, height: map.height };
}

/**
 * Marker positions. Pins closer than ~2 marker radii join a cluster; a
 * cluster's markers sit on a ring around its centre (clockwise from the top)
 * and keep a leader line to their true spot.
 * Returns points with { mx, my, displaced, cx, cy } added.
 */
export function layoutMarkers(points, { radius }) {
  const clusters = [];
  for (const point of points) {
    const near = clusters.find((cluster) => cluster.some((other) => Math.hypot(other.x - point.x, other.y - point.y) < radius * 2.1));
    if (near) near.push(point);
    else clusters.push([point]);
  }
  return clusters.flatMap((cluster) => {
    if (cluster.length === 1) {
      const [p] = cluster;
      return [{ ...p, mx: p.x, my: p.y, cx: p.x, cy: p.y, displaced: false }];
    }
    const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
    const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
    const ring = Math.max(radius * 3, (cluster.length * radius * 2.6) / (2 * Math.PI));
    return cluster.map((p, i) => {
      const angle = -Math.PI / 2 + (i / cluster.length) * 2 * Math.PI;
      return { ...p, mx: round(cx + ring * Math.cos(angle)), my: round(cy + ring * Math.sin(angle)), cx, cy, displaced: true };
    });
  });
}

const CJK = /[\u3000-\u30ff\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/;

/** Rough rendered width of `text` at `fontSize` (no DOM): CJK is square, Latin about half. */
export function estimateTextWidth(text, fontSize) {
  let em = 0;
  for (const ch of String(text ?? '')) {
    if (CJK.test(ch)) em += 1;
    else if (ch === ' ') em += 0.28;
    else if (/[A-Z]/.test(ch)) em += 0.66;
    else if (/[a-z0-9ōāūēī]/i.test(ch)) em += 0.54;
    else em += 0.36;
  }
  return em * fontSize;
}

const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/**
 * Label boxes for markers, placed greedily: right of the marker, then left,
 * above, below and the diagonals (displaced markers try the side facing away
 * from their cluster first). A label that fits nowhere inside `bounds`
 * without touching another label, a marker or one of `obstacles` (boxes such
 * as the inset caption) is left out (null) — its number still shows, and the
 * place list carries the name.
 * Returns [{ id, x, y, width, height, anchor: 'start' | 'end' | 'middle', tx, ty }] | null per marker.
 */
export function placeLabels(markers, { radius, fontSize, bounds, texts, obstacles: fixed = [] }) {
  const height = fontSize * 1.25;
  const gap = radius * 0.55;
  const obstacles = markers.map((m) => ({ x: m.mx - radius, y: m.my - radius, width: radius * 2, height: radius * 2 }));
  const placed = [...fixed];
  const inside = (box) => box.x >= bounds.x && box.y >= bounds.y && box.x + box.width <= bounds.x + bounds.width && box.y + box.height <= bounds.y + bounds.height;

  return markers.map((m, index) => {
    const text = texts[index];
    if (!text) return null;
    const width = estimateTextWidth(text, fontSize);
    const right = { x: m.mx + radius + gap, y: m.my - height / 2, anchor: 'start' };
    const left = { x: m.mx - radius - gap - width, y: m.my - height / 2, anchor: 'end' };
    const top = { x: m.mx - width / 2, y: m.my - radius - gap - height, anchor: 'middle' };
    const bottom = { x: m.mx - width / 2, y: m.my + radius + gap, anchor: 'middle' };
    const topRight = { x: m.mx + radius * 0.7, y: m.my - radius - height, anchor: 'start' };
    const bottomRight = { x: m.mx + radius * 0.7, y: m.my + radius, anchor: 'start' };
    const topLeft = { x: m.mx - radius * 0.7 - width, y: m.my - radius - height, anchor: 'end' };
    const bottomLeft = { x: m.mx - radius * 0.7 - width, y: m.my + radius, anchor: 'end' };
    let order = [right, left, top, bottom, topRight, bottomRight, topLeft, bottomLeft];
    if (m.displaced) {
      const dx = m.mx - m.cx;
      const dy = m.my - m.cy;
      const outward = Math.abs(dx) > Math.abs(dy) * 0.6 ? (dx > 0 ? right : left) : dy > 0 ? bottom : top;
      order = [outward, ...order.filter((c) => c !== outward)];
    }
    for (const candidate of order) {
      const box = { x: candidate.x, y: candidate.y, width, height };
      if (!inside(box)) continue;
      if (placed.some((other) => overlaps(box, other))) continue;
      if (obstacles.some((o, j) => j !== index && overlaps(box, o))) continue;
      placed.push(box);
      const tx = candidate.anchor === 'start' ? box.x : candidate.anchor === 'end' ? box.x + width : box.x + width / 2;
      return { id: m.id, ...box, anchor: candidate.anchor, tx: round(tx), ty: round(box.y + height * 0.78) };
    }
    return null;
  });
}

function round(n) {
  return Math.round(n * 10) / 10;
}
