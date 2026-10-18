# Tabi 旅 — Japan, folded into pages

**Tabi** (旅, "journey") is an online brochure system about Japan. Visitors
browse a library of interactive travel brochures (Kyoto, Tokyo, Hokkaidō,
Okinawa, Osaka, Hakone, Naoshima, Hiroshima, Tōhoku, the Japan Alps), read
them in a flipbook with real 3D page-turns, and design their own Japan
brochure in the Studio. It is a static single-page app: no server, no
account. Everything a visitor makes is stored in their own browser.

## Feature tour

| Route | What you get |
| --- | --- |
| `#/` **Home** | A 3D tri-fold hero of real photographs (Fuji, Fushimi Inari, Shibuya; credited) that unfolds and follows the pointer, a live Tokyo clock, a bilingual word marquee, a featured-brochure carousel, the four seasons with a photograph each (opening on the current season in Japan), the eight regions on the accurate map of Japan (keyboard-navigable, a photo card per region), "how it works" sketches, Japan in numbers, five classic haiku as postcards (original, romaji, our translation) and a Studio call to action. Facts are logged in `docs/research/home.md`. |
| `#/brochures` **Library** | Search in English or Japanese (accent-, width- and kana-insensitive: `tohoku`, `ＫＹＯＴＯ` and `きょうと` all work), multi-season toggles, region, category, favourites, four sorts, and grid or list views. Every filter lives in the URL, so views are shareable and Back steps through them. Also shelves for your own brochures and recently viewed ones, where "Continue reading" reopens the page you left off on. |
| `#/brochures/:slug` **Viewer** | A flipbook with spreads on wide screens and single pages on phones: drag a corner, click or tap a page edge, swipe, or use ← → / PageUp / PageDown / Home / End. Also a scrubber with a thumbnail filmstrip that rises on hover or focus, an all-pages overview, zoom (100–400%) with pan, fullscreen, print to A4 (one page per sheet), share/deep link (`?p=` is the page index), favourites, a private "Plan this trip" planner kept on your device (dates, travellers, interests, notes, copy as text, the official sites to check; nothing is sent), "About this brochure" with a full-bleed photograph, the fact-check date, numbered sources and every photo credit, and "More like this". |
| `#/credits` **Credits** | 奥付: every photograph's credit grouped by where it appears (author, licence, source, plus the photos still to download), how the facts are checked with links to the standard and each brochure's research log, the Natural Earth map data, the typefaces and the rest. |
| `#/studio` **Studio** | Start from five Japan templates, a blank brochure or a remix of any library brochure (`?from=<slug>`). Edit every page with a live preview — places with coordinates checked against the map of Japan, a live map of your pins, sources and a facts-checked date — choose real photos from the library or upload your own (resized in the browser, with alt text and credit), change palette, colours (with contrast warnings and auto-fix), typeface and generative cover art, and reorder pages by drag or keyboard. Undo/redo, autosave, JSON import/export, then publish (a hanko stamp) to your shelf. `#/studio/:id` edits a published brochure. |
| **⌘K / Ctrl K** | The command palette searches brochures, the places inside them (opening the brochure at that page), seasons, library filters, the Credits page and actions from anywhere. |
| `#/anything-else` | A 404 page ("迷子 — maigo, lost") with a suggested brochure. |

Light ("washi") and dark ("sumi ink") themes follow the system and can be
toggled; the footer's Washi / Sumi / Auto switch goes back to following the
system, and the choice syncs across open tabs. All motion respects
`prefers-reduced-motion`. A page that fails to load shows a "This page tore"
screen with Reload, while the rest of the app keeps working.

## Tech stack

- **React 19** with **React Router 7** (hash routing, route-level code splitting)
- **framer-motion 12** for springs, gestures, layout and presence animations
- **lucide-react** icons (only a named registry of about 110 icons is bundled)
- **Vite 7**, plain CSS: design tokens in `src/styles/`, CSS Modules next to each component
- **Vitest** + Testing Library (jsdom) and **ESLint 9** with the React Hooks rules

## Getting started

