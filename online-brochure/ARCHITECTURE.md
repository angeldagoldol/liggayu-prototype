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
  use each brochure's own `theme` colours. Text fields and selects take
  `--control-border` (3:1 against the paper), not `--line-strong`; small
  accent text on a page uses `--b-accent-text` (`--b-accent-on-soft` on the
  `--b-soft` tint), raw `--b-accent` only for rules, dots and type ≥24px.
- **Type.** `--font-display` ('Tabi Macrons' → Fraunces → Shippori Mincho for
  kanji) for headlines — 'Tabi Macrons' (base.css) is Fraunces' latin-ext file
  limited to ā ē ī ō ū, so "Tōhoku" keeps its macron on the letter; h1–h6 and
  `.display` open their word gaps (`--word-space-heading/-display`) because
  Fraunces' space is narrow at opsz 144 — `--font-sans` (Geist → Zen Kaku Gothic New) for UI and body,
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

Bundling (`vite.config.js`): an entry chunk (shell, contexts, built-in data,
the stored-brochure normaliser), two long-lived vendor chunks — `react` (react,
react-dom, router) and `motion` (framer-motion) — and one lazy chunk per route.
The command palette panel (`PalettePanel.jsx` with its search index) is a lazy
chunk prefetched when the browser is idle. Code several routes share gets its
own lazy chunk: `cover-art`, `Icon` (the named lucide registry), `BrochurePage`,
`BrochureCard`, and small ones Rollup names after a module inside them
(`progress`, `pageMeta`, `Switch`). Keep route-only code out of the entry: a
top-level call such as `Object.assign(…)` counts as a side effect, so Rollup
keeps the whole module in the first chunk that imports it — even through the
`components/ui` barrel. Build prototype-free tables with `dict()`/`byId()`
from `data/lookup.js`, which are marked `@__NO_SIDE_EFFECTS__`.

## Folder layout

```
src/
  main.jsx                 providers: MotionConfig → Theme → Toast → Brochure
  App.jsx                  routes (lazy-loaded pages), last-resort error boundary
  styles/tokens.css        design tokens (colours, type, space, shadow, motion, z)
  styles/base.css          reset, typography, .container .eyebrow .display .jp .sr-only .grain
  lib/                     motion.js, cn.js, id.js, storage.js, format.js (also isEmail,
                           sealChars: the two seal characters of a Japanese title),
                           librarySearch.js (the Library view the reader returns to),
                           progress.js (page to resume each brochure at) (+ tests)
  hooks/                   useMediaQuery, useHotkey, useLockBodyScroll, useFocusTrap,
                           useClipboard, useDocumentTitle, useMinuteClock (the clocks' tick) (+ tests)
  context/                 ThemeContext, ToastContext, BrochureContext (+ tests)
  data/                    schema.js, brochures.js, categories.js, regions.js, seasons.js,
                           lookup.js (prototype-free id tables), sanitize.js (stored-brochure normaliser),
                           kana.js (hiragana readings for search)
  components/ui/           design-system primitives (see below)
  components/layout/       AppShell, Navbar, Footer, RouteTransition, CommandPalette
                           (lazy PalettePanel), search.js (shared text folding),
                           navState.js (navbar visibility), japanTime.js,
                           ErrorBoundary + RouteErrorBoundary/RouteError (chunkError.js),
                           AppearanceSwitch (light / dark / auto, in the footer)
  components/brochure/     CoverArt (+ art/: PRNG, colour, 10 pattern generators),
                           BrochurePage (+ blocks/: one block per page type), BrochureCard
  components/viewer/       flipbook + reader UI (pure maths in spreads/flipMath/layout.js);
                           the reader's key map and visibility rules are pages/Viewer/readerKeys.js
  components/studio/       brochure editor UI (studioReducer, templates, palettes, publishCheck…).
                           Spread previews use viewer/spreads.js, so proofs pair pages as the
                           reader does. ⌘Z in the editor's fields uses the Studio history; a field
                           holding text not yet in the document opts out with [data-native-undo]
  pages/<Page>/            route components and their sections
  dev/                     playground.html workbench (dev server only, not built)
  test/setup.js            jsdom polyfills
```

## Routes

