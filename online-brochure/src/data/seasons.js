/** The four seasons (四季, shiki) — Japanese travel is planned around them. */
export const SEASONS = [
  { id: 'spring', label: 'Spring', jp: '春', romaji: 'haru', months: 'Mar – May', color: 'var(--wa-sakura)', motif: 'Cherry blossom' },
  { id: 'summer', label: 'Summer', jp: '夏', romaji: 'natsu', months: 'Jun – Aug', color: 'var(--wa-ai)', motif: 'Fireworks & festivals' },
  { id: 'autumn', label: 'Autumn', jp: '秋', romaji: 'aki', months: 'Sep – Nov', color: 'var(--wa-momiji)', motif: 'Red maple leaves' },
  { id: 'winter', label: 'Winter', jp: '冬', romaji: 'fuyu', months: 'Dec – Feb', color: 'var(--wa-sora)', motif: 'Snow & hot springs' },
];

export const SEASON_MAP = Object.fromEntries(SEASONS.map((s) => [s.id, s]));