Requires Node 20.19+ or 22.12+ (Vite 7).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
npm run preview    # serve dist/ on http://localhost:4173
npm test           # vitest run (unit, component and route smoke tests)
npm run test:watch
npm run lint       # eslint .

npm run photos:fetch       # download + credit the brochure photos from Wikimedia Commons
npm run photos:candidates  # contact sheets of every candidate, for curation
npm run photos:import      # add a photo you own or licensed (fallback)
npm run geo:build          # rebuild the map of Japan from Natural Earth
```

`/playground.html` (dev server only, never built) is a workbench for the
brochure kit: every cover-art style, every page of every brochure at reader
and thumbnail size (on its own paper or dark paper), empty-field pages, theme
crops, the map of Japan, `<Photo>` states (with a test card drawn at runtime,
also as an uploaded `user:` photo), the place/map/quote pages and a layout
audit that lists any clipped or cut-off text. Query parameters:
`section=art|reader|pages|audit|large|empty|map|photo|real`, `rb=<slug>|all`,
`w=340|460|640` (reader page width), `paper=dark`, `audit=1`, `style`,
`seeds=1,2,3`, `b=<slug>`, `crop=native|3:4|1:1`, `animate=1`.

## Project structure

```
index.html                 app shell, fonts, no-flash theme script
playground.html            dev-only kit workbench (src/dev/)
src/
  main.jsx                 providers: MotionConfig → Theme → Toast → Brochure
  App.jsx                  routes (lazy pages inside <AppShell>)
  styles/                  tokens.css (colour, type, space, motion, z-index), base.css
  lib/                     motion presets, cn, ids/slugs, storage, formatting
  hooks/                   useHotkey, useFocusTrap, useLockBodyScroll, useMediaQuery…
  context/                 ThemeContext, ToastContext, BrochureContext
  data/                    schema.js (the data contract), brochures.js, categories, regions, seasons
    photos/                photo registry: manifest/<brochure>.json + photos.generated.json
    geo/                   japan.js (generated prefecture outlines) + projection.js
  components/
    ui/                    design-system primitives (Button, IconButton, Modal/Drawer, Hanko…)
    layout/                AppShell, Navbar, Footer, command palette, route transition, search
    brochure/              CoverArt (generative art in art/), BrochurePage (+ blocks/), BrochureCard
    photo/                 <Photo>: responsive, credited photographs with an art fallback
    map/                   <JapanMap>: the 47 prefectures, an Okinawa inset, numbered pins
    viewer/                Flipbook, reader toolbar, scrubber, thumbnails, overview, print, trip planner
    studio/                editor reducer, panels, fields, preview, publish checks, import/export
  pages/                   Home, Library, Viewer, Studio, Credits, NotFound (route components + sections)
  dev/                     the kit playground
  test/setup.js            jsdom polyfills for Vitest
scripts/
  photos/                  fetch.mjs, candidates.mjs, import-local.mjs (+ lib.mjs, process.mjs, io.mjs)
  geo/build-japan.mjs      Natural Earth → src/data/geo/japan.js
