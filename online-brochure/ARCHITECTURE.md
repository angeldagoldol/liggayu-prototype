# Tabi 旅 — architecture & conventions

Tabi is an online brochure system about Japan. Visitors browse a library of
interactive brochures (Kyoto, Tokyo, Hokkaido, Okinawa…), read them in a
flipbook with real 3D page-turns, and design their own Japan brochure in the
Studio. Everything runs in the browser; user data lives in `localStorage`.

## Design direction

**Japanese print culture meets a modern editorial magazine.**

- **Washi & sumi.** Warm unbleached paper (`--bg`), heavy ink (`--ink`), a
  fixed film-grain layer (`.grain`) over the whole app. Dark mode is "ink":
  near-black paper with cream type.
- **Wa-iro spot colours.** Vermilion `--wa-shu` (torii, seals), indigo
  `--wa-ai`, sakura, matcha, gold, wisteria… UI accent is `--accent` (deep
  vermilion, AA-contrast with `--accent-ink`). Never hard-code UI colours; use
  tokens from `src/styles/tokens.css`. Brochure pages are the exception: they
  use each brochure's own `theme` colours.
- **Type.** `--font-display` (Fraunces → Shippori Mincho for kanji) for
  headlines, `--font-sans` (Geist → Zen Kaku Gothic New) for UI and body,
  `--font-mono` (Geist Mono) for labels/eyebrows/numbers, `--font-jp` for
  Japanese set on its own. Japanese text always gets `lang="ja"`.
- **Motifs.** Vertical Japanese type (`<VerticalText>`, 縦書き), red seal stamps
  (`<Hanko>`), the rising-sun circle, traditional patterns (seigaiha waves,
  asanoha, shippō, ichimatsu), hairline keylines, crop marks, page folios,
  generous negative space (*ma*, 間).
- **Motion with intent.** Expo-out easing, springs for physical things (pages,
  magnets), staggered text reveals, scroll-linked parallax. Motion explains
  what happened; it never blocks the user. Everything respects
  `prefers-reduced-motion`.

## Stack

React 19 · React Router 7 (hash routing) · framer-motion 12 · lucide-react ·
Vite 7 · Vitest + Testing Library · ESLint 9. Plain CSS: global tokens/base in
`src/styles/`, everything else in CSS Modules next to the component.

```
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/ (relative paths, any host)
npm test          # vitest
npm run lint
```

## Folder layout

```
src/
  main.jsx                 providers: MotionConfig → Theme → Toast → Brochure
  App.jsx                  routes (lazy-loaded pages)
  styles/tokens.css        design tokens (colours, type, space, shadow, motion, z)
  styles/base.css          reset, typography, .container .eyebrow .display .jp .sr-only .grain
  lib/                     motion.js, cn.js, id.js, storage.js, format.js
  hooks/                   useMediaQuery, useHotkey, useLockBodyScroll, useFocusTrap,
                           useClipboard, useDocumentTitle
  context/                 ThemeContext, ToastContext, BrochureContext
  data/                    schema.js, brochures.js, categories.js, regions.js, seasons.js
  components/ui/           design-system primitives (see below)
  components/layout/       AppShell, Navbar, Footer, CommandPalette…
  components/brochure/     CoverArt, BrochurePage (+ page blocks), BrochureCard
  components/viewer/       flipbook + reader UI
  components/studio/       brochure editor UI
  pages/<Page>/            route components and their sections
```

## Routes

| Path | Page |
| --- | --- |
| `#/` | Home |
| `#/brochures` | Library — query params `q, category, season, region, fav, sort, view` |
| `#/brochures/:slug` | Viewer — query param `p` = page index |
| `#/studio` | Studio, new brochure (`?from=<slug>` remixes a brochure) |
| `#/studio/:id` | Studio, edit a user brochure |

Hash routing means **`href="#section"` anchors would change the route**. For
in-page jumps call `element.scrollIntoView({ behavior: 'smooth' })`.

## Data contract

See `src/data/schema.js` (JSDoc) — the single source of truth. A brochure has
`id, slug, title, titleJp, subtitle, category, region, seasons[], organization,
summary, tags[], format, updatedAt, readMinutes, featured, source, theme,
cover, pages[]`. Pages are `{ id, type, ...fields }` with types `cover, intro,
features, gallery, stats, agenda, pricing, phrases, quote, contact, back`.
`PAGE_TYPES[type].create()` returns placeholder content for a new page.
`ART_STYLES` lists the generative cover-art motifs.

User-made content can have empty or missing fields: renderers must never
crash on them.

## Shared APIs

```js
const { theme, preference, setPreference, toggle } = useTheme();
const toast = useToast(); toast({ title, description, tone: 'success' | 'error' | 'default', action: { label, onClick } });
const {
  brochures, builtins, userBrochures, favoriteIds, recentIds,
  getBySlug, getById, saveBrochure, deleteBrochure, toggleFavorite, isFavorite, markViewed,
} = useBrochures();
```

UI kit (`import { … } from '../../components/ui'`):
`Button` (variant primary|accent|secondary|ghost, size sm|md|lg, `to`/`href`,
iconLeft/iconRight, loading, block) · `IconButton` (label required, tooltip) ·
`Chip` · `Badge` · `Field` + `Input`/`Textarea`/`Select` · `Switch` ·
`Modal`/`Drawer` (focus trap, Esc, scroll lock) · `Kbd` · `Skeleton` ·
`RevealText` (masked word/char reveal) · `Marquee` · `Counter` · `Magnetic` ·
`Tilt` (3D tilt + glare, exposes `--mx/--my`) · `VerticalText` · `Hanko` ·
`Icon` (by name from the registry, for data-driven icons).

Motion presets: `import { ease, spring, fadeUp, stagger, viewportOnce, … } from '../../lib/motion.js'`.

## Conventions

- One component per file, `PascalCase.jsx` with a sibling `PascalCase.module.css`.
  Pure logic (filtering, search scoring, reducers) lives in plain `.js`
  modules with unit tests next to them (`*.test.js`).
- Short JSDoc on every exported component describing props.
- Accessibility is not optional: semantic landmarks and headings, labelled
  controls, visible focus, keyboard support for every pointer interaction,
  `aria-live` for dynamic results, `lang="ja"` on Japanese.
- Animate `transform` and `opacity`. Avoid layout thrash and heavy filters on
  many elements. Custom rAF/canvas animation must check `useReducedMotion()`.
- Responsive from 360px to 1920px+. No horizontal page scroll on phones.
- Facts about Japan must be real and conservative. Organisations, prices,
  people and contact details are fictional (`.example` domains).
