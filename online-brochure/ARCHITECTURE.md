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
- **Type.** `--font-display` ('Tabi Macrons' → Fraunces → Shippori Mincho for
  kanji) for headlines — 'Tabi Macrons' (base.css) is Fraunces' latin-ext file
  limited to ā ē ī ō ū, so "Tōhoku" keeps its macron on the letter — `--font-sans` (Geist → Zen Kaku Gothic New) for UI and body,
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
npm run dev       # http://localhost:5173 (+ /playground.html, the brochure-kit workbench)
npm run build     # static site in dist/ (relative paths, any host)
npm test          # vitest: unit, component, and a smoke test of every route (src/App.test.jsx)
npm run lint
```

Bundling (`vite.config.js`): an entry chunk (shell, contexts, built-in data),
two long-lived vendor chunks — `react` (react, react-dom, router) and `motion`
(framer-motion) — and one lazy chunk per route. The command palette panel
(`PalettePanel.jsx`, with search, cover thumbnails and the icon registry) is a
lazy chunk prefetched when the browser is idle; `cover-art` is shared by the
routes that draw covers.

## Folder layout

```
src/
  main.jsx                 providers: MotionConfig → Theme → Toast → Brochure
  App.jsx                  routes (lazy-loaded pages)
  styles/tokens.css        design tokens (colours, type, space, shadow, motion, z)
  styles/base.css          reset, typography, .container .eyebrow .display .jp .sr-only .grain
  lib/                     motion.js, cn.js, id.js, storage.js, format.js (+ tests)
  hooks/                   useMediaQuery, useHotkey, useLockBodyScroll, useFocusTrap,
                           useClipboard, useDocumentTitle (+ tests)
  context/                 ThemeContext, ToastContext, BrochureContext (+ tests)
  data/                    schema.js, brochures.js, categories.js, regions.js, seasons.js
  components/ui/           design-system primitives (see below)
  components/layout/       AppShell, Navbar, Footer, RouteTransition, CommandPalette
                           (lazy PalettePanel), search.js (shared text folding),
                           navState.js (navbar visibility), japanTime.js
  components/brochure/     CoverArt (+ art/: PRNG, colour, 10 pattern generators),
                           BrochurePage (+ blocks/: one block per page type), BrochureCard
  components/viewer/       flipbook + reader UI (pure maths in spreads/flipMath/layout.js)
  components/studio/       brochure editor UI (studioReducer, templates, palettes, publishCheck…)
  pages/<Page>/            route components and their sections
  dev/                     playground.html workbench (dev server only, not built)
  test/setup.js            jsdom polyfills
```

## Routes

| Path | Page |
| --- | --- |
| `#/` | Home |
| `#/brochures` | Library — `q` (text), `category`, `season` (comma list, matches ANY), `region`, `fav=1`, `sort` (`featured\|newest\|az\|quickest`), `view=list`. Unknown values are dropped. |
| `#/brochures/:slug` | Viewer — `p` = 0-based page index (clamped; `p=0` is omitted) |
| `#/studio` | Studio start screen: templates, blank, remix |
| `#/studio?draft=1` | Studio editor on the working draft (autosaved to `tabi:studio-draft`) |
| `#/studio?from=<slug>` | Remix any brochure into a fresh draft (asks before replacing an unpublished one), then replaces the URL with `?draft=1` |
| `#/studio/:id` | Studio, edit a user brochure (built-ins open read-only with a Remix button) |
| anything else | NotFound (迷子) |

Shell behaviour every page can rely on (`components/layout/AppShell.jsx`):

- Route changes play the curtain transition when the **pathname** changes;
  query-string changes never do. A REPLACE navigation that only appends a
  segment (`/studio` → `/studio/:id`) or `state: { shellTransition: false }`
  keeps the page mounted.
- After a transition the shell scrolls to the top and focuses `<main>`.
- `/brochures/:slug` is *immersive*: `--nav-h` is 60px (72px elsewhere), the
  navbar always shows, and there is no footer. Size full-height views with
  `calc(100dvh - var(--nav-h))`.
- The viewer syncs `?p=` with `history.replaceState` (no router navigation per
  page turn), so `useLocation().search` inside it can lag `window.location`.
- `.shell` has `overflow-x: clip`: nothing can cause horizontal page scroll,
  and sticky/fixed UI is unaffected.

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

Brochure kit (`import { … } from '../../components/brochure/index.js'`):

```jsx
<CoverArt style="torii" seed={5} theme={b.theme} animated title="…" />   // fills its box
<BrochurePage brochure={b} page={b.pages[i]} index={i} total={n}
              active      // replays the entrance + counters each time it turns true
              isStatic    // thumbnails/back faces: no motion, nothing focusable
              onCta={…} />// contact-page button (inert when absent)
<BrochureCard brochure={b} index={i} variant="grid|list|feature" layout />
```

Pages are fixed layouts measured in `cqw`; the host gives them a width and
adds radius/shadow. Page headings are h2/h3, so the host provides the h1.
Keep host selectors class-only around pages (`.x h2 {}` would override them).

Shell helpers:

```js
const { open, close, toggle, isOpen } = usePalette();  // components/layout/palette.js (⌘K is bound once)
const navHidden = useNavHidden();                      // components/layout/navState.js — navbar tucked away?
import { fold, foldQuery, createSearchIndex, search, highlight } from '../../components/layout/search.js';
import { matchesHotkey, modKeyLabel } from '../../hooks/useHotkey.js';     // '+' and 'mod++' mean the plus key
```

Text search everywhere (palette and Library) folds case, Latin diacritics,
full/half width and katakana→hiragana through `search.js`, so a query matches
the same way in both.

## Layers

| z-index | What |
| --- | --- |
| `--z-grain` 1000 | film grain (pointer-events: none) |
| `--z-toast` + 1 | skip link |
| `--z-toast` 100 | toasts (rendered into the fullscreen element while one is active) |
| `--z-toast` − 1 | Studio publish stamp |
| `--z-modal` + 2 | Studio popovers (inside modals) |
| `--z-modal` 90 | Modal, Drawer, command palette |
| `--z-nav` + 2 | viewer "More" menu |
| `--z-nav` 50 | navbar |
| `--z-nav` − 1 | route-transition curtain |
| `--z-nav` − 2 | sticky page toolbars: Library filter bar, viewer toolbar, Studio phone dock |
| `--z-nav` − 3 | viewer page overview |
| `--z-raised` 10 | IconButton tooltips, local raises |

Anything with a larger local z-index (the flipbook's spine and dog-ears)
lives inside an `isolation: isolate` container.

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
- Storage keys (all via `lib/storage.js`, prefix `tabi:`): `theme`,
  `brochures`, `favorites`, `recent` (BrochureContext, synced across tabs),
  `studio-draft`, `studio-edit:<id>`, `inquiries`, `newsletter`.