public/photos/             resized photos, <id>-<480|960|1600>.webp (written by the scripts)
docs/REAL_CONTENT.md       the standard for real places, facts and photos
```

[`ARCHITECTURE.md`](./ARCHITECTURE.md) has the conventions, routes, shared
APIs and layering rules.

## Design notes

**Direction: Japanese print culture meets a modern editorial magazine.** Warm
unbleached washi paper, heavy sumi ink, vermilion seals, a fixed film grain
over everything, hairline keylines, crop marks, folios and generous *ma* (間,
negative space).

**Palette: wa-iro (和色), traditional Japanese colours.** Defined once in
`src/styles/tokens.css`. Components use only tokens; brochure pages use each
brochure's own theme.

| Token | Colour | |
| --- | --- | --- |
| `--wa-shu` | 朱 *shu* | vermilion: torii, seals |
| `--wa-beni` | 紅 *beni* | crimson |
| `--wa-ai` / `--wa-kon` | 藍 *ai* / 紺 *kon* | indigo dye / deep navy |
| `--wa-sora` | 空 *sora* | sky |
| `--wa-sakura` | 桜 *sakura* | cherry blossom |
| `--wa-momiji` | 紅葉 *momiji* | autumn maple |
| `--wa-matcha` | 抹茶 *matcha* | green tea |
| `--wa-kin` / `--wa-yamabuki` | 金 *kin* / 山吹 *yamabuki* | gold leaf / golden yellow |
| `--wa-fuji` | 藤 *fuji* | wisteria |
| `--wa-sumi` / `--wa-kinari` | 墨 *sumi* / 生成 *kinari* | ink / unbleached washi |

The UI accent `--accent` is a deep *shu* that reaches 4.5:1 as text on the
paper. Dark mode swaps paper and ink and uses a brighter vermilion.

**Typography.** *Fraunces* for display (with optical size and its "soft"
and "wonky" axes) falls back to *Shippori Mincho* for kanji and kana. *Geist*
→ *Zen Kaku Gothic New* is the UI and body face, and *Geist Mono* is used for
eyebrows, folios and numbers. Japanese text is always marked `lang="ja"`,
uses proportional `palt` spacing, and sets vertically (縦書き) where it acts
as a motif. A tiny "Tabi Macrons" face (Fraunces' latin-ext subset, restricted
to ā ē ī ō ū) comes first in `--font-display` so romanised names like
*Tōhoku* keep their macrons on top of the letter.

**Motion.** Motion explains what changed and never blocks. Expo-out easing is
used for UI, springs for physical things (pages, magnets), staggered reveals
for text, and a vermilion-and-sumi curtain with a 旅 seal between routes.
Animations use `transform` and `opacity` only, idle cover-art motion pauses
off-screen, and `prefers-reduced-motion` turns everything into fades or
static states (the flipbook becomes a cross-fade).

**Accessibility.**
- Semantics: landmarks, one `h1` per route, labelled controls and visible focus rings.
- Focus: focus moves to `<main>` after every route change. Modals, drawers, the palette and the mobile menu trap and restore focus.
- Keyboard: every gesture has a key, and the palette and region map are keyboard-first. The reader's keys switch off once it is scrolled out of view, so PageDown, Home and End scroll the rest of the page again.
- Zoom: brochure pages stop shrinking at a readable width (the stage scrolls instead), so 200% browser zoom makes their text larger, not smaller; the reader's own zoom goes to 400%.
- Live regions: result counts and the current page are announced through `aria-live`.
- Pausing: the Home hero's "Pause motion" button stops every looping animation on the page (marquee, petals, sketches, postcard autoplay) and is remembered; the OS reduced-motion setting turns them off outright.
- Static thumbnails are fully inert.
- Contrast: brochure themes are nudged to AA contrast automatically, so even user-made palettes stay legible.
- Layout: it works from 360px to 1920px+ with no horizontal scroll.

## Adding a brochure

Built-in brochures describe real places with verified facts and real,
credited photographs: follow [`docs/REAL_CONTENT.md`](./docs/REAL_CONTENT.md)
(sources, `factsChecked`, the 12–14 page outline, photo manifests).

1. Add a module in `src/data/brochures/` and list it in
   `src/data/brochures/index.js`. The shape is documented in `src/data/schema.js`:

   ```js
   {
     id: 'b_kanazawa-gold-leaf',          // unique, stable
     slug: 'kanazawa-gold-leaf',          // URL: #/brochures/kanazawa-gold-leaf
     title: 'Kanazawa: Gold Leaf & Gardens',
     titleJp: '金沢',                     // set vertically on the cover and card
     subtitle: '…', summary: '…', tags: ['kanazawa', 'gardens'],
     category: 'craft',                   // id from data/categories.js
     region: 'chubu',                     // id from data/regions.js
     seasons: ['autumn', 'winter'],       // ids from data/seasons.js
     organization: 'Tabi Guides',         // the app's own editorial imprint
     location: { name: 'Kenroku-en', nameJp: '兼六園', prefecture: 'Ishikawa', lat: 36.5621, lng: 136.6627 },
     sources: [{ label: 'Kenroku-en official site', url: 'https://…' }],  // official sources first, verified
     factsChecked: 'October 2026',
     format: 'booklet',                   // booklet | bifold | trifold
     updatedAt: '2026-10-01T09:00:00.000Z',
     readMinutes: 5,
     featured: false,
     source: 'builtin',
     theme: { paper: '#f6f1e6', ink: '#1f1a14', accent: '#b8862b', accent2: '#1d4f7a', muted: '#6b5e4e', typeface: 'serif' },
     cover: { art: 'kumo', seed: 7, photo: 'kanazawa-kenrokuen' },  // art = fallback; photo = registry id
     pages: [
       { id: 'p1', type: 'cover', eyebrow: '…', title: '…', subtitle: '…' },
       { id: 'p2', type: 'intro', kicker: '…', heading: '…', body: 'Paragraph one.\n\nParagraph two.', pullQuote: '…' },
       // features · gallery · stats · agenda · pricing · phrases · quote · contact
       { id: 'p11', type: 'back', title: '…', body: '…', tagline: '…' },
     ],
   }
   ```

2. Page types and their fields: `cover, intro, features, gallery, place, map,
   stats, agenda, pricing, phrases, quote, contact, back`.
   `PAGE_TYPES[type].create()` in `schema.js` returns a filled example of
   each. Start with a `cover`, end with a `back`. Icons are names from the
   registry in `src/components/ui/Icon.jsx`. Photos are ids from the photo
   registry (`photo: 'kanazawa-kenrokuen'`, see below).
3. Run `npm test`. `src/data/brochures.test.js` checks the schema, unique ids
   and slugs, cover/back placement, icon names, `.example` contact domains, no
   dialable phone numbers (Japan has no fictional number range) and palette
   contrast (ink ≥ 7:1, muted ≥ 4.5:1, accent ≥ 3:1 on the paper).
4. Look at it in `/playground.html?section=pages&b=<slug>` and in the viewer.

Renderers never crash on missing or empty fields, because user-made
brochures are often half-finished.

## Real photos

Photos come from **Wikimedia Commons** under free licences only — CC0,
public domain, CC BY, CC BY-SA (any version or port). NonCommercial,
NoDerivatives, "fair use" and unrecognised licences are rejected, and so are
images under 1600 px on the long edge. Nothing is hotlinked: each photo is
downloaded once and served from this site.

1. Researchers list candidates per brochure in
   `src/data/photos/manifest/<brochure>.json` — `id`, `use`, `candidates`
   (Commons file titles, best first), `alt`, `caption`, `place`, `focus` —
   and pages reference the id (`photo: 'kyoto-senbon-torii'`).
2. `npm run photos:candidates -- <brochure>` downloads every candidate as a
   preview and writes a contact sheet per photo to
   `.cache/photo-candidates/<brochure>/<id>.jpg` (gitignored), marked ✓/✗
   with size and licence. Record the winner as `"file"` in the manifest.
3. `npm run photos:fetch` takes each photo's `file` (or the first candidate
   that passes), downloads Commons' 1920 px thumbnail (a standard thumbnail
   step; other widths may be refused), writes WebP at 480/960/1600 px
   (quality 72, never upscaled) to `public/photos/`, and records size, a
   24 px blurred preview (LQIP), the dominant colour, the work's title,
   author (the attribution the author asked for, when Commons has one),
   licence + deed URL and source page in
   `src/data/photos/photos.generated.json`. API requests go one at a time,
   follow `continue`, and the registry file is written atomically after each
   photo (a damaged file stops the run instead of being overwritten). It is cached:
   photos already fetched are skipped unless `--force`. Other flags:
   `--only <brochure|photo-id>`, `--dry-run` (check, write nothing),
   `--list-candidates` (print the Commons links, offline), `--prune` (drop
   photos no manifest lists). Wikimedia asks for a contact in the
   User-Agent: set `PHOTOS_CONTACT` (a URL or e-mail) when you run it. Behind
   an HTTPS proxy, Node's `fetch` needs `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21).
