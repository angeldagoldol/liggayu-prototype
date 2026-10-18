// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as japan from '../../data/geo/japan.js';
import { insideRings, locate, pathRings, prefectureLabel } from './geoLookup.js';

describe('pathRings / insideRings', () => {
  it('reads the baked path format and tests points, holes included', () => {
    const rings = pathRings('M0 0l10 0 0 10-10 0zM3 3l4 0 0 4-4 0z');
    expect(rings).toHaveLength(2);
    expect(insideRings([1, 1], rings)).toBe(true);
    expect(insideRings([5, 5], rings)).toBe(false);
    expect(insideRings([11, 5], rings)).toBe(false);
    expect(pathRings('')).toEqual([]);
  });
});

describe('locate', () => {
  it.each([
    ['Kiyomizu-dera', 34.9949, 135.785, 'JP-26', 'Kyoto'],
    ['Sensō-ji', 35.7148, 139.7967, 'JP-13', 'Tokyo'],
    ['Sapporo', 43.0618, 141.3545, 'JP-01', 'Hokkaidō'],
    ['Naha (inset)', 26.2124, 127.6809, 'JP-47', 'Okinawa'],
    ['Dōtonbori', 34.6687, 135.5013, 'JP-27', 'Osaka'],
  ])('puts %s in its prefecture', (_, lat, lng, code, name) => {
    const result = locate(lat, lng, japan);
    expect(result.state).toBe('land');
    expect(result.prefecture).toMatchObject({ code, name });
    expect(prefectureLabel(result.prefecture)).toBe(name);
  });

  it('knows open sea from land, and points off the map', () => {
    expect(locate(36.5, 133.0, japan)).toEqual({ state: 'sea' }); // Sea of Japan, north of Shimane
    expect(locate(48.8566, 2.3522, japan)).toEqual({ state: 'off' });
    expect(locate(Number.NaN, 1, japan)).toBeNull();
  });
});
