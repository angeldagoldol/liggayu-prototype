import { describe, expect, it } from 'vitest';
import { estimateTextWidth, fitView, layoutMarkers, pinFrame, placeLabels, projectPins } from './mapLayout.js';

const project = (lat, lng) => (Number.isFinite(lat) && Number.isFinite(lng) ? { x: lng * 10, y: (90 - lat) * 10, inset: lat < 27 ? 'okinawa' : null, inFrame: lng < 150 } : null);

describe('projectPins', () => {
  it('numbers pins by their position in the input and skips unusable ones', () => {
    const pins = [{ id: 'a', lat: 35, lng: 135, label: 'A' }, null, { id: 'b', lat: 'x', lng: 1 }, { lat: '34.5', lng: '135.5', label: 'C' }, { id: 'd', lat: 27, lng: 160 }];
    const out = projectPins(pins, project);
    expect(out.map((p) => [p.id, p.number])).toEqual([
      ['a', 1],
      ['pin-3', 4],
      ['d', 5],
    ]);
    expect(out[1]).toMatchObject({ x: 1355, y: 555, inFrame: true });
    expect(out[2].inFrame).toBe(false);
    expect(projectPins('nope', project)).toEqual([]);
  });
});

describe('fitView', () => {
  const frame = { x: 0, y: 0, width: 1000, height: 1200 };

  it('shows the whole frame without pins or when pins are spread out', () => {
    expect(fitView([], frame)).toEqual(frame);
    expect(
      fitView(
        [
          { x: 50, y: 50 },
          { x: 950, y: 1100 },
        ],
        frame,
      ),
    ).toEqual(frame);
  });

  it('zooms to close pins with the frame aspect and a minimum span, inside the frame', () => {
    const view = fitView(
      [
        { x: 500, y: 600 },
        { x: 510, y: 605 },
      ],
      frame,
      { minSpan: 0.3 },
    );
    expect(view.width).toBe(300);
    expect(view.height).toBe(360);
    expect(view.x).toBeCloseTo(355, 0);
    const corner = fitView([{ x: 5, y: 5 }], frame, { minSpan: 0.3 });
    expect(corner).toMatchObject({ x: 0, y: 0 });
  });

  it('stays inside an offset frame (an inset box)', () => {
    const box = { x: 100, y: 50, width: 400, height: 200 };
    const view = fitView([{ x: 480, y: 240 }], box, { minSpan: 0.3 });
    expect(view.x + view.width).toBeLessThanOrEqual(500);
    expect(view.y + view.height).toBeLessThanOrEqual(250);
    expect(view.width / view.height).toBeCloseTo(2, 5);
  });
});

describe('pinFrame', () => {
  const insets = [{ id: 'okinawa', box: { x: 10, y: 10, width: 300, height: 200 } }];
  it('uses an inset box only when every pin is in it', () => {
    expect(pinFrame([{ inset: 'okinawa' }, { inset: 'okinawa' }], { width: 900, height: 1000 }, insets)).toEqual(insets[0].box);
    expect(pinFrame([{ inset: 'okinawa' }, { inset: null }], { width: 900, height: 1000 }, insets)).toEqual({ x: 0, y: 0, width: 900, height: 1000 });
    expect(pinFrame([], { width: 900, height: 1000 }, insets)).toEqual({ x: 0, y: 0, width: 900, height: 1000 });
  });
});

describe('layoutMarkers', () => {
  it('leaves lone pins in place and fans out clusters on a ring', () => {
    const points = [
      { id: 'a', x: 100, y: 100 },
      { id: 'b', x: 101, y: 100 },
      { id: 'c', x: 100, y: 102 },
      { id: 'far', x: 400, y: 400 },
    ];
    const out = layoutMarkers(points, { radius: 10 });
    const far = out.find((m) => m.id === 'far');
    expect(far).toMatchObject({ mx: 400, my: 400, displaced: false });
    const ring = out.filter((m) => m.displaced);
    expect(ring).toHaveLength(3);
    for (const m of ring) expect(Math.hypot(m.mx - m.cx, m.my - m.cy)).toBeGreaterThanOrEqual(29.9);
    // No two markers on the ring overlap.
    for (const a of ring) for (const b of ring) if (a !== b) expect(Math.hypot(a.mx - b.mx, a.my - b.my)).toBeGreaterThan(20);
  });
});

describe('placeLabels', () => {
  const bounds = { x: 0, y: 0, width: 1000, height: 1000 };

  it('puts a label right of its marker when there is room, else elsewhere', () => {
    const markers = [
      { id: 'a', mx: 500, my: 500 },
      { id: 'b', mx: 980, my: 500 },
    ];
    const [a, b] = placeLabels(markers, { radius: 10, fontSize: 20, bounds, texts: ['Kyoto', 'Tokyo'] });
    expect(a.anchor).toBe('start');
    expect(a.x).toBeGreaterThan(510);
    expect(b.anchor).not.toBe('start');
  });

  it('never overlaps two labels and drops one that fits nowhere', () => {
    const markers = Array.from({ length: 12 }, (_, i) => ({ id: `m${i}`, mx: 500 + (i % 2), my: 500 + (i % 3) }));
    const out = placeLabels(markers, { radius: 4, fontSize: 30, bounds, texts: markers.map(() => 'A long place name') });
    const boxes = out.filter(Boolean);
    expect(boxes.length).toBeLessThan(12);
    for (const p of boxes) for (const q of boxes) if (p !== q) expect(p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height).toBe(false);
  });

  it('keeps labels off fixed obstacles such as the inset caption', () => {
    const markers = [{ id: 'a', mx: 500, my: 500 }];
    const free = placeLabels(markers, { radius: 10, fontSize: 20, bounds, texts: ['Ishigaki'] })[0];
    expect(free.anchor).toBe('start');
    const caption = { x: free.x, y: free.y, width: free.width, height: free.height };
    const moved = placeLabels(markers, { radius: 10, fontSize: 20, bounds, texts: ['Ishigaki'], obstacles: [caption] })[0];
    expect(moved.anchor).not.toBe('start');
    expect(moved.x < caption.x + caption.width && caption.x < moved.x + moved.width && moved.y < caption.y + caption.height && caption.y < moved.y + moved.height).toBe(false);
  });

  it('skips markers without text', () => {
    expect(placeLabels([{ id: 'a', mx: 1, my: 1 }], { radius: 1, fontSize: 1, bounds, texts: [''] })).toEqual([null]);
  });
});

describe('estimateTextWidth', () => {
  it('counts CJK as a full em and Latin narrower', () => {
    expect(estimateTextWidth('京都', 10)).toBe(20);
    expect(estimateTextWidth('kyoto', 10)).toBeLessThan(30);
    expect(estimateTextWidth(undefined, 10)).toBe(0);
  });
});
