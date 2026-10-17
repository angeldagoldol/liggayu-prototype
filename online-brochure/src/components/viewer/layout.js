/**
 * Fitting the book to the stage, zoom steps and pan limits. Pure functions.
 */

/** Brochure pages are A-series: 1 : √2. */
export const PAGE_RATIO = 1.414;

export const ZOOM_LEVELS = [1, 1.5, 2];

/**
 * Largest book that fits a stage of `width` × `height` (minus padding).
 * Shows a two-page spread when its pages stay readable — at least
 * `minPageWidth` wide and `minSpreadShare` of the size a single page could
 * have (a portrait tablet reads better one big page at a time) — otherwise
 * one page at a time. Page sizes are whole pixels.
 */
export function computeBookLayout({
  width,
  height,
  padX = 0,
  padY = 0,
  minStageWidth = 600,
  minPageWidth = 220,
  minSpreadShare = 0.66,
}) {
  const availW = Math.max(0, width - padX * 2);
  const availH = Math.max(0, height - padY * 2);
  const byHeight = availH / PAGE_RATIO;
  const doubleWidth = Math.floor(Math.min(availW / 2, byHeight));
  const singleWidth = Math.floor(Math.min(availW, byHeight));
  const roomy = doubleWidth >= minPageWidth && doubleWidth >= singleWidth * minSpreadShare;
  const mode = width >= minStageWidth && roomy ? 'double' : 'single';
  const pageWidth = Math.max(0, mode === 'double' ? doubleWidth : singleWidth);
  const pageHeight = Math.round(pageWidth * PAGE_RATIO);
  return {
    mode,
    pageWidth,
    pageHeight,
    bookWidth: mode === 'double' ? pageWidth * 2 : pageWidth,
    bookHeight: pageHeight,
  };
}

/**
 * Horizontal shift that centres what is visible: a closed book shows only
 * its cover (right half) or its back (left half), so slide it by half a page.
 */
export function bookOffset({ mode, position, leafCount, pageWidth }) {
  if (mode !== 'double' || leafCount === 0) return 0;
  if (position <= 0) return -pageWidth / 2;
  if (position >= leafCount) return pageWidth / 2;
  return 0;
}

/** Next zoom level in `direction` (+1 in, -1 out); stays put at the ends. */
export function stepZoom(zoom, direction) {
  const index = ZOOM_LEVELS.findIndex((level) => level >= zoom - 1e-6);
  const current = index === -1 ? ZOOM_LEVELS.length - 1 : index;
  const next = Math.min(Math.max(current + direction, 0), ZOOM_LEVELS.length - 1);
  return ZOOM_LEVELS[next];
}

/**
 * Keep a zoomed book reachable: it may be panned until its edge meets the
 * stage edge (plus `margin`), never further. At 1× it stays centred.
 */
export function clampPan({ x, y, zoom, bookWidth, bookHeight, stageWidth, stageHeight, margin = 32 }) {
  if (zoom <= 1) return { x: 0, y: 0 };
  const maxX = Math.max(0, (bookWidth * zoom - stageWidth) / 2 + margin);
  const maxY = Math.max(0, (bookHeight * zoom - stageHeight) / 2 + margin);
  return {
    x: Math.min(Math.max(x, -maxX), maxX),
    y: Math.min(Math.max(y, -maxY), maxY),
  };
}
