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
npm run lint      # also lints scripts/*.mjs
npm run photos:fetch | photos:candidates | photos:import   # scripts/photos (see README "Real photos")
npm run geo:build                                         # scripts/geo → src/data/geo/japan.js
```

Bundling (`vite.config.js`): an entry chunk (shell, contexts, built-in data,
the stored-brochure normaliser), two long-lived vendor chunks — `react` (react,
react-dom, router) and `motion` (framer-motion) — and one lazy chunk per route.
The command palette panel (`PalettePanel.jsx` with its search index) is a lazy
chunk prefetched when the browser is idle. Code several routes share gets its
own lazy chunk: `cover-art`, `Icon` (the named lucide registry), `BrochurePage`,
`BrochureCard`, and small ones Rollup names after a module inside them
(`progress`, `pageMeta`, `Switch`). The photo registry (`data/photos`, with
the manifests and `photos.generated.json`) and `<Photo>` share a `Photo`
chunk (cards, pages and the Studio's photo fields all import it); the
Studio's photo picker (`PhotoPicker`) and coordinate preview
(`CoordsPreview`) are lazy chunks of their own; the map (`JapanMap` + `data/geo/japan.js`,
~46 KB of paths) is its own chunk, loaded through `blocks/LazyJapanMap.jsx`
(`React.lazy`) only when a place or map page is drawn. The `tabi-photo-manifests` plugin in `vite.config.js`
strips the curation-only `candidates`/`file` fields from manifests before
they are bundled. Keep route-only code out of the entry: a
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
                           lookup.js (prototype-free id tables), sanitize.js (stored-brochure normaliser:
                           also safeUrl, toLat/toLng, normalizePage), kana.js (hiragana readings for search)
  data/photos/             photo registry: index.js (getPhoto, resolvePhoto, listPhotos, creditsFor, photoIdsIn),
                           registry.js (pure merge of manifests + generated records; "user:<key>" uploads
                           from brochure.userPhotos, safeImageSrc), manifest/<brochure>.json
                           (researchers), photos.generated.json (written by scripts/photos/fetch.mjs)
  data/geo/                japan.js (GENERATED by scripts/geo/build-japan.mjs: viewBox, prefectures, insets,
                           lakes, graticule, regionCenters, project()), projection.js (Lambert conic maths)
  components/ui/           design-system primitives (see below)
  components/layout/       AppShell, Navbar, Footer, RouteTransition, CommandPalette
                           (lazy PalettePanel), search.js (shared text folding),
                           navState.js (navbar visibility), japanTime.js,
                           ErrorBoundary + RouteErrorBoundary/RouteError (chunkError.js),
                           AppearanceSwitch (light / dark / auto, in the footer)
  components/brochure/     CoverArt (+ art/: PRNG, colour, 10 pattern generators),
                           BrochurePage (+ blocks/: one block per page type; fit.js + useFit.js: copy
                           fitting), BrochureCard (factsChecked.js: "Oct 2026" for the cover's obi)
  components/photo/        Photo: srcset/sizes, LQIP + dominant colour, fade-in, credit chip/caption,
                           fallback (the brochure's CoverArt) when a photo is unknown, not downloaded or broken;
                           PhotoCredit (the credit line, placeable anywhere); photoContext.js (PhotoContext,
                           usePhotoRecord: resolve ids in the brochure being drawn)
  components/map/          JapanMap (prefectures, coast, Okinawa & Amami inset, pins, interactive regions,
                           key map, "locator" variant), mapLayout.js (pure: projectPins, fitView,
                           layoutMarkers, placeLabels, mapSummary, pathBounds)
  components/viewer/       flipbook + reader UI (pure maths in spreads/flipMath/layout.js); TripPlanner
                           ("Plan this trip", tripPlan.js), links.js (a brochure's sources and official
                           sites, http(s) only, de-duplicated, with hosts);
                           the reader's key map and visibility rules are pages/Viewer/readerKeys.js
  components/studio/       brochure editor UI (studioReducer, templates, palettes, publishCheck…).
                           Spread previews use viewer/spreads.js, so proofs pair pages as the
                           reader does. ⌘Z in the editor's fields uses the Studio history; a field
                           holding text not yet in the document opts out with [data-native-undo].
                           Real-place fields: fieldChecks.js (coords in the map's frames, pasted pairs,
                           https links), geoLookup.js (prefecture a pin lands in; lazy CoordsPreview),
                           photoLibrary.js + fields/PhotoPicker (lazy chunk) for library photos and
                           uploads, photoUpload.js (downscale, budget, sanitizeUserPhotos)
  pages/<Page>/            route components and their sections (Viewer/aboutFacts.js: fact-check wording,
                           the About plate photo; Credits/credits.js: credit groups, totals, licences)
  dev/                     playground.html workbench (dev server only, not built): every page of every
                           brochure at reader and thumbnail size on light or dark paper; audit.js finds
                           clipped, cut-off or off-page text (?section=reader&audit=1, window.__tabiAudit())
  test/setup.js            jsdom polyfills (skipped in `// @vitest-environment node` suites)
