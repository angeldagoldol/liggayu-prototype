# Research log — Naoshima & the Art Islands (`naoshima-art-islands`)

Written 17 October 2026 (`factsChecked: "October 2026"`). Existing brochure, rewritten from scratch.

> **Status: NOT YET WEB-VERIFIED.** The shared web-search budget for this workflow turn was
> already exhausted when this research step started (the very first query was refused), and
> WebFetch/curl cannot reach outside sites from the sandbox. Every claim below therefore comes
> from the editor's own knowledge (training data to mid-2026), **not** from pages read this
> session. The "Verify against" column lists the official pages a reviewer should check; the
> "Confidence" column says how sure the editor is. Numbers with lower confidence were left out of
> the copy rather than guessed. The URLs are believed correct but were not opened this session
> (check that each resolves, including the ones printed in the brochure). **Run a verification
> pass (two sources per claim, per docs/REAL_CONTENT.md §1) before this brochure is treated as
> fact-checked** — in particular the rows marked ⚠.

> **Fact-check pass — 17 October 2026 (independent reviewer): still NOT web-verified.** The
> reviewer's WebSearch calls were refused as well (shared per-turn budget of 200 searches already used
> up), and WebFetch/curl are blocked, so no page was opened and no claim has the two independent
> sources §1 requires. The reviewer instead (a) re-checked every claim against their own knowledge
> (to mid-2026) with deliberate skepticism, (b) checked internal consistency, Japanese, romaji and
> the Studio length limits, and (c) checked pins against the repo's Natural Earth geometry
> (`src/data/geo/japan.js`; Naoshima is too small to appear in it, but Teshima does — it spans
> roughly 134.04–134.10° E there). The **Fact-check** column records the outcome: ✔ = agrees with
> the reviewer's independent knowledge (still needs a web source), ✎ = corrected (old → new),
> ⚠ = doubtful; verify before release.

## Facts

