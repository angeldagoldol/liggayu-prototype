import { describe, expect, it } from 'vitest';
import { REGIONS } from '../../../data/regions.js';
import { neighborInDirection, routePoints, tileBounds, tileCenter } from './regionMap.js';

describe('tileBounds', () => {
  it('fits the tiles tightly', () => {
    const regions = [
      { id: 'a', tile: { x: 2, y: 1 } },
      { id: 'b', tile: { x: 5, y: 4 } },
    ];
    expect(tileBounds(regions)).toEqual({ minX: 2, minY: 1, cols: 4, rows: 4 });
  });

  it('has a sane fallback', () => {
    expect(tileBounds([])).toEqual({ minX: 0, minY: 0, cols: 1, rows: 1 });
  });

  it('gives the real regions a square-ish grid', () => {
    const { cols, rows } = tileBounds(REGIONS);
    expect(cols).toBeGreaterThan(1);
    expect(rows).toBeGreaterThan(1);
  });
});

describe('tileCenter / routePoints', () => {
  const regions = [
    { id: 'a', tile: { x: 2, y: 1 } },
    { id: 'b', tile: { x: 5, y: 4 } },
  ];
  const bounds = tileBounds(regions);

  it('centres tiles in grid units', () => {
    expect(tileCenter(regions[1], bounds)).toEqual({ x: 3.5, y: 3.5 });
  });

  it('joins tile centres in order and skips unknown ids', () => {
    expect(routePoints(regions, ['b', 'nope', 'a'], bounds)).toBe('3.5,3.5 0.5,0.5');
  });
});

describe('neighborInDirection', () => {
  it('moves across the real map like you would expect', () => {
    expect(neighborInDirection(REGIONS, 'kansai', 'ArrowRight')).toBe('chubu');
    expect(neighborInDirection(REGIONS, 'kansai', 'ArrowLeft')).toBe('chugoku');
    expect(neighborInDirection(REGIONS, 'kansai', 'ArrowDown')).toBe('shikoku');
    expect(neighborInDirection(REGIONS, 'tohoku', 'ArrowUp')).toBe('hokkaido');
    expect(neighborInDirection(REGIONS, 'chubu', 'ArrowRight')).toBe('kanto');
  });

  it('stays put at the edge of the map', () => {
    expect(neighborInDirection(REGIONS, 'hokkaido', 'ArrowUp')).toBe('hokkaido');
    expect(neighborInDirection(REGIONS, 'kyushu', 'ArrowLeft')).toBe('kyushu');
  });

  it('ignores other keys and unknown regions', () => {
    expect(neighborInDirection(REGIONS, 'kansai', 'Enter')).toBe('kansai');
    expect(neighborInDirection(REGIONS, 'atlantis', 'ArrowUp')).toBeNull();
  });
});
