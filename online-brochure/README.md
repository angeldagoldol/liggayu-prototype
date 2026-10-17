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
| `#/` **Home** | A 3D tri-fold hero that unfolds and follows the pointer, a live Tokyo clock, a bilingual word marquee, a featured-brochure carousel, the four seasons (opening on the current season in Japan), a keyboard-navigable schematic map of the eight regions, "how it works" sketches, Japan in numbers, reader postcards and a Studio call to action. |
| `#/brochures` **Library** | Search in English or Japanese (accent-, width- and kana-insensitive: `tohoku`, `ＫＹＯＴＯ` and `きょうと` all work), multi-season toggles, region, category, favourites, four sorts, and grid or list views. Every filter lives in the URL, so views are shareable and Back steps through them. Also shelves for your own brochures and recently viewed ones, where "Continue reading" reopens the page you left off on. |
| `#/brochures/:slug` **Viewer** | A flipbook with spreads on wide screens and single pages on phones: drag a corner, click or tap a page edge, swipe, or use ← → / PageUp / PageDown / Home / End. Also a scrubber with a thumbnail filmstrip that rises on hover or focus, an all-pages overview, zoom (100–400%) with pan, fullscreen, print to A4 (one page per sheet), share/deep link (`?p=` is the page index), favourites, a "Plan this trip" inquiry form and "More like this". |
| `#/studio` **Studio** | Start from five Japan templates, a blank brochure or a remix of any library brochure (`?from=<slug>`). Edit every page with a live preview, change palette, colours (with contrast warnings and auto-fix), typeface and generative cover art, and reorder pages by drag or keyboard. Undo/redo, autosave, JSON import/export, then publish (a hanko stamp) to your shelf. `#/studio/:id` edits a published brochure. |
| **⌘K / Ctrl K** | The command palette searches brochures, places, seasons, library filters and actions from anywhere. |
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
```

`/playground.html` (dev server only, never built) is a workbench for the
brochure kit: every cover-art style, every page of every brochure, empty-field
pages and theme crops. Query parameters: `section=art|pages|large|empty`,
`style`, `seeds=1,2,3`, `b=<slug>`, `crop=native|3:4|1:1`, `animate=1`.

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
  components/
    ui/                    design-system primitives (Button, IconButton, Modal/Drawer, Hanko…)
    layout/                AppShell, Navbar, Footer, command palette, route transition, search
    brochure/              CoverArt (generative art in art/), BrochurePage (+ blocks/), BrochureCard
    viewer/                Flipbook, reader toolbar, scrubber, thumbnails, overview, print, inquiry
    studio/                editor reducer, panels, fields, preview, publish checks, import/export
  pages/                   Home, Library, Viewer, Studio, NotFound (route components + sections)
  dev/                     the kit playground
  test/setup.js            jsdom polyfills for Vitest
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

1. Open `src/data/brochures.js` and add an object to `BROCHURES`. The shape is
   documented in `src/data/schema.js`:

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
     organization: 'Hakuichi Walks',      // fictional publisher
     format: 'booklet',                   // booklet | bifold | trifold
     updatedAt: '2026-10-01T09:00:00.000Z',
     readMinutes: 5,
     featured: false,
     source: 'builtin',
     theme: { paper: '#f6f1e6', ink: '#1f1a14', accent: '#b8862b', accent2: '#1d4f7a', muted: '#6b5e4e', typeface: 'serif' },
     cover: { art: 'kumo', seed: 7 },     // one of ART_STYLES; the seed picks the variation
     pages: [
       { id: 'p1', type: 'cover', eyebrow: '…', title: '…', subtitle: '…' },
       { id: 'p2', type: 'intro', kicker: '…', heading: '…', body: 'Paragraph one.\n\nParagraph two.', pullQuote: '…' },
       // features · gallery · stats · agenda · pricing · phrases · quote · contact
       { id: 'p11', type: 'back', title: '…', body: '…', tagline: '…' },
     ],
   }
   ```

2. Page types and their fields: `cover, intro, features, gallery, stats,
   agenda, pricing, phrases, quote, contact, back`. `PAGE_TYPES[type].create()`
   in `schema.js` returns a filled example of each. Start with a `cover`, end
   with a `back`, and aim for 9–12 pages. Icons are names from the registry in
   `src/components/ui/Icon.jsx`.
3. Run `npm test`. `src/data/brochures.test.js` checks the schema, unique ids
   and slugs, cover/back placement, icon names, `.example` contact domains, no
   dialable phone numbers (Japan has no fictional number range) and palette
   contrast (ink ≥ 7:1, muted ≥ 4.5:1, accent ≥ 3:1 on the paper).
4. Look at it in `/playground.html?section=pages&b=<slug>` and in the viewer.

Renderers never crash on missing or empty fields, because user-made
brochures are often half-finished.

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
- All cover art and illustrations are generated in code from traditional
  patterns (seigaiha, asanoha, shippō, ichimatsu, ensō, torii, kumo…). There
  are no photos or third-party images.
- Facts about Japan are real and deliberately conservative: rounded figures,
  official sources such as the Geospatial Information Authority of Japan and
  the Japan Meteorological Agency, dated where they can change. Organisations,
  people, prices and contact details are fictional, every email address
  uses an `.example` domain, and no brochure prints a phone number.
