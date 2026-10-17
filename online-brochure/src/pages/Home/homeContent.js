/**
 * Editorial copy for the Home page. Facts about Japan are real and logged in
 * docs/research/home.md; quotes are real haiku with our own translations.
 * Photo ids point at src/data/photos/manifest/home.json (`home-…`); until a
 * photo is downloaded, each slot shows its generative fallback art.
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
  haiku: { num: '08', label: 'Haiku', jp: '俳句' },
  studio: { num: '09', label: 'Studio', jp: '制作' },
};

/**
 * The hero tri-fold's three inside panels: a real photograph each (falling
 * back to the generative `art`), with a printed caption block.
 */
export const HERO_PANELS = {
  left: {
    photo: 'home-hero-fuji',
    art: 'fuji',
    seed: 23,
    jp: '富士山',
    title: 'Mount Fuji',
    body: 'Japan’s highest peak rises 3,776 m between Shizuoka and Yamanashi.',
    folio: '02',
  },
  middle: {
    photo: 'home-hero-torii',
    art: 'torii',
    seed: 23,
    jp: '伏見稲荷大社',
    title: 'Fushimi Inari',
    body: 'Some 10,000 vermilion torii, gifts from worshippers, climb Mount Inari in Kyoto.',
    folio: '03',
  },
  right: {
    photo: 'home-hero-shibuya',
    art: 'ichimatsu',
    seed: 61,
    jp: '渋谷',
    title: 'Shibuya Crossing',
    body: 'At peak times, up to 3,000 people cross at once when the lights turn green.',
    folio: '04',
  },
};

/** Two marquee rows of Japanese words: jp · romaji · meaning. */
export const WORDS = [
  [
    { jp: '旅', romaji: 'tabi', meaning: 'journey' },
    { jp: '桜', romaji: 'sakura', meaning: 'cherry blossom' },
    { jp: '温泉', romaji: 'onsen', meaning: 'hot spring' },
    { jp: '祭', romaji: 'matsuri', meaning: 'festival' },
    { jp: '侘び寂び', romaji: 'wabi-sabi', meaning: 'beauty in the imperfect and impermanent' },
    { jp: '一期一会', romaji: 'ichigo ichie', meaning: 'one time, one meeting' },
    { jp: '木漏れ日', romaji: 'komorebi', meaning: 'sunlight through leaves' },
    { jp: 'おもてなし', romaji: 'omotenashi', meaning: 'wholehearted hospitality' },
    { jp: '間', romaji: 'ma', meaning: 'the space between' },
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
  summer: 'Lantern-lit matsuri, fireworks over the rivers, lavender in Hokkaidō and cool air high in the Japan Alps.',
  autumn: 'Maple leaves turn crimson from the north southwards and from the peaks down, and temple gardens glow for weeks.',
  winter: 'Powder snow in Hokkaidō, steaming outdoor onsen and quiet temples under a white roof.',
};

/** The photograph an open season shows (manifest ids; the summer line mentions its lavender). */
export const SEASON_PHOTOS = {
  spring: 'home-season-spring',
  summer: 'home-season-summer',
  autumn: 'home-season-autumn',
  winter: 'home-season-winter',
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

/**
 * What each region is known for (docs/research/home.md §3), the place its
 * card pictures (`place`/`placeJp`, the manifest photo `photo`) and the
 * generative art shown until that photo is downloaded.
 */
export const REGION_NOTES = {
  hokkaido: {
    knownFor: 'Powder snow, Furano’s July lavender, Ainu heritage and the wild Shiretoko Peninsula.',
    place: 'Shiretoko Five Lakes',
    placeJp: '知床五湖',
    photo: 'home-region-hokkaido',
    art: 'kumo',
    seed: 23,
  },
  tohoku: {
    knownFor: 'August lantern festivals, apple orchards, mountain onsen and Bashō’s Narrow Road.',
    place: 'Yamadera (Risshaku-ji)',
    placeJp: '山寺（立石寺）',
    photo: 'home-region-tohoku',
    art: 'asanoha',
    seed: 7,
  },
  kanto: {
    knownFor: 'Tokyo and Yokohama, the shrines of Nikkō, Kamakura’s Great Buddha and Hakone’s hot springs.',
    place: 'Sensō-ji, Asakusa',
    placeJp: '浅草寺',
    photo: 'home-region-kanto',
    art: 'ichimatsu',
    seed: 23,
  },
  chubu: {
    knownFor: 'Mount Fuji, the Japan Alps, thatched Shirakawa-gō and castle towns like Matsumoto.',
    place: 'Matsumoto Castle',
    placeJp: '松本城',
    photo: 'home-region-chubu',
    art: 'fuji',
    seed: 7,
  },
  kansai: {
    knownFor: 'Kyoto’s temples, Nara’s deer and Great Buddha, Osaka’s street food and Himeji’s white castle.',
    place: 'Tōdai-ji, Nara',
    placeJp: '東大寺',
    photo: 'home-region-kansai',
    art: 'torii',
    seed: 7,
  },
  chugoku: {
    knownFor: 'Hiroshima’s Peace Memorial, Miyajima’s floating torii and the Seto Inland Sea.',
    place: 'Itsukushima Shrine, Miyajima',
    placeJp: '厳島神社',
    photo: 'home-region-chugoku',
    art: 'seigaiha',
    seed: 61,
  },
  shikoku: {
    knownFor: 'The 88-temple pilgrimage, Iya Valley vine bridges and Dōgo’s ancient hot spring.',
    place: 'Iya no Kazurabashi',
    placeJp: '祖谷のかずら橋',
    photo: 'home-region-shikoku',
    art: 'enso',
    seed: 19,
  },
  kyushu: {
    knownFor: 'Smoking Sakurajima and Aso, Beppu’s hot springs and Okinawa’s coral seas.',
    place: 'Sakurajima',
    placeJp: '桜島',
    photo: 'home-region-kyushu',
    art: 'hinomaru',
    seed: 23,
  },
};

/**
 * The region map's source line. The inset scale is the Okinawa inset's
 * projection scale over the main frame's in src/data/geo/japan.js
 * (homeContent.test.js recomputes it, so a map rebuild cannot leave it stale).
 */
export const MAP_SOURCE = 'Natural Earth · Okinawa & Amami inset ×1.12';

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

/** Japan in numbers (docs/research/home.md §1.2, §2.1). */
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
    note: 'Recounted by the Geospatial Information Authority in 2023; the old figure was 6,852.',
  },
  {
    id: 'volcanoes',
    value: 111,
    unit: '',
    label: 'active volcanoes',
    jp: '活火山',
    // "About 50": JMA's list of continuously monitored volcanoes was 50 from 2016; 51 is unconfirmed.
    note: 'About 50 of them are watched around the clock by the Japan Meteorological Agency.',
  },
  {
    id: 'shinkansen',
    value: 320,
    unit: 'km/h',
    label: 'top Shinkansen service speed',
    jp: '新幹線',
    note: 'Reached by Hayabusa trains between Utsunomiya and Morioka, on the Tōhoku Shinkansen.',
  },
];

