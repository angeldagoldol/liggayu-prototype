import { byId } from './lookup.js';

/**
 * Japan's eight traditional regions (地方, chihō), north to south. `kana` is
 * the reading of `jp`, for search (data/kana.js).
 * `tile` is a position on a 10×10 schematic grid for a stylised map
 * (x = west→east, y = north→south). It is decorative, not geographic.
 */
export const REGIONS = [
  { id: 'hokkaido', label: 'Hokkaidō', jp: '北海道', kana: 'ほっかいどう', tile: { x: 8, y: 0 }, blurb: 'Powder snow, lavender fields and wide-open wilderness.' },
  { id: 'tohoku', label: 'Tōhoku', jp: '東北', kana: 'とうほく', tile: { x: 7, y: 2 }, blurb: 'Quiet mountain onsen, summer festivals and apple country.' },
  { id: 'kanto', label: 'Kantō', jp: '関東', kana: 'かんとう', tile: { x: 7, y: 4 }, blurb: 'Tokyo, Yokohama, Nikkō and the Kamakura coast.' },
  { id: 'chubu', label: 'Chūbu', jp: '中部', kana: 'ちゅうぶ', tile: { x: 5, y: 4 }, blurb: 'Mount Fuji, the Japan Alps and old post towns.' },
  { id: 'kansai', label: 'Kansai', jp: '関西', kana: 'かんさい', tile: { x: 4, y: 5 }, blurb: 'Kyoto’s temples, Osaka’s street food and Nara’s deer.' },
  { id: 'chugoku', label: 'Chūgoku', jp: '中国', kana: 'ちゅうごく', tile: { x: 2, y: 5 }, blurb: 'Hiroshima, Miyajima and the Seto Inland Sea.' },
  { id: 'shikoku', label: 'Shikoku', jp: '四国', kana: 'しこく', tile: { x: 3, y: 6 }, blurb: 'The 88-temple pilgrimage and deep river gorges.' },
  { id: 'kyushu', label: 'Kyūshū & Okinawa', jp: '九州・沖縄', kana: 'きゅうしゅう おきなわ', tile: { x: 1, y: 7 }, blurb: 'Volcanoes, hot-spring towns and subtropical islands.' },
];

/** id → region, with no prototype (see lookup.js), so ids from user data are safe to look up. */
export const REGION_MAP = byId(REGIONS);

export function getRegion(id) {
  return REGION_MAP[id] ?? { id, label: id, jp: '日本', tile: { x: 5, y: 5 }, blurb: '' };
}
