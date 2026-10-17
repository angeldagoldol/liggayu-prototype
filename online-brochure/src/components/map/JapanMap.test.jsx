import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { JapanMap } from './JapanMap.jsx';
import { mapSummary } from './mapLayout.js';

const pins = [
  { id: 'inari', lat: 34.9671, lng: 135.7727, label: 'Fushimi Inari Taisha', labelJp: '伏見稲荷大社' },
  { id: 'tokyo', lat: 35.6812, lng: 139.7671, label: 'Tokyo', labelJp: '東京' },
  { id: 'naha', lat: 26.2124, lng: 127.6809, label: 'Naha' },
];

describe('<JapanMap>', () => {
  it('is one image with a summary of its pins when static', () => {
    const { container } = render(<JapanMap pins={pins} />);
    const img = screen.getByRole('img', { name: 'Map of Japan with 3 places: 1 Fushimi Inari Taisha, 2 Tokyo, 3 Naha' });
    expect(img.tagName).toBe('svg');
    expect(container.querySelectorAll('[data-code]')).toHaveLength(47);
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('draws numbered markers and the Okinawa inset label', () => {
    const { container } = render(<JapanMap pins={pins} />);
    const numbers = [...container.querySelectorAll('circle + text')].map((t) => t.textContent);
    expect(numbers).toEqual(['1', '2', '3']);
    expect(container.textContent).toContain('沖縄');
    expect(container.querySelector('[lang="ja"]')).not.toBeNull();
  });

  it('zooms in when the pins are close together', () => {
    const kyoto = [
      { id: 'a', lat: 34.9671, lng: 135.7727, label: 'Fushimi Inari' },
      { id: 'b', lat: 34.9949, lng: 135.785, label: 'Kiyomizu-dera' },
    ];
    const { container } = render(<JapanMap pins={kyoto} />);
    const [, , w] = container.querySelector('svg').getAttribute('viewBox').split(' ').map(Number);
    expect(w).toBeLessThan(1200);
    const whole = render(<JapanMap pins={kyoto} focus="japan" />);
    expect(whole.container.querySelector('svg').getAttribute('viewBox')).toMatch(/^0 0 2400 /);
  });

  it('shows the whole map when pins are both in the inset and on the main islands', () => {
    const { container } = render(<JapanMap pins={pins} />);
    expect(container.querySelector('svg').getAttribute('viewBox')).toMatch(/^0 0 2400 /);
    expect(container.querySelector('[data-code="JP-47"] path')).not.toBeNull();
  });

  it('never shows the inset box or its islands in a close-up of the main islands', () => {
    const tokyo = [
      { id: 'a', lat: 35.6595, lng: 139.7005, label: 'Shibuya' },
      { id: 'b', lat: 35.7148, lng: 139.7967, label: 'Sensō-ji' },
    ];
    const { container } = render(<JapanMap pins={tokyo} />);
    expect(container.querySelector('svg').getAttribute('viewBox')).not.toMatch(/^0 0 2400 /);
    expect(container.querySelector('[data-code="JP-47"] path')).toBeNull();
    expect(container.textContent).not.toContain('沖縄');
  });

  it('zooms into the inset when every pin is there, keeping its caption in view', () => {
    const okinawa = [
      { id: 'a', lat: 26.2169, lng: 127.7194, label: 'Shuri Castle' },
      { id: 'b', lat: 26.6942, lng: 127.8781, label: 'Churaumi Aquarium' },
    ];
    const { container } = render(<JapanMap pins={okinawa} />);
    const [vx, vy, vw, vh] = container.querySelector('svg').getAttribute('viewBox').split(' ').map(Number);
    const caption = [...container.querySelectorAll('text')].find((t) => t.textContent.includes('Okinawa & Amami'));
    expect(caption).toBeTruthy();
    const x = Number(caption.getAttribute('x'));
    const y = Number(caption.getAttribute('y'));
    expect(x).toBeGreaterThan(vx);
    expect(x).toBeLessThan(vx + vw);
    expect(y).toBeGreaterThan(vy);
    expect(y).toBeLessThan(vy + vh);
  });

  it('survives junk pins', () => {
    expect(() => render(<JapanMap pins={[null, {}, { lat: 'x' }, { lat: 1e9, lng: 2 }, 'pin']} />)).not.toThrow();
    expect(() => render(<JapanMap pins="nope" />)).not.toThrow();
    expect(() => render(<JapanMap />)).not.toThrow();
  });

  it('makes regions keyboard buttons when interactive', () => {
    const onRegionClick = vi.fn();
    const onRegionEnter = vi.fn();
    render(<JapanMap highlightedRegion="kansai" onRegionClick={onRegionClick} onRegionEnter={onRegionEnter} />);
    expect(screen.getByRole('group', { name: /Map of Japan, Kansai highlighted/ })).toBeInTheDocument();
    const kansai = screen.getByRole('button', { name: 'Kansai 関西' });
    expect(kansai).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getAllByRole('button')).toHaveLength(8);
    fireEvent.focus(kansai);
    expect(onRegionEnter).toHaveBeenLastCalledWith('kansai');
    fireEvent.keyDown(kansai, { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('button', { name: /Hokkaidō/ }), { key: ' ' });
    expect(onRegionClick.mock.calls).toEqual([['kansai'], ['hokkaido']]);
    fireEvent.blur(kansai);
    expect(onRegionEnter).toHaveBeenLastCalledWith(null);
  });
});

describe('mapSummary', () => {
  it('names labelled pins and the highlighted region', () => {
    expect(mapSummary([])).toBe('Map of Japan');
    expect(mapSummary(undefined, 'Tōhoku')).toBe('Map of Japan, Tōhoku highlighted');
    expect(mapSummary([{ label: ' Kyoto ' }, { label: '' }, null], 'Kansai')).toBe('Map of Japan with 1 place: 1 Kyoto; Kansai highlighted');
  });
});