| Path | Page |
| --- | --- |
| `#/` | Home |
| `#/brochures` | Library — `q` (text), `category`, `season` (comma list, matches ANY), `region`, `fav=1`, `sort` (`featured\|newest\|az\|quickest`), `view=list`. Unknown values are dropped. |
| `#/brochures/:slug` | Viewer — `p` = 0-based page index (clamped, and the address bar is rewritten to the page shown; `p=0` is omitted). A slug in another letter case still opens and is corrected in place. |
| `#/studio` | Studio start screen: templates, blank, remix |
| `#/studio?draft=1` | Studio editor on the working draft (autosaved to `tabi:studio-draft`) |
| `#/studio?from=<slug>` | Remix any brochure into a fresh draft (asks before replacing an unpublished one), then replaces the URL with `?draft=1` |
| `#/studio/:id` | Studio, edit a user brochure (built-ins open read-only with a Remix button) |
| anything else | NotFound (迷子) |

Shell behaviour every page can rely on (`components/layout/AppShell.jsx`):

- Route changes play the curtain transition when the **pathname** changes;
  query-string changes never do. A navigation with
  `state: { shellTransition: false }` keeps the page mounted (the viewer uses
  it to correct a slug's letter case in place).
- Each route renders inside its own error boundary (`RouteErrorBoundary`): a
  page that throws, or whose lazy chunk can't be downloaded, shows
  `<RouteError>` ("This page tore") while the navbar, footer and palette keep
  working, and navigating away clears it. A failed chunk (usually a tab left
  open across a deploy) first reloads the page once on its own; the
  sessionStorage stamp `tabi:chunk-reload` stops a second reload within 30 s,
  and nothing reloads while offline. `App.jsx` has a last-resort boundary
  for the shell itself, and a palette panel that fails closes with a toast.
- On tool routes (the reader, `/studio?draft=1`, `/studio/:id`) the navbar is
  full-bleed and shares `--tool-gutter` with the tool bar below it; the
  "Create a brochure" button is hidden anywhere in the Studio.
- After a transition the shell scrolls to the top and focuses `<main>`.
- `/brochures/:slug` is *immersive*: `--nav-h` is 60px (72px elsewhere), the
  navbar always shows, and there is no footer. Size full-height views with
  `calc(100dvh - var(--nav-h))`.
- The viewer syncs `?p=` with `history.replaceState` (no router navigation per
  page turn), so `useLocation().search` inside it can lag `window.location`.
  Code that runs while its route animates out must not write the URL: the
  router already holds the next one (`useIsPresent()` is false then).
- Each page is pinned to the location it was rendered at (AppShell re-provides
  React Router's location context per `RoutePage`), so `useLocation` and
  `useSearchParams` in a page that is animating out still read *its* URL.
  Without this the outgoing page re-renders for the next URL — the Library
  losing its `?q=` remounted "Your brochures" mid-exit and left the curtain
  covering the screen.
- `.shell` has `overflow-x: clip`: nothing can cause horizontal page scroll,
  and sticky/fixed UI is unaffected.

The reader (`pages/Viewer/Reader.jsx`):

- Fit: the book is as large as the stage allows, with a vertical margin of
  ~6% of the stage height (what a turning leaf needs not to clip). Below
  `READABLE_PAGE_WIDTH` (300px, `viewer/layout.js`) pages stop shrinking: on
  a short stage (browser zoom, a small window) the book keeps that width and
  the stage scrolls instead. In-app zoom goes 100–400% (`ZOOM_LEVELS`).
- From 760px the bottom bar is only the scrubber; the thumbnail filmstrip is
  a dock that rises over the foot of the stage while the bar is hovered,
  focused or scrubbed (the stage never resizes), and stands in for the
  scrubber's preview bubble. Phones keep the strip in the bar.
- Keys (`readerKeys.js`): ←/→ turn and + − 0 zoom (characters, so any
  keyboard layout) while the reader is mostly on screen; PageUp/PageDown/
  Home/End turn only with focus in the reader or on the page itself, and
  scroll the document otherwise. Menus over the reader keep their own keys.
- Opening the inquiry drawer from fullscreen waits for the exit
  (`useFullscreen().exit()`), since everything outside the fullscreen
  element is inert until then.

Hash routing means **`href="#section"` anchors would change the route**. For
in-page jumps call `element.scrollIntoView({ behavior: 'smooth' })`.

## Data contract

See `src/data/schema.js` (JSDoc) — the single source of truth. A brochure has
`id, slug, title, titleJp, subtitle, category, region, seasons[], organization,
summary, tags[], format, updatedAt, readMinutes, featured, source, theme,
cover, pages[]`. Pages are `{ id, type, ...fields }` with types `cover, intro,
features, gallery, stats, agenda, pricing, phrases, quote, contact, back`.
`PAGE_TYPES[type].create()` returns placeholder content for a new page, and
`PAGE_TYPES[type].jp` is its Japanese section name (はじめに, お問い合わせ…),
the one the page margin, the Studio and the reader's overview all show.
`ART_STYLES` lists the generative cover-art motifs.

User-made content can have empty or missing fields: renderers must never
crash on them. Brochures and Studio drafts read back from storage go through
`data/sanitize.js` first: pages without a string id or a known type are
skipped, fields of the wrong type are reset, and a valid record comes back
unchanged. Id tables (`CATEGORY_MAP`, `REGION_MAP`, `SEASON_MAP`,
`PAGE_TYPES`, `ART_LABELS`, `BLOCKS`, `ICONS`, `SECTION_JP/EN`) have no
prototype (`data/lookup.js`), so `MAP[userValue]` never finds `constructor`
or `__proto__`; use `hasKey(MAP, id)` to validate an id.

Built-in brochures carry `titleKana`, the hiragana reading of `titleJp`, and
regions, categories and seasons have `kana`: `data/kana.js` joins them into a
hidden search field, so きょうと finds 京都 (a remix's copied `titleKana` is
ignored, since `source: 'user'` titles can change).

Slugs keep every script (`slugify('京都の秋')` → `京都の秋`; Latin accents and
widths are folded), so links must go through the router (it percent-encodes
them). `estimateReadMinutes` reads Japanese by the character.

## Shared APIs

```js
const { theme, preference, setPreference, toggle } = useTheme();
// preference 'light' | 'dark' | 'system'; toggle() picks light or dark, setPreference('system')
// goes back to the OS (footer AppearanceSwitch, ⌘K "Match system appearance"). Synced across tabs.
const toast = useToast(); toast({ title, description, tone: 'success' | 'error' | 'default', action: { label, onClick }, duration });
// duration defaults to 4200 ms, or 10000 ms with an action (0 = sticky); hovering or
// focusing a toast pauses its clock, so its action can always be reached. Screen readers
// hear it once, from a polite (or, for errors, assertive) announcer; the visible stack is
// not a live region, so don't add another live region for the same event (PublishStamp is aria-hidden).
const {
  brochures, builtins, userBrochures, favoriteIds, recentIds,
  getBySlug, getById, saveBrochure, deleteBrochure, toggleFavorite, isFavorite, markViewed,
} = useBrochures();
// saveBrochure(draft) → the saved copy, or null when storage refused the write
// (full quota): nothing changes then, so keep the draft and tell the user.
// deleteBrochure(id) → true, or false when storage refused.
```

UI kit (`import { … } from '../../components/ui'`):
`Button` (variant primary|accent|secondary|ghost, size sm|md|lg, `to`/`href`,
iconLeft/iconRight, loading, block) · `IconButton` (label required, tooltip) ·
`Chip` · `Badge` · `Field` + `Input`/`Textarea`/`Select` · `Switch` ·
`Modal`/`Drawer` (focus trap, Esc, scroll lock; portalled, so their header and footer are
divs, never `<header>`/`<footer>` landmarks) · `Kbd` · `Skeleton` ·
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
the same way in both. Both also index the hiragana readings from
`data/kana.js`, so a reading typed with an IME finds the kanji title.

In the Library, filters push a history entry; a search pushes one for its
first query and then replaces it while typing, so Back steps out of a search
to the view before it.

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
- Storage keys (all via `lib/storage.js`, prefix `tabi:`): `theme`
  (ThemeContext, synced across tabs), `brochures`, `favorites`, `recent`
  (BrochureContext, synced across tabs), `progress` (`{ [brochureId]: page }`,
  written by the reader, read by "Continue reading" — `lib/progress.js`),
  `studio-draft`, `studio-edit:<id>`, `inquiries`, `newsletter`, `motion`
  (`'auto' | 'paused'`, the Home hero's "Pause motion" control —
  `pages/Home/homeMotion.js`; ambient Home loops check `useStill()`).
  Per-tab keys live in sessionStorage: `tabi:library-search`, the
  Library's last query, which the reader's "Library" link returns to
  (`lib/librarySearch.js`), and `tabi:chunk-reload`, the time of the last
  automatic reload after a failed chunk (`components/layout/chunkError.js`).