scripts/photos/            fetch.mjs, candidates.mjs, import-local.mjs; lib.mjs (pure, tested with Commons
                           API fixtures in fixtures/), process.mjs (sharp: WebP widths, LQIP, colour), io.mjs
scripts/geo/               build-japan.mjs (Natural Earth admin-1 + lakes → mapshaper → japan.js)
public/photos/             <id>-<480|960|1600>.webp, committed with photos.generated.json
.cache/                    gitignored: Natural Earth downloads, candidate contact sheets
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
| `#/credits` | Credits & sources (奥付): every photo credit grouped by Home and brochure (licence links, photos still to download), the fact checks with links to `docs/REAL_CONTENT.md` and `docs/research/<slug>.md` (Vite copies them into the build as `?url&no-inline` assets), the Natural Earth map data and the fonts |
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
- Opening the trip planner from fullscreen waits for the exit
  (`useFullscreen().exit()`), since everything outside the fullscreen
  element is inert until then.

Hash routing means **`href="#section"` anchors would change the route**. For
in-page jumps call `element.scrollIntoView({ behavior: 'smooth' })`.

## Data contract

See `src/data/schema.js` (JSDoc) — the single source of truth. A brochure has
`id, slug, title, titleJp, subtitle, category, region, seasons[], organization,
summary, tags[], format, updatedAt, readMinutes, featured, source, theme,
cover, pages[]`, plus `location`, `sources` and `factsChecked` for built-ins.
Pages are `{ id, type, ...fields }` with types `cover, intro, features,
gallery, place, map, stats, agenda, pricing, phrases, quote, contact, back`.
`PAGE_TYPES[type].create()` returns placeholder content for a new page, and
`PAGE_TYPES[type].jp` is its Japanese section name (はじめに, お問い合わせ…),
the one the page margin, the Studio and the reader's overview all show.
`ART_STYLES` lists the generative cover-art motifs.

User-made content can have empty or missing fields: renderers must never
crash on them. Brochures and Studio drafts read back from storage go through
`data/sanitize.js` first: pages without a string id or a known type are
skipped, fields of the wrong type are reset, and a valid record comes back
unchanged (copy-on-write, same key order). Links in brochure data
(`place.website`, `contact.ctaUrl`, `details[].url`, `sources[].url`) must be
absolute http(s) — `safeUrl()` turns anything else (javascript:, data:,
relative) into ''; renderers call it again before making a link, which opens
in a new tab with `rel="noopener noreferrer"`. Coordinates must be finite
(lat −90…90, lng −180…180) or they are removed; photo ids are strings.
JSON imports (`studio/brochureIO.js`) apply the same rules (`normalizePage`).

Real places, facts and photos follow `docs/REAL_CONTENT.md`.

