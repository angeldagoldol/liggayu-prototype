import { describe, expect, it } from 'vitest';
import { REGIONS } from '../../../data/regions.js';
import { regionCenters } from '../../../data/geo/japan.js';
import { neighborInDirection, regionPoints, stepId } from './regionMap.js';

const POINTS = regionPoints(REGIONS, regionCenters);

describe('regionPoints', () => {
  it('places every region on the real map, in REGIONS order', () => {
    expect(POINTS.map((p) => p.id)).toEqual(REGIONS.map((r) => r.id));
    for (const p of POINTS) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });

  it('skips regions without a finite centre and survives missing input', () => {
    expect(regionPoints([{ id: 'a' }, { id: 'b' }], { a: [1, 2], b: [Number.NaN, 3] })).toEqual([{ id: 'a', x: 1, y: 2 }]);
    expect(regionPoints(undefined, regionCenters)).toEqual([]);
    expect(regionPoints(REGIONS, undefined)).toEqual([]);
  });
});

describe('neighborInDirection (on the real map)', () => {
  it('travels the archipelago the way it lies', () => {
    expect(neighborInDirection(POINTS, 'kanto', 'ArrowUp')).toBe('tohoku');
    expect(neighborInDirection(POINTS, 'tohoku', 'ArrowUp')).toBe('hokkaido');
    expect(neighborInDirection(POINTS, 'kanto', 'ArrowLeft')).toBe('chubu');
    expect(neighborInDirection(POINTS, 'chubu', 'ArrowLeft')).toBe('kansai');
    expect(neighborInDirection(POINTS, 'kansai', 'ArrowLeft')).toBe('chugoku');
    expect(neighborInDirection(POINTS, 'kansai', 'ArrowDown')).toBe('shikoku');
    expect(neighborInDirection(POINTS, 'chugoku', 'ArrowLeft')).toBe('kyushu');
    expect(neighborInDirection(POINTS, 'chubu', 'ArrowRight')).toBe('kanto');
  });

  it('stays put at the edge of the map', () => {
    expect(neighborInDirection(POINTS, 'hokkaido', 'ArrowUp')).toBe('hokkaido');
    expect(neighborInDirection(POINTS, 'kyushu', 'ArrowLeft')).toBe('kyushu');
  });

  it('prefers a region straight ahead over a nearer one off to the side', () => {
    const points = [
      { id: 'from', x: 0, y: 0 },
      { id: 'ahead', x: 10, y: 0 },
      { id: 'side', x: 4, y: 6 },
    ];
    expect(neighborInDirection(points, 'from', 'ArrowRight')).toBe('ahead');
  });

  it('returns null for unknown keys or ids', () => {
    expect(neighborInDirection(POINTS, 'kanto', 'Enter')).toBeNull();
    expect(neighborInDirection(POINTS, 'atlantis', 'ArrowUp')).toBeNull();
    expect(neighborInDirection(undefined, 'kanto', 'ArrowUp')).toBeNull();
  });
});

describe('stepId', () => {
  const ids = ['a', 'b', 'c'];
  it('steps forwards and back, wrapping round', () => {
    expect(stepId(ids, 'a', 1)).toBe('b');
    expect(stepId(ids, 'c', 1)).toBe('a');
    expect(stepId(ids, 'a', -1)).toBe('c');
  });

  it('starts at the first id when the current one is unknown', () => {
    expect(stepId(ids, 'z', 1)).toBe('a');
    expect(stepId([], 'a', 1)).toBeNull();
  });
});
