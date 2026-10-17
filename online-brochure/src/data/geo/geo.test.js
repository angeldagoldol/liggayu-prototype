import { describe, expect, it } from 'vitest';
import { REGIONS } from '../regions.js';
import { createProjection, createProjector, inBounds, lambertConformalConic } from './projection.js';
import * as japan from './japan.js';

describe('lambertConformalConic', () => {
  const raw = lambertConformalConic({ lat1: 33, lat2: 43, lat0: 37.5, lng0: 137.5 });

  it('puts the origin at 0,0 and north up', () => {
    const [x, y] = raw(37.5, 137.5);
    expect(x).toBeCloseTo(0, 10);
    expect(y).toBeCloseTo(0, 10);
    expect(raw(40, 137.5)[1]).toBeGreaterThan(0);
    expect(raw(37.5, 140)[0]).toBeGreaterThan(0);
  });

  it('is conformal at a standard parallel: a small step east and north scale alike', () => {
    const d = 0.01;
    const [x0, y0] = raw(33, 137.5);
    const [xe, ye] = raw(33, 137.5 + d);
    const [xn, yn] = raw(33 + d, 137.5);
    const east = Math.hypot(xe - x0, ye - y0) / Math.cos((33 * Math.PI) / 180);
    const north = Math.hypot(xn - x0, yn - y0);
    expect(east / north).toBeCloseTo(1, 3);
  });
});

describe('createProjector', () => {
  const main = { bounds: [128, 30, 146, 45.7], projection: { lat1: 33, lat2: 43, lat0: 37.5, lng0: 137.5, scale: 1000, tx: 500, ty: 500 } };
  const insets = [{ id: 'okinawa', bounds: [122.75, 23.95, 128.6, 27.25], projection: { lat1: 24.5, lat2: 26.8, lat0: 25.6, lng0: 125.7, scale: 1500, tx: 100, ty: 100 } }];
  const project = createProjector({ main, insets });

  it('uses the inset projection for points inside an inset', () => {
    expect(project(26.2124, 127.6809)).toMatchObject({ inset: 'okinawa', inFrame: true });
    expect(project(35.0, 135.77)).toMatchObject({ inset: null, inFrame: true });
  });

  it('flags points the map does not show, and rejects bad input', () => {
    expect(project(27.09, 142.19)).toMatchObject({ inset: null, inFrame: false });
    expect(project(Number.NaN, 135)).toBeNull();
    expect(project(91, 135)).toBeNull();
    expect(project('35', 135)).toBeNull();
  });

  it('rounds to a tenth of a unit and matches createProjection', () => {
    const [x, y] = createProjection(main.projection)(35, 135.77);
    const p = project(35, 135.77);
    expect(p.x).toBeCloseTo(x, 1);
    expect(p.y).toBeCloseTo(y, 1);
  });

  it('inBounds is inclusive', () => {
    expect(inBounds([0, 0, 1, 1], 1, 1)).toBe(true);
    expect(inBounds([0, 0, 1, 1], 1.01, 0.5)).toBe(false);
  });
});

describe('generated japan.js', () => {
  it('has all 47 prefectures with JIS codes, names and app regions', () => {
    expect(japan.prefectures).toHaveLength(47);
    expect(japan.prefectures.map((p) => p.code)).toEqual(Array.from({ length: 47 }, (_, i) => `JP-${String(i + 1).padStart(2, '0')}`));
    const regions = new Set(REGIONS.map((r) => r.id));
    for (const p of japan.prefectures) {
      expect(regions.has(p.region)).toBe(true);
      expect(p.name).toBeTruthy();
      expect(p.nameJp).toMatch(/[都道府県]$/);
      expect(p.d || p.insetD).toMatch(/^M-?\d+ -?\d+l/);
    }
    for (const region of regions) expect(japan.prefectures.some((p) => p.region === region)).toBe(true);
  });

  it('maps the regions the way the app groups them', () => {
    const regionOf = Object.fromEntries(japan.prefectures.map((p) => [p.code, p.region]));
    expect(regionOf['JP-01']).toBe('hokkaido');
    expect(regionOf['JP-13']).toBe('kanto');
    expect(regionOf['JP-26']).toBe('kansai');
    expect(regionOf['JP-41']).toBe('kyushu'); // Saga: no region in Natural Earth
    expect(regionOf['JP-42']).toBe('kyushu'); // Nagasaki: no region in Natural Earth
    expect(regionOf['JP-47']).toBe('kyushu');
  });

  it('draws Okinawa only in its inset', () => {
    const okinawa = japan.prefectures.find((p) => p.code === 'JP-47');
    expect(okinawa).toMatchObject({ name: 'Okinawa', nameJp: '沖縄県', inset: 'okinawa', d: '' });
    expect(okinawa.insetD.length).toBeGreaterThan(100);
    expect(japan.insets).toEqual([expect.objectContaining({ id: 'okinawa', labelJp: '沖縄・奄美', box: expect.any(Object) })]);
  });

  it('projects real places where they belong', () => {
    const [, , , height] = japan.viewBox.split(' ').map(Number);
    const tokyo = japan.project(35.6812, 139.7671);
    const sapporo = japan.project(43.0618, 141.3545);
    const fukuoka = japan.project(33.5902, 130.4017);
    const naha = japan.project(26.2124, 127.6809);
    for (const p of [tokyo, sapporo, fukuoka]) {
      expect(p).toMatchObject({ inset: null, inFrame: true });
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(japan.width);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(height);
    }
    expect(sapporo.y).toBeLessThan(tokyo.y);
    expect(fukuoka.x).toBeLessThan(tokyo.x);
    expect(naha.inset).toBe('okinawa');
    const box = japan.insets[0].box;
    expect(naha.x).toBeGreaterThan(box.x);
    expect(naha.x).toBeLessThan(box.x + box.width);
    expect(naha.y).toBeGreaterThan(box.y);
    expect(naha.y).toBeLessThan(box.y + box.height);
  });

  it('includes Lake Biwa', () => {
    expect(japan.lakes.map((l) => l.name)).toContain('Lake Biwa');
  });
});