**User photos (the Studio's uploads).** A brochure can carry its own photos:

```js
brochure.userPhotos = {
  [key]: {                       // key: any string; pages refer to it as "user:<key>"
    src,                         // data:image/(png|jpeg|webp|gif|avif);base64,… or a blob: URL — nothing else
    alt,                         // what the photo shows ('' = decorative)
    caption?, focus?,            // optional, like a manifest entry ("50% 40%")
    width, height,               // pixels of `src`
    credit: { author, license, licenseUrl?, sourceUrl? },   // links http(s) only
  },
};
page.photo = 'user:abc';         // also items[].photo and cover.photo
```

`resolvePhoto(id, brochure)` (data/photos) answers both kinds of id with the
same record shape (`user: true`, one `src`, no srcset); hotlinks (http(s)),
SVG and anything else are `available: false`, so the art fallback shows.
`<BrochurePage>` provides its brochure through `PhotoContext`, so every block's
`<Photo id="user:…">` finds the upload; outside a page pass `brochure` to
`<Photo>`. `creditsFor(brochure)` lists uploads that name an author or licence
(`user: true`), and the back page prints them with the rest. Blob URLs only
live as long as the tab: store data: URLs in saved brochures. Large data: URLs
count against the `localStorage` quota — downscale before storing (the Studio
stores JPEG ≤ 1600 px at quality 0.82, ≤ 1.2 M characters each, 24 photos and
3 M characters per brochure; JSON imports keep only inline JPEG/PNG/WebP within
those caps — `studio/photoUpload.js`). Data flow for
photos: manifest (`data/photos/manifest/<brochure>.json`: what a photo shows)
→ `npm run photos:fetch` (Commons API, licence/size policy, sharp) →
`public/photos/*.webp` + `photos.generated.json` (size, LQIP, colour,
credit) → `getPhoto(id)` merges both → `<Photo id>` renders it, or its
`fallback` while `available` is false. Photo URLs are relative
(`photos/<id>-<w>.webp`), like every asset (base `./`). Id tables (`CATEGORY_MAP`, `REGION_MAP`, `SEASON_MAP`,
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
              onCta={…} />// contact page without a ctaUrl: its call to action becomes a button
                          // (with neither, the line is plain text — never a button that does nothing)
<BrochureCard brochure={b} index={i} variant="grid|list|feature" layout />
                          // cover photo (art fallback); "Facts checked Oct 2026" on the obi
                          // only when b.factsChecked is set
```

Page text is never clipped: blocks mark the copy regions that take up the
slack with `data-fit` and size their type `calc(<size> * var(--fit, 1))`;
after layout (and again once web fonts load, or the page changes width)
`BrochurePage` bisects each region's `--fit` (floor 0.6, or `data-fit-min`)
until nothing overflows (`blocks/fit.js`). Regions are measured vertically;
`data-fit="both"` adds the width (multi-column copy). Inside a region, rows
must not shrink below their text (`flex: 1 0 auto`, `minmax(auto, 1fr)`) and
nothing may clip with `overflow: hidden`, or the overflow is invisible to the
measurement. Credits wrap instead of being cut. Check with the playground's
audit (`/playground.html?section=reader&audit=1`).

Real-place pages: **cover** — full-bleed photo, scrims in `--b-shade`, type in
`--b-light` (the darker/lighter of paper and ink, so dark themes work),
vertical `titleJp` with the place's coordinates, a filled seal and the credit
along the foot. **place** — photo bleeding to both trims with the Japanese
name on a vertical slip (two columns when it breaks at a space or ・) and a
`<JapanMap variant="locator">`; facts and the official site beside the copy.
**map** — plate zoomed to city scale (`minSpan`) with a key map. **gallery** —
layouts by count (1–4) on a subgrid, captions with credits. **quote** —
`quoteJp` vertical (spaces break columns), `quote` split into verse lines at
" / ". **pricing** — a price list with dotted leaders. **contact** — ruled list
of official links. **back** — colophon with facts-checked date and source
count, and every photo's credit (`creditsFor`).

Photos and the map (`components/photo/Photo.jsx`, `components/map/JapanMap.jsx`):

```jsx
<Photo id="kyoto-senbon-torii" sizes="(min-width: 900px) 50vw, 100vw" priority? fit="cover|contain"
       focus="50% 40%" credit="none|overlay|caption" creditLinks={!isStatic}
       brochure={b}?                                     // where "user:<key>" ids resolve; defaults to
                                                         // the PhotoContext every BrochurePage provides
       fallback={<CoverArt …/>} rounded? kenBurns? />     // fills its box; host CSS vars:
                                                         // --photo-credit-size, --photo-chip-left/right/top/bottom
<PhotoCredit credit={photo.credit | creditsFor(b)[i]} links={!isStatic} label="Photo:" />
const record = usePhotoRecord(id);                      // resolved in the current PhotoContext, or null
// `sizes` is only the first guess: the frame measures itself (ResizeObserver) and asks
// for the width the picture is drawn at (cover-cropped photos are wider than their box).
<JapanMap pins={[{ id, lat, lng, label, labelJp }]} focus="pins|japan" aspect={1.3}
          highlightedRegion="kansai" fillByRegion? regionLabels?
          minSpan={0.016}? overview? variant="atlas|locator"
          onRegionEnter={(id|null) => …} onRegionClick={(id) => …} />  // colours: --map-* ← --b-* ← tokens
import { getPhoto, resolvePhoto, listPhotos, creditsFor, photoIdsIn } from '../../data/photos/index.js';
import { project, prefectures, insets, viewBox } from '../../data/geo/japan.js';
// Both only from code that is already lazy (the brochure renderer, a route): never from the entry.
```

Pins are numbered by their position in `pins` (so a list beside the map can
use the same numbers); pins close together fan out on a ring with leader
lines; labels that do not fit are dropped (the number stays). The static map
is one `role="img"` with a summary; with region handlers, regions become
`role="button"` groups (Enter/Space, hover/focus).

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
- Facts about Japan must be real and conservative. Built-in brochures follow
  `docs/REAL_CONTENT.md`: real places, facts checked against official sources,
  credited free-licence photos, published by "Tabi Guides" (the app's own
  imprint), no phone numbers. Studio templates use real places (with
  coordinates and library photos) and real quotes, but every story, hour,
  price and link is placeholder copy: no businesses, people, prices or
  contact details (`templates.test.js`).
- Photos are never hotlinked or typed in by hand: only the scripts write
  `public/photos/` and `photos.generated.json`. Never commit placeholder or
  "test" images there.
- Storage keys (all via `lib/storage.js`, prefix `tabi:`): `theme`
  (ThemeContext, synced across tabs), `brochures`, `favorites`, `recent`
  (BrochureContext, synced across tabs), `progress` (`{ [brochureId]: page }`,
  written by the reader, read by "Continue reading" — `lib/progress.js`),
  `studio-draft`, `studio-edit:<id>`, `trips` (the viewer's private trip
  planner, `components/viewer/tripPlan.js`; nothing is sent anywhere — the
  old `inquiries` records are migrated once, without name or email, and
  removed), `motion`
  (`'auto' | 'paused'`, the Home hero's "Pause motion" control —
  `pages/Home/homeMotion.js`; ambient Home loops check `useStill()`).
  Per-tab keys live in sessionStorage: `tabi:library-search`, the
  Library's last query, which the reader's "Library" link returns to
  (`lib/librarySearch.js`), and `tabi:chunk-reload`, the time of the last
  automatic reload after a failed chunk (`components/layout/chunkError.js`).
