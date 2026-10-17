/**
 * Brochure data contract for Tabi 旅, an online brochure system about Japan.
 * Shared by the page renderer (components/brochure),
 * the flipbook viewer and the Studio editor. Everything is plain JSON so user
 * brochures can be saved to localStorage as-is.
 *
 * @typedef {Object} BrochureTheme
 * @property {string} paper    page background colour (hex)
 * @property {string} ink      main text colour (hex)
 * @property {string} accent   primary spot colour (hex)
 * @property {string} accent2  secondary spot colour (hex)
 * @property {string} muted    secondary text colour (hex)
 * @property {'serif'|'sans'|'mono'} typeface  heading typeface family
 *
 * @typedef {Object} CoverSpec
 * @property {CoverArtStyle} art   generative art style for <CoverArt>
 * @property {number} seed         integer seed; same seed = same artwork
 *
 * @typedef {'seigaiha'|'asanoha'|'hinomaru'|'fuji'|'sakura'|'torii'|'shippo'|'enso'|'kumo'|'ichimatsu'} CoverArtStyle
 *   Generative artwork based on traditional Japanese motifs:
 *   seigaiha 青海波 (overlapping waves) · asanoha 麻の葉 (hemp-leaf star lattice)
 *   hinomaru 日の丸 (rising sun + rays) · fuji 富士 (layered mountain ridges)
 *   sakura 桜 (falling petals) · torii 鳥居 (receding gates) · shippo 七宝 (interlocking circles)
 *   enso 円相 (zen brush circle) · kumo 雲 (stylised clouds) · ichimatsu 市松 (checkerboard)
 *
 * @typedef {Object} Brochure
 * @property {string} id
 * @property {string} slug                 used in the URL: #/brochures/:slug
 * @property {string} title
 * @property {string} titleJp              Japanese title, shown in vertical type (e.g. "京都")
 * @property {string} [titleKana]          hiragana reading of titleJp (e.g. "きょうと"), so kana
 *                                         search finds it; built-ins only (data/kana.js)
 * @property {string} subtitle
 * @property {string} category             id from data/categories.js
 * @property {string} region               id from data/regions.js
 * @property {string[]} seasons            best seasons: ids from data/seasons.js
 * @property {string} organization         publisher shown on the card (fictional)
 * @property {string} summary              one or two sentences for cards/search
 * @property {string[]} tags
 * @property {'booklet'|'bifold'|'trifold'} format
 * @property {string} updatedAt            ISO date
 * @property {number} readMinutes
 * @property {boolean} [featured]
 * @property {'builtin'|'user'} source
 * @property {BrochureTheme} theme
 * @property {CoverSpec} cover
 * @property {Page[]} pages                pages[0] is type "cover", last is type "back"
 *
 * Page = { id: string, type: PageType, ...fields } — fields per type below.
 */

import { dict } from './lookup.js';

/** Cover art styles understood by <CoverArt>. */
export const ART_STYLES = ['seigaiha', 'asanoha', 'hinomaru', 'fuji', 'sakura', 'torii', 'shippo', 'enso', 'kumo', 'ichimatsu'];

export const ART_LABELS = dict({
  seigaiha: { label: 'Seigaiha waves', jp: '青海波' },
  asanoha: { label: 'Asanoha star', jp: '麻の葉' },
  hinomaru: { label: 'Rising sun', jp: '日の丸' },
  fuji: { label: 'Mount Fuji', jp: '富士' },
  sakura: { label: 'Sakura petals', jp: '桜' },
  torii: { label: 'Torii gates', jp: '鳥居' },
  shippo: { label: 'Shippō rings', jp: '七宝' },
  enso: { label: 'Ensō circle', jp: '円相' },
  kumo: { label: 'Clouds', jp: '雲' },
  ichimatsu: { label: 'Ichimatsu check', jp: '市松' },
});

export const FORMATS = [
  { id: 'booklet', label: 'Booklet' },
  { id: 'bifold', label: 'Bi-fold' },
  { id: 'trifold', label: 'Tri-fold' },
];

/**
 * Every page type, its human label, its Japanese section name (`jp`, printed
 * in the page margin and shown by the Studio and the reader alike) and a
 * factory for a fresh page with sensible placeholder content. The Studio
 * builds its "Add page" menu and its field editors from this table. It has no prototype, so
 * `PAGE_TYPES[page.type]` is only truthy for a real page type.
 *
 * Field shapes:
 *  cover:    { eyebrow, title, titleJp, subtitle }               titleJp falls back to brochure.titleJp
 *  intro:    { kicker, heading, body, pullQuote }            body: paragraphs split by "\n\n"
 *  features: { kicker, heading, items: [{ icon, title, text }] }          2–6 items
 *  gallery:  { heading, items: [{ art, seed, caption }] }                 2–4 items
 *  stats:    { heading, body, items: [{ value, prefix, suffix, label }] } 2–4 items, value is a number
 *  agenda:   { heading, items: [{ time, title, text }] }                  3–6 items
 *  pricing:  { heading, note, plans: [{ name, price, period, features: string[], highlight }] } 1–3 plans
 *  phrases:  { heading, items: [{ jp, romaji, meaning }] }       3–6 items: useful Japanese
 *  quote:    { quote, author, role }
 *  contact:  { heading, body, cta, details: [{ icon, label, value }] }    2–4 details
 *  back:     { title, body, tagline }
 */