/** Credit for every translation below (REAL_CONTENT: label our own translations). */
export const TRANSLATION_CREDIT = 'Translation: Tabi Guides';

/**
 * Five classic haiku, sent as postcards from the places that inspired them
 * (docs/research/home.md §1.1). `jp`, `romaji` and `en` hold the three
 * phrases of each poem; `en` is our own translation. `year` is softened to
 * "c." where the research marks the date uncertain. `art`/`seed` draw the
 * postage stamp. All three poets died before 1903: the poems are public domain.
 */
export const HAIKU = [
  {
    id: 'basho-furuike',
    poet: 'Matsuo Bashō',
    poetJp: '松尾芭蕉',
    place: 'Fukagawa, Edo',
    today: 'Kōtō, Tokyo',
    postmark: 'EDO',
    year: '1686',
    jp: ['古池や', '蛙飛びこむ', '水の音'],
    romaji: ['Furuike ya', 'kawazu tobikomu', 'mizu no oto'],
    en: ['The old pond —', 'a frog jumps in,', 'the sound of water.'],
    art: 'seigaiha',
    seed: 23,
  },
  {
    id: 'basho-hiraizumi',
    poet: 'Matsuo Bashō',
    poetJp: '松尾芭蕉',
    place: 'Hiraizumi, Iwate',
    postmark: 'HIRAIZUMI',
    year: '1689',
    jp: ['夏草や', '兵どもが', '夢の跡'],
    romaji: ['Natsukusa ya', 'tsuwamono-domo ga', 'yume no ato'],
    en: ['Summer grasses —', 'all that is left', 'of warriors’ dreams.'],
    art: 'asanoha',
    seed: 7,
  },
  {
    id: 'basho-yamadera',
    poet: 'Matsuo Bashō',
    poetJp: '松尾芭蕉',
    place: 'Yamadera (Risshaku-ji), Yamagata',
    postmark: 'YAMADERA',
    year: '1689',
    jp: ['閑さや', '岩にしみ入る', '蝉の声'],
    romaji: ['Shizukasa ya', 'iwa ni shimiiru', 'semi no koe'],
    en: ['Such stillness —', 'the cicadas’ cry', 'soaks into the rocks.'],
    art: 'enso',
    seed: 19,
  },
  {
    id: 'issa-kashiwabara',
    poet: 'Kobayashi Issa',
    poetJp: '小林一茶',
    place: 'Kashiwabara, Shinano',
    today: 'Shinano-machi, Nagano',
    postmark: 'KASHIWABARA',
    year: 'c. 1812',
    jp: ['是がまあ', 'つひの栖か', '雪五尺'],
    romaji: ['Kore ga maa', 'tsui no sumika ka', 'yuki go-shaku'],
    en: ['So this, then,', 'is my final home?', 'Five feet of snow.'],
    art: 'kumo',
    seed: 23,
  },
  {
    id: 'shiki-horyuji',
    poet: 'Masaoka Shiki',
    poetJp: '正岡子規',
    place: 'Hōryū-ji, Ikaruga, Nara',
    postmark: 'IKARUGA',
    year: '1895',
    jp: ['柿食へば', '鐘が鳴るなり', '法隆寺'],
    romaji: ['Kaki kueba', 'kane ga naru nari', 'Hōryūji'],
    en: ['I bite a persimmon —', 'and the bell rings out', 'at Hōryū-ji.'],
    art: 'hinomaru',
    seed: 61,
  },
];