4. Commit `public/photos/` and `photos.generated.json` with the manifests.

If Commons cannot be reached, `npm run photos:import -- photo.jpg --id <id>
--author "Name" --license "CC BY-SA 4.0" --license-url <url> --source <url>`
runs a photo you own or have licensed through the same resizing (add
`--permission` for a photo that is yours but not under a free licence).

Until a photo is downloaded — or if it fails to load — pages show the
brochure's generative art in its place, so every brochure always renders.

**Credits.** Each photo is credited where it appears ("Photo: Author ·
CC BY-SA 4.0", linking to the Commons file page and the licence deed, in a
new tab); the credit comes from the Commons metadata, never typed by hand.
`creditsFor(brochure)` in `src/data/photos` lists every credit a brochure
needs (with the work's title); the back page prints them all. A long credit
wraps rather than being cut off, and the licence never breaks. Credits are plain text (HTML
in Commons metadata is stripped) and carry only http(s) links. CC BY / BY-SA
photos without a licence link (Commons' or the deed for their version) are
rejected. CC BY-SA photos are only resized and re-encoded.

## Map of Japan

`src/data/geo/japan.js` holds the 47 prefectures as SVG paths, generated by
`npm run geo:build` from [Natural Earth](https://www.naturalearthdata.com/)
1:10m admin-1 boundaries (public domain; the 40 MB source is cached in
`.cache/geo/`). The build maps Natural Earth regions to the app's eight
regions, returns the Amami islands (filed under Okinawa in Natural Earth) to
Kagoshima, simplifies with mapshaper, projects with a Lambert conformal conic
and puts Okinawa Prefecture and the Amami islands in an inset; islands
outside the frames (Ogasawara, the Daitō and Tokara islands,
Minami-Torishima) are left out, and Natural Earth's 1:10m coastline leaves
out some small islands (Naoshima is not drawn; pins there still are).
`src/data/geo/geography.test.js` projects real cities and every built-in
pin and checks, point-in-polygon on the drawn paths, that each lands in its
own prefecture. Lake Biwa
comes from the Natural Earth lakes layer. `<JapanMap>` draws it with
numbered pins, zooms to where the pins are, and loads lazily.

## Deploying

`npm run build` writes a fully static site to `dist/`. Two settings make it
work anywhere without configuration:

- **Relative base** (`base: './'` in `vite.config.js`): every asset URL is
  relative, so `dist/` works at a domain root, under a sub-path, or opened
  from a folder.
- **Hash routing** (`#/brochures/kyoto-thousand-gates`): the server only ever
  serves `index.html`, so no rewrite rules are needed.

Recipes:

- **Vercel**: framework preset "Vite", build `npm run build`, output `dist`.
- **Netlify**: build `npm run build`, publish directory `dist`.
- **GitHub Pages**: build, then publish `dist/` (for example with
  `actions/upload-pages-artifact` + `actions/deploy-pages`). The relative
  base already handles the `/<repo>/` sub-path.
- **Anything else**: copy `dist/` to any static file host or bucket.

The production bundle is split into a small entry chunk, two long-lived
vendor chunks (`react`, `motion`) and one lazy chunk per route. The command
palette, the cover-art generator and the icon registry are loaded on demand.

## Credits

- Fonts are served by Google Fonts: Fraunces (Undercase Type), Geist and
  Geist Mono (Vercel), Shippori Mincho (Fontdasu) and Zen Kaku Gothic New
  (Yoshimichi Ohira), all under the SIL Open Font License.
- Icons are by [Lucide](https://lucide.dev) (ISC).
- Cover art and illustrations are generated in code from traditional
  patterns (seigaiha, asanoha, shippō, ichimatsu, ensō, torii, kumo…).
- Photographs are from Wikimedia Commons under CC0, public-domain, CC BY or
  CC BY-SA licences, credited to their authors on the page where they appear
  (see "Real photos").
- Map data: Natural Earth (public domain).
- The Credits page (`#/credits`) lists all of the above, with every photo credit.
- Built-in brochures describe real places with facts checked against official
  sources (`docs/REAL_CONTENT.md`); they are published by Tabi Guides, the
  app's own editorial imprint, and print no phone numbers.