export const PAGE_TYPES = dict({
  cover: {
    label: 'Cover',
    jp: '表紙',
    description: 'Front cover with artwork',
    icon: 'BookOpen',
    create: () => ({ eyebrow: 'Volume 01', title: 'Your headline here', titleJp: '旅', subtitle: 'A short line that makes people want to turn the page.' }),
  },
  intro: {
    label: 'Introduction',
    jp: 'はじめに',
    description: 'Opening story with a pull quote',
    icon: 'PenLine',
    create: () => ({
      kicker: 'Welcome',
      heading: 'Start with the why',
      body: 'Tell readers what this brochure is about and why it matters to them.\n\nKeep paragraphs short — people skim brochures before they read them.',
      pullQuote: 'One sentence worth remembering.',
    }),
  },
  features: {
    label: 'Features',
    jp: '見どころ',
    description: 'Icon grid of highlights',
    icon: 'LayoutGrid',
    create: () => ({
      kicker: 'Highlights',
      heading: 'What makes it special',
      items: [
        { icon: 'Landmark', title: 'A dawn temple visit', text: 'Before the crowds, with only the monks and the raked gravel.' },
        { icon: 'Leaf', title: 'A garden at its peak', text: 'Moss, maples or blossom — timed to the season.' },
        { icon: 'Coffee', title: 'Tea with a host', text: 'A quiet bowl of matcha in an old town house.' },
        { icon: 'Heart', title: 'Dinner at the counter', text: 'Seasonal courses, made in front of you.' },
      ],
    }),
  },
  gallery: {
    label: 'Gallery',
    jp: '写真',
    description: 'Artwork tiles with captions',
    icon: 'Camera',
    create: () => ({
      heading: 'A closer look',
      items: [
        { art: 'fuji', seed: 11, caption: 'First light on the mountain' },
        { art: 'seigaiha', seed: 23, caption: 'Waves at the harbour' },
        { art: 'sakura', seed: 37, caption: 'Petals on the river' },
      ],
    }),
  },
  stats: {
    label: 'Numbers',
    jp: '数字',
    description: 'Big animated figures',
    icon: 'Award',
    create: () => ({
      heading: 'By the numbers',
      body: 'Japan, in figures.',
      items: [
        { value: 47, prefix: '', suffix: '', label: 'prefectures to explore' },
        { value: 4, prefix: '', suffix: '', label: 'distinct seasons' },
        { value: 3776, prefix: '', suffix: ' m', label: 'to the summit of Mount Fuji' },
      ],
    }),
  },
  agenda: {
    label: 'Schedule',
    jp: '旅程',
    description: 'Timeline or itinerary',
    icon: 'Calendar',
    create: () => ({
      heading: 'How the day runs',
      items: [
        { time: '07:00', title: 'Temple at dawn', text: 'Before the crowds, with the monks.' },
        { time: '12:00', title: 'Lunch at the market', text: 'Grilled skewers and fresh mochi.' },
        { time: '18:00', title: 'Onsen & kaiseki', text: 'A long soak, then a twelve-course dinner.' },
      ],
    }),
  },
  pricing: {
    label: 'Pricing',
    jp: '料金',
    description: 'Plans or packages',
    icon: 'Gem',
    create: () => ({
      heading: 'Choose your journey',
      note: 'Per person, two sharing. Tax included.',
      plans: [
        { name: 'Ryokan Night', price: '¥38,000', period: '1 night', features: ['Tatami room', 'Kaiseki dinner & breakfast'], highlight: false },
        {
          name: 'Slow Weekend',
          price: '¥72,000',
          period: '2 nights',
          features: ['Everything in Ryokan Night', 'Private onsen', 'Guided morning walk'],
          highlight: true,
        },
      ],
    }),
  },
  phrases: {
    label: 'Phrasebook',
    jp: '会話',
    description: 'Useful Japanese phrases',
    icon: 'Languages',
    create: () => ({
      heading: 'Say it in Japanese',
      items: [
        { jp: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Hello' },
        { jp: 'ありがとうございます', romaji: 'Arigatō gozaimasu', meaning: 'Thank you very much' },
        { jp: 'すみません', romaji: 'Sumimasen', meaning: 'Excuse me / sorry' },
        { jp: 'お願いします', romaji: 'Onegaishimasu', meaning: 'Please' },
      ],
    }),
  },
  quote: {
    label: 'Testimonial',
    jp: 'お客様の声',
    description: 'A large quote',
    icon: 'Star',
    create: () => ({ quote: 'The quietest, most beautiful week we have ever spent anywhere.', author: 'Alex Rivera', role: 'Traveller, spring 2026' }),
  },
  contact: {
    label: 'Contact',
    jp: 'お問い合わせ',
    description: 'How to reach you',
    icon: 'Mail',
    create: () => ({
      heading: 'Let’s talk',
      body: 'We reply within one business day.',
      cta: 'Get in touch',
      details: [
        { icon: 'Mail', label: 'Email', value: 'hello@your-studio.example' },
        { icon: 'Clock', label: 'Hours', value: 'Mon–Fri 10:00–18:00 JST' },
        { icon: 'MapPin', label: 'Visit', value: '1-2-3 Example-chō, Kyoto' },
      ],
    }),
  },
  back: {
    label: 'Back cover',
    jp: '裏表紙',
    description: 'Closing page',
    icon: 'Bookmark',
    create: () => ({ title: 'Mata ne — see you soon', body: 'Thank you for reading.', tagline: 'Made with Tabi 旅' }),
  },
});

export const PAGE_TYPE_IDS = Object.keys(PAGE_TYPES);
