import { describe, expect, it } from 'vitest';
import { bookOffset, clampPan, computeBookLayout, PAGE_RATIO, stepZoom } from './layout.js';

describe('computeBookLayout', () => {
  it('shows a spread on a desktop stage, limited by height', () => {
    const layout = computeBookLayout({ width: 1440, height: 640, padX: 88, padY: 20 });
    expect(layout.mode).toBe('double');
    expect(layout.pageWidth).toBe(Math.floor(600 / PAGE_RATIO));
    expect(layout.bookWidth).toBe(layout.pageWidth * 2);
    expect(layout.pageHeight).toBeLessThanOrEqual(600);
  });

  it('is limited by width on a landscape tablet', () => {
    const layout = computeBookLayout({ width: 1000, height: 560, padX: 72, padY: 36 });
    expect(layout.mode).toBe('double');
    expect(layout.pageWidth).toBe(345);
  });

  it('prefers one big page on a portrait tablet', () => {
    const layout = computeBookLayout({ width: 820, height: 915, padX: 72, padY: 36 });
    expect(layout.mode).toBe('single');
    expect(layout.pageWidth).toBe(596);
  });

  it('falls back to one page on a phone', () => {
    const layout = computeBookLayout({ width: 390, height: 600, padX: 16, padY: 12 });
    expect(layout.mode).toBe('single');
    expect(layout.pageWidth).toBe(358);
    expect(layout.bookWidth).toBe(358);
  });

  it('never returns negative sizes', () => {
    const layout = computeBookLayout({ width: 0, height: 0, padX: 20, padY: 20 });
    expect(layout.pageWidth).toBe(0);
    expect(layout.pageHeight).toBe(0);
  });
});

describe('bookOffset', () => {
  it('centres the closed covers', () => {
    expect(bookOffset({ mode: 'double', position: 0, leafCount: 6, pageWidth: 400 })).toBe(-200);
    expect(bookOffset({ mode: 'double', position: 6, leafCount: 6, pageWidth: 400 })).toBe(200);
    expect(bookOffset({ mode: 'double', position: 3, leafCount: 6, pageWidth: 400 })).toBe(0);
  });

  it('never shifts a single page', () => {
    expect(bookOffset({ mode: 'single', position: 0, leafCount: 6, pageWidth: 400 })).toBe(0);
  });
});

describe('stepZoom', () => {
  it('walks the zoom levels and stops at the ends', () => {
    expect(stepZoom(1, 1)).toBe(1.5);
    expect(stepZoom(1.5, 1)).toBe(2);
    expect(stepZoom(2, 1)).toBe(2);
    expect(stepZoom(1.5, -1)).toBe(1);
    expect(stepZoom(1, -1)).toBe(1);
  });
});

describe('clampPan', () => {
  const base = { bookWidth: 800, bookHeight: 560, stageWidth: 1000, stageHeight: 600, margin: 0 };

  it('stays centred at 1×', () => {
    expect(clampPan({ ...base, x: 100, y: -50, zoom: 1 })).toEqual({ x: 0, y: 0 });
  });

  it('limits panning to the overflow', () => {
    expect(clampPan({ ...base, x: 900, y: -900, zoom: 2 })).toEqual({ x: 300, y: -260 });
    expect(clampPan({ ...base, x: 10, y: 10, zoom: 2 })).toEqual({ x: 10, y: 10 });
  });
});
