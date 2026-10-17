/**
 * Editorial copy for the Home page. Facts about Japan are real and kept
 * conservative; readers, names and quotes are fictional.
 */

/** Section running heads: number, English label, Japanese label. */
export const SECTIONS = {
  hero: { num: '01', label: 'Online brochures about Japan', jp: '表紙' },
  words: { num: '02', label: 'Words to travel with', jp: '言葉' },
  featured: { num: '03', label: 'Featured', jp: '特集' },
  seasons: { num: '04', label: 'Seasons', jp: '四季' },
  regions: { num: '05', label: 'Regions', jp: '地方' },
  how: { num: '06', label: 'How it works', jp: '使い方' },
  numbers: { num: '07', label: 'Japan in numbers', jp: '数字' },
  voices: { num: '08', label: 'Voices', jp: '声' },
  studio: { num: '09', label: 'Studio', jp: '制作' },
};

/** Two marquee rows of Japanese words: jp · romaji · meaning. */
export const WORDS = [
  [
    { jp: '旅', romaji: 'tabi', meaning: 'journey' },
    { jp: '桜', romaji: 'sakura', meaning: 'cherry blossom' },
    { jp: '温泉', romaji: 'onsen', meaning: 'hot spring' },
    { jp: '祭', romaji: 'matsuri', meaning: 'festival' },
    { jp: '侘び寂び', romaji: 'wabi-sabi', meaning: 'beauty in imperfection' },
    { jp: '一期一会', romaji: 'ichigo ichie', meaning: 'one time, one meeting' },
    { jp: '木漏れ日', romaji: 'komorebi', meaning: 'sunlight through leaves' },
    { jp: 'おもてなし', romaji: 'omotenashi', meaning: 'wholehearted hospitality' },
    { jp: '間', romaji: 'ma', meaning: 'negative space' },
  ],
  [
    { jp: '生き甲斐', romaji: 'ikigai', meaning: 'a reason for being' },
    { jp: '金継ぎ', romaji: 'kintsugi', meaning: 'mending with gold' },
    { jp: '花見', romaji: 'hanami', meaning: 'flower viewing' },
    { jp: '森林浴', romaji: 'shinrin-yoku', meaning: 'forest bathing' },
    { jp: '紅葉', romaji: 'momiji', meaning: 'autumn maple leaves' },
    { jp: '月見', romaji: 'tsukimi', meaning: 'moon viewing' },
    { jp: '風鈴', romaji: 'fūrin', meaning: 'wind chime' },
    { jp: '物の哀れ', romaji: 'mono no aware', meaning: 'the gentle sadness of passing things' },
    { jp: '縁', romaji: 'en', meaning: 'the ties that bring people together' },
  ],
];

/** One line per season for the 四季 accordion (data/seasons.js has the rest). */
export const SEASON_LINES = {
  spring: 'Hanami picnics under the blossom as the sakura front travels north, week by week, towards Hokkaidō.',
  summer: 'Lantern-lit matsuri, fireworks over the rivers and cool air high in the Japan Alps.',
  autumn: 'Maple leaves turn crimson from the north southwards, and temple gardens glow for weeks.',
  winter: 'Powder snow in Hokkaidō, steaming outdoor onsen and quiet temples under a white roof.',
};

/**
 * Panel colours per season: the wa-iro fill and an ink that stays AA-legible
 * on it in both themes. Autumn's maple is deepened a touch to carry cream text.
 */
export const SEASON_SWATCH = {
  spring: { fill: 'var(--wa-sakura)', ink: 'var(--wa-sumi)' },
  summer: { fill: 'var(--wa-ai)', ink: 'var(--wa-kinari)' },
  autumn: { fill: 'color-mix(in srgb, var(--wa-momiji) 80%, var(--wa-sumi))', ink: 'var(--wa-kinari)' },
  winter: { fill: 'var(--wa-sora)', ink: 'var(--wa-sumi)' },
};

/** The schematic rail line on the region map (north → south), plus the bridge to Shikoku. */
export const RAIL_LINE = ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'kyushu'];
export const BRIDGE_LINE = ['chugoku', 'shikoku'];

/** "How it works" steps. */
export const STEPS = [
  {
    id: 'browse',
    title: 'Browse',
    jp: '探す',
    romaji: 'sagasu',
    text: 'Filter the library by region, season or mood — from Kyoto’s temple lanes to Tokyo’s late-night counters.',
  },
  {
    id: 'flip',
    title: 'Flip',
    jp: 'めくる',
    romaji: 'mekuru',
    text: 'Open any brochure and turn its pages like paper — real 3D page-turns, on any screen, with or without a mouse.',
  },
  {
    id: 'create',
    title: 'Create',
    jp: '作る',
    romaji: 'tsukuru',
    text: 'Pick a cover motif, colours and pages in the Studio. Your brochure is saved right here in your browser.',
  },
];

/** Japan in numbers. */
export const FACTS = [
  {
    id: 'prefectures',
    value: 47,
    unit: '',
    label: 'prefectures',
    jp: '都道府県',
    note: 'From Hokkaidō in the north to Okinawa in the south.',
  },
  {
    id: 'islands',
    value: 14125,
    unit: '',
    label: 'islands',
    jp: '島',
    note: 'Recounted by the Geospatial Information Authority of Japan in 2023.',
  },
  {
    id: 'volcanoes',
    value: 111,
    unit: '',
    label: 'active volcanoes',
    jp: '活火山',
    note: '51 of them are watched around the clock by the Japan Meteorological Agency.',
  },
  {
    id: 'shinkansen',
    value: 320,
    unit: 'km/h',
    label: 'top Shinkansen service speed',
    jp: '新幹線',
    note: 'Reached by Hayabusa trains on the Tōhoku Shinkansen.',
  },
];

/** Letters from (fictional) readers. `art`/`seed` draw the postage stamp. */
export const VOICES = [
  {
    id: 'clara',
    name: 'Clara Jensen',
    city: 'Copenhagen',
    postmark: 'KYOTO',
    date: '2026.04.07',
    art: 'sakura',
    seed: 14,
    quote: 'It reads like a magazine you want to keep. I flipped through the Kyoto brochure twice before I had even booked flights.',
  },
  {
    id: 'daniel',
    name: 'Daniel Reyes',
    city: 'Manila',
    postmark: 'HAKONE',
    date: '2026.02.18',
    art: 'fuji',
    seed: 23,
    quote: 'I made a brochure for my parents’ first trip — onsen, slow trains, a phrasebook page. Dad printed it and carried it everywhere.',
  },
  {
    id: 'aiko',
    name: 'Aiko Brown',
    city: 'Vancouver',
    postmark: 'TOKYO',
    date: '2025.11.30',
    art: 'hinomaru',
    seed: 7,
    quote: 'The page turns feel like real paper. My kids now ask to “read Japan” at bedtime, one spread each.',
  },
  {
    id: 'samuel',
    name: 'Samuel Okoro',
    city: 'London',
    postmark: 'NARA',
    date: '2026.05.12',
    art: 'enso',
    seed: 19,
    quote: 'Finally a travel guide that respects ma — the space between things. Calm, beautiful and straight to the point.',
  },
  {
    id: 'priya',
    name: 'Priya Raman',
    city: 'Singapore',
    postmark: 'OSAKA',
    date: '2026.08.03',
    art: 'seigaiha',
    seed: 61,
    quote: 'We remixed the Tokyo brochure into a two-day food crawl for our team. It took twenty minutes and looked printed.',
  },
];
