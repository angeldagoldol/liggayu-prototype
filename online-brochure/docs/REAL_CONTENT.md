# Real places, real facts, real photos

Tabi's built-in brochures describe **real places in Japan with verified
information and real, credited photographs**. This guide is the standard for
writing them. Data shapes are in `src/data/schema.js`.

## 1. Facts

- Every factual claim (history, dates, heights, distances, hours, prices,
  access, festival dates, UNESCO status) must be checked against **at least two
  independent sources**. Prefer official sources: the temple/shrine/museum's
  own site, city or prefectural tourism sites, JNTO (japan.travel), railway
  operators (JR, Odakyu, Hankyu…), national park pages. Use Wikipedia for
  history and coordinates, cross-checked.
- Log every fact and its sources in `docs/research/<slug>.md` (a table:
  claim → value → source URLs → date checked). Reviewers check this file.
- Prices and opening hours change. Use the latest values you can verify, set
  the brochure's `factsChecked` (e.g. `"October 2026"`), and phrase uncertain
  values honestly ("about ¥500", "usually 9:00–17:00"). If you cannot verify a
  number, leave it out.
- No invented businesses, hotels, tour operators, guides, people, testimonials,
  prices or contact details. Built-in brochures are published by **Tabi Guides**
  (this app's own editorial imprint). Never present a brochure as published by
  a real organisation.
- Real businesses may be *mentioned* as places to visit (a famous market, a
  museum, a ryokan town), but do not endorse or advertise a specific private
  business as if sponsored.
- `contact` pages are **Visitor information**: official websites (real `https`
  URLs you found) and tourist information centres with their real location. No
  phone numbers.
- `quote` pages carry a **real, attributable** quote: a haiku or poem (Bashō,
  Buson, Issa, Shiki…, give `quoteJp` = original Japanese and `quote` = an
  English translation; label your own translation "Translation: Tabi Guides" in
  `role`), a proverb, or a documented historical line. Verify the wording.
- `place` pages describe one real sight: what it is, why it matters, what to
  look for, plus 2–5 `facts` rows (Hours, Admission, Getting there, Time
  needed, Best time) and its `lat`/`lng` and official `website`.
- `map` pages pin the brochure's real places with accurate coordinates
  (decimal degrees, 4 decimals). The map shows the four main islands with
  their near islands and an Okinawa & Amami inset; the Tokara, Ogasawara and
  Daitō islands are not drawn, and `src/data/geo/geography.test.js` fails
  for a pin outside the map.
- Japanese must be correct: kanji/kana, natural romaji with macrons
  (Tōdai-ji, Arigatō). Use common English names for big cities (Tokyo, Kyoto,
  Osaka). Phrasebook entries must be natural, polite Japanese.
- Be respectful: Hiroshima, religious sites, Ainu and Ryūkyū cultures,
  geiko/maiko etiquette, photography rules.

## 2. Photos

All photos come from **Wikimedia Commons** under free licences (CC0, public
domain, CC BY, CC BY-SA). They are downloaded, resized and credited by
`scripts/photos/fetch.mjs`; nothing is hotlinked.

Each brochure lists its photos in `src/data/photos/manifest/<slug>.json`:

```json
{
  "brochure": "kyoto-thousand-gates",
  "photos": [
    {
      "id": "kyoto-senbon-torii",
      "use": "cover",
      "candidates": [
        "File:Fushimi Inari-taisha, Senbon Torii.jpg",
        "File:Another candidate.jpg",
        "File:A third candidate.jpg"
      ],
      "alt": "A tunnel of vermilion torii gates on a forest path",
      "caption": "Senbon Torii at Fushimi Inari Taisha",
      "place": "Fushimi Inari Taisha",
      "focus": "50% 45%"
    }
  ]
}
```

- `id`: kebab-case, globally unique, prefixed with the place (`kyoto-…`).
  Pages reference it: `photo: 'kyoto-senbon-torii'`.
- `use`: `cover` (portrait page; needs a strong central subject), `wide`
  (landscape), or `any`.
- `candidates`: exact Commons file titles, best first, at least 2 and ideally 3.
  Find them with web search, e.g. `site:commons.wikimedia.org File: Fushimi Inari
  torii`, and prefer files marked *Featured picture*, *Quality image* or
  *Valued image*. A result URL `https://commons.wikimedia.org/wiki/File:Foo_bar.jpg`
  is the title `File:Foo bar.jpg` (underscores → spaces, percent-decoded).
  Avoid: people as the main subject, watermarks, collages, heavy HDR, night
  shots that are mostly black, images under ~2000 px wide.
- `alt` describes what is visible; `caption` names the place (and season/time
  if relevant). The photographer credit and licence are filled in
  automatically from Commons — never type them by hand.
- `focus`: CSS `object-position` keeping the subject in frame when cropped.
- A curation step later downloads every candidate, looks at them and records
  the chosen one as `"file"`. Until a photo is downloaded the app shows the
  brochure's generative art in its place, so brochures always render.

Typical photo budget per brochure: cover 1, intro 1, each `place` page 1,
gallery 3–4 (about 8–10 in total).

## 3. Brochure outline (12–14 pages)

`cover` (photo) → `intro` (photo) → 2–3 × `place` → `features` → `gallery` →
`map` → `agenda` (a realistic day or trip plan using real opening hours and
travel times) → `pricing` as **Costs** (real admission fees, passes, fares) →
`phrases` → `quote` (real) → `contact` as **Visitor information** → `back`
(sign-off, `tagline` = "Facts checked <month year> · Tabi Guides").

The brochure-level `location`, `sources` (official sites first) and
`factsChecked` fields are required for built-ins.
