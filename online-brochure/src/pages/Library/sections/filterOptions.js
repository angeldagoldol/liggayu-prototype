import { REGIONS } from '../../../data/regions.js';
import { SORTS } from '../filterBrochures.js';

/** Region <option>s with live counts. */
export function regionOptions(counts = {}) {
  return [
    { value: '', label: 'All regions' },
    ...REGIONS.map((r) => ({ value: r.id, label: `${r.label} ${r.jp} · ${counts[r.id] ?? 0}` })),
  ];
}

export const SORT_OPTIONS = SORTS.map((s) => ({ value: s.id, label: s.label }));