| Claim (page) | Value used | Verify against | Confidence | Notes | Fact-check (17 Oct 2026) |
| --- | --- | --- | --- | --- | --- |
| Naoshima is in Kagawa Prefecture (cover eyebrow, location) | Naoshima Town, Kagawa District | https://www.town.naoshima.lg.jp/ ; https://www.naoshima.net/en/ | High | Ferries also run from Uno (Tamano, Okayama). | ✔ |
| Fishing and copper-smelting island (intro) | Mitsubishi smelter on the north of the island since 1917 | https://www.naoshima.net/en/ ; https://en.wikipedia.org/wiki/Naoshima,_Kagawa | High | Year not printed. | ✔ |
| Late 1980s: Fukutake Publishing (Benesse since 1995) begins the art site with Tadao Ando | — | https://benesse-artsite.jp/en/about/ | High | Naoshima International Camp 1989; Benesse House 1992. | ✔ (Fukutake Shoten renamed Benesse Corporation in 1995). ✎ The intro listed "a museum-hotel, a buried museum and artworks in Honmura's old houses", which is out of order (1992 / 2004 / 1998) → "A museum-hotel, art in Honmura's old houses and a museum buried in a hill followed." |
| Teshima and Inujima joined; Setouchi Triennale since 2010, every three years, about a dozen islands | 2010; triennial; "a dozen islands" | https://setouchi-artfest.jp/en/ | High | 2025 edition ran on 12 islands plus mainland port areas — confirm the island count. | ✔ |
| ⚠ **Triennale 2025 over; next in 2028** (features, back) | 2025 = 6th edition (spring 18 Apr–25 May, summer 1–31 Aug, autumn 3 Oct–9 Nov 2025); next due 2028 | https://setouchi-artfest.jp/en/ | Medium-high | 2028 dates not announced as far as known — copy says only "due in 2028". | ✔ "due in 2028" is a safe wording; 2028 dates unknown. |
| Chichu Art Museum: Tadao Ando, 2004, mostly underground, daylight | opened 2004 | https://benesse-artsite.jp/en/art/chichu.html | High | Opened 18 July 2004. | ✔ |
| Chichu works: 5 Monet Water Lilies; 3 Turrell works; De Maria's granite sphere with gilded wooden forms | — | https://benesse-artsite.jp/en/art/chichu.html | High | De Maria's *Time/Timeless/No Time* (2004): ~2.2 m sphere and 27 gilded sculptures (numbers not printed). Shoes off in the Monet room. No photography inside. | ✔ (Monet ×5, Turrell ×3, De Maria *Time/Timeless/No Time*; slippers in the Monet room) |
| Chichu hours | 10:00–18:00 Mar–Sep; 10:00–17:00 Oct–Feb | https://benesse-artsite.jp/en/art/chichu.html | Medium-high | Last entry 1 h before closing (not printed). | ✔ |
| Chichu closed Mondays (Tuesday when Monday is a holiday) | — | https://benesse-artsite.jp/en/art/chichu.html | High | Also closed some extra days (calendar on site). | ✔ |
| ⚠ Chichu ticket | ¥2,500 adult; timed online reservation | https://benesse-artsite.jp/en/art/chichu.html | Medium | Price rose from ¥2,100; confirm the current amount. Timed online tickets: high confidence. | ⚠ ¥2,500 matches the reviewer's knowledge of the current fee; not re-confirmed for 2026. |
| Free for children 15 and under (Costs note) | "Most are free for children 15 and under" | https://benesse-artsite.jp/en/ (each museum's fee table) | Medium | ⚠ Remove if the policy differs. | ✔ as hedged ("Most") |
| Town bus to Tsutsujisō, then the free Benesse shuttle | — | https://www.naoshima.net/en/ (access) ; https://benesse-artsite.jp/en/ | Medium-high | | ⚠ Long-standing arrangement; check it survived the 2025 changes (New Museum of Art in Honmura). |
| ⚠ Naoshima town bus fare | ¥100 per ride | https://www.naoshima.net/en/ (town bus) | Medium | Long-standing flat fare; check it hasn't risen. | ⚠ ¥100 matches the reviewer's knowledge; not re-confirmed for 2026. |
| Benesse House Museum: Ando, opened 1992; museum + hotel; site-specific works; outdoor works along the shore | 1992 | https://benesse-artsite.jp/en/art/benessehouse-museum.html | High | Admission (≈ ¥1,500?) **not printed** — unsure of the current amount. | ✔ |
| Benesse House Museum hours | 8:00–21:00, open daily | https://benesse-artsite.jp/en/art/benessehouse-museum.html | Medium-high | Last entry 20:00 (not printed). | ✔ |
| Kusama's (yellow) *Pumpkin*: on its pier since 1994; swept away by a typhoon in 2021; remade and returned in 2022 | 1994 / 2021 / 2022 | https://benesse-artsite.jp/en/ (news) ; news reports Aug 2021 (Typhoon Lupit) and Oct 2022 | High | | ✔ (Typhoon Lupit, Aug 2021; reinstalled Oct 2022) |
| Red Pumpkin, Miyanoura, 2006; hollow, you can step inside | 2006 | https://benesse-artsite.jp/en/art/kusama.html (or Naoshima art list) | Medium-high | | ✔ |
| Art House Project since 1998; Honmura homes, Go'ō Shrine, Minamidera (Ando building, Turrell work) | 1998 | https://benesse-artsite.jp/en/art/arthouse.html | High | First house: Kadoya (Tatsuo Miyajima, 1998). Hours "until 16:30" used in the agenda (medium confidence). Minamidera by timed slot (medium). | ✔ |
| I♥湯 bathhouse by Shinro Ohtake, Miyanoura, 2009; a working public bath | 2009 | https://benesse-artsite.jp/en/art/naoshimasento.html | High | Fee and hours not printed. Agenda places it at 17:30 (it opens in the afternoon and stays open into the evening — check hours/closing day). | ✔ (closing day and hours still to confirm for the 17:30 agenda slot) |
| Lee Ufan Museum: Ando, 2010 | 2010 | https://benesse-artsite.jp/en/art/lee-ufan.html | High | Fee not printed. | ✔ |
| ⚠ Naoshima New Museum of Art: Ando, opened 2025 in Honmura; contemporary art from Japan and Asia | opened 31 May 2025 | https://benesse-artsite.jp/en/ | Medium-high | Fee/hours not printed. | ✔ (opened 31 May 2025) |
| Naoshima Pavilion by Sou Fujimoto, Miyanoura; free to see | 2015 | https://benesse-artsite.jp/en/ ; https://www.naoshima.net/en/ | Medium-high | Year not printed. | ✔ |
| Teshima Art Museum: Rei Naito (art) and Ryue Nishizawa (architecture), opened 2010; concrete shell ~40 × 60 m, no columns, two openings; *Matrix*; restored rice terraces | 2010 | https://benesse-artsite.jp/en/art/teshima-artmuseum.html | High | Opened 17 Oct 2010. Max height ~4.5 m (not printed). | ✔. ✎ "their work Matrix" was wrong: *Matrix* is Rei Naito's artwork, and Nishizawa designed the building → "Naito's work Matrix". |
| Teshima Art Museum hours | 10:00–17:00 Mar–Sep; 10:00–16:00 Oct–Feb | https://benesse-artsite.jp/en/art/teshima-artmuseum.html | Medium | | ✔ |
| Teshima Art Museum closed | Tuesdays Mar–Nov; Tue–Thu Dec–Feb | same | Medium-high | | ✔ |
| Teshima Art Museum tickets | timed slots, booked online | same | Medium | Fee (≈ ¥1,570–1,800?) **not printed**. | ✔ |
| Teshima access: boat to Ieura, then bus or e-bike to Karato | — | https://www.shikokukisen.com/ ; https://teshima-navi.jp/ (Teshima tourism, URL to confirm) | High | Boat times from Naoshima not printed. | ✔ |
| Ferries: Uno–Miyanoura ≈ 20 min; Takamatsu–Miyanoura ≈ 50 min (car ferry) | — | https://www.shikokukisen.com/ | High | High-speed boat Takamatsu–Miyanoura ≈ 30 min (not printed). **Fares not printed** (unsure of current values). Agenda "08:30 ferry from Uno" is a plan time — the text tells readers to check the timetable. | ✔ |
| Tourist information at Miyanoura port terminal | — | https://www.naoshima.net/en/ | Medium-high | Terminal ("Marine Station") by SANAA. Phone numbers omitted. | ✔. ✎ Contact label "Benesse Art Site Naoshima" (25 chars) → "Benesse Art Site" (Studio limit 24). |
| Quote: 「在るものを活かし、無いものを創る」 — Soichiro Fukutake | Benesse Art Site Naoshima's founding principle | https://benesse-artsite.jp/en/about/ | Medium | ⚠ Confirm the exact wording and attribution. An official English rendering exists ("Use what exists to create what is to be" or similar) — if verified, use it and drop "Translation: Tabi Guides". | ⚠ The phrase and its link to Soichiro Fukutake match the reviewer's knowledge (often quoted in full as 在るものを壊さず、在るものを活かし、無いものを創る). The official English wording is still unconfirmed, so the Tabi Guides translation stays. ✎ Role "Founding principle of Benesse Art Site Naoshima · Translation: Tabi Guides" (74 chars) → "Benesse Art Site Naoshima · Translation: Tabi Guides" (52; limit 60), which avoids an unverified title. |
| Japanese phrases | 予約しています / 靴を脱ぎますか？ / 写真を撮ってもいいですか？ / 電動自転車を借りたいです / 次のフェリーは何時ですか？ / 豊島行きの船はどこから出ますか？ | — | High | Natural, polite Japanese. | ✎ 靴を脱ぎますか？ (Kutsu o nugimasu ka?) sounds like staff instructing a visitor. Changed to the more natural visitor's question 靴は脱ぎますか？ (Kutsu wa nugimasu ka?). The other lines ✔. |
| Coordinates | Chichu 34.4470, 133.9963; Benesse House 34.4425, 133.9915; Honmura 34.4568, 133.9985; Miyanoura Port 34.4588, 133.9738; Teshima Art Museum ~~34.4900, 134.0740~~ 34.4910, 134.0920 (fact-check); Uno Port 34.4907, 133.9548; Takamatsu Port 34.3510, 134.0478 | Wikipedia / OpenStreetMap | Low-medium | ⚠ **From memory; may be off by several hundred metres.** Must be checked against OSM before release (they drive the place pages' map links). | ✎ **Teshima Art Museum** 34.4900, 134.0740 → **34.4910, 134.0920**. Its address is Karato (豊島唐櫃607), on the north-east of the island near Karato port, but 134.074 is mid-island in the Natural Earth outline. The new value is an estimate (⚠ check on OSM). Chichu agrees with the reviewer's recollection of Wikipedia (≈ 34.447, 133.996). ⚠ Benesse House Museum, Honmura, Miyanoura, Uno and Takamatsu are plausible but unconfirmed (Takamatsu's ferry piers may be ~150 m north of 34.3510). |

## Fact-check pass, 17 October 2026: open items before release

1. **Fees**: Chichu ¥2,500, the town bus ¥100 and "most free for 15 and under". Each needs two
   sources dated 2026.
2. **Access**: confirm the town bus to Tsutsujisō and the free Benesse-area shuttle still serve
   Chichu.
3. **Quote**: confirm the wording 在るものを活かし、無いものを創る and its attribution to Soichiro
   Fukutake on benesse-artsite.jp. If an official English rendering exists, use it and drop
   "Translation: Tabi Guides".
4. **Coordinates**: check all seven pins on OpenStreetMap, especially the corrected Teshima Art
   Museum pin and Benesse House Museum.
5. **Intro pull quote**: "The ferry timetable is part of the artwork." read like an attributed
   quote but had no source. It was replaced with a line from the body copy: "Book ahead, check
   the ferries, and let the islands set the pace."
6. **Photos**: no candidate file title has been confirmed to exist on Commons, and there are
   freedom-of-panorama concerns for the pumpkins (see below).
7. **Test note**: `src/data/brochures.test.js` still expects 9–12 pages. This brochure has 14,
   which is within the 12–14 outline in `docs/REAL_CONTENT.md` §3, so the test encodes the old
   assumption.

## Changed vs the old brochure

- Publisher changed from the fictional "Setouchi Slow Ferry Club" to **Tabi Guides**; the invented contact desk, e-mail and the invented testimonial ("Yuki & Ben") removed. The quote is now a real, attributable line (to be confirmed — see table).
- Added: Kusama's *Pumpkin* was swept away by a typhoon in 2021 and returned in 2022; the **Naoshima New Museum of Art** (Ando, opened 2025); the 2025 Triennale is over and the next is due in **2028**.
- The old stats ("2 Kusama pumpkins", "20 min from Uno", "3 years between editions") are folded into the copy; Inujima is mentioned in the intro only (its museum could not be checked).

## Not verified / left out

- Admission fees for Benesse House Museum, Lee Ufan Museum, Art House Project, I♥湯, Teshima Art Museum, Naoshima New Museum of Art; ferry fares; Inujima Seirensho Art Museum details; ANDO MUSEUM; Valley Gallery (2022).

## Photos

All from Wikimedia Commons, to be confirmed by the curation step (`npm run photos:candidates -- naoshima-art-islands`).

> ⚠ **The candidate file titles are unverified.** No Commons search was possible this session, so
> the titles are the editor's best guesses at existing files. Expect several to be missing.
>
> ⚠ **Freedom of panorama.** Commons accepts photos of *buildings* in Japan, but not photos whose
> main subject is a copyrighted *artwork* (Japan's FoP does not cover sculptures for commercial
> reuse). Photos of Kusama's pumpkins may therefore be missing, deleted or under a de-minimis
> caveat. If no acceptable pumpkin photo exists, use an Ando building or a seascape for the cover
> (`naoshima-yellow-pumpkin`) and the Red Pumpkin gallery slot, and update `caption`/`alt` (and the
> cover alt) accordingly. Interior photography is not allowed at Chichu or Teshima Art Museum, so
> choose exteriors only.

| Slot (id → page) | Candidates (unverified) | Where to look on Commons | What to choose |
| --- | --- | --- | --- |
| `naoshima-yellow-pumpkin` → cover | File:Yayoi Kusama Pumpkin Naoshima.jpg · File:Naoshima Pumpkin.jpg · File:Pumpkin, Naoshima.jpg | Category:Naoshima; Category:Benesse House; search "Kusama Naoshima" | Portrait crop of the pumpkin on its pier. Fallback: Teshima Art Museum shell or a seascape (see FoP note). |
| `naoshima-inland-sea` → intro | File:Naoshima.jpg · File:直島.jpg · File:Seto Inland Sea from Naoshima.jpg | Category:Naoshima; Category:Seto Inland Sea | Calm sea with islands, taken on/near Naoshima. |
| `naoshima-chichu` → Chichu place | File:Chichu Art Museum.jpg · File:地中美術館.jpg · File:Chichu Art Museum, Naoshima.jpg | Category:Chichu Art Museum | Exterior/entrance concrete; or the Chichu Garden. No interiors. |
| `naoshima-benesse-house` → Benesse place | File:Benesse House.jpg · File:Benesse House Museum.jpg · File:ベネッセハウス.jpg | Category:Benesse House | The museum building above the sea. |
| `naoshima-teshima-art-museum` → Teshima place | File:Teshima Art Museum.jpg · File:豊島美術館.jpg · File:Teshima Art Museum 01.jpg | Category:Teshima Art Museum; Category:Teshima (Kagawa) | The white shell among rice terraces. No interiors. |
| `naoshima-red-pumpkin` → gallery | File:Red Pumpkin Naoshima.jpg · File:Naoshima red pumpkin.jpg · File:Red Pumpkin, Miyanoura, Naoshima.jpg | Category:Miyanoura (Naoshima); search "red pumpkin Naoshima" | See FoP note; fallback: Naoshima Pavilion or the port. |
| `naoshima-honmura` → gallery | File:Minamidera Naoshima.jpg · File:Art House Project Naoshima.jpg · File:Honmura, Naoshima.jpg | Category:Art House Project; Category:Honmura (Naoshima) | A lane of charred-cedar houses, or Minamidera's exterior. |
| `naoshima-i-love-yu` → gallery | File:I Love Yu Naoshima.jpg · File:Naoshima Bath I Love Yu.jpg · File:直島銭湯「I♥湯」.jpg | Category:Naoshima Bath "I♥湯" | Facade (a building, so FoP-safe). |
| `naoshima-miyanoura-port` → gallery | File:Naoshima Marine Station.jpg · File:Miyanoura Port Naoshima.jpg · File:Naoshima Pavilion.jpg | Category:Miyanoura (Naoshima); Category:Naoshima Pavilion | SANAA's flat-roofed terminal; if the pavilion is chosen, change alt to describe Fujimoto's white mesh "island". |
