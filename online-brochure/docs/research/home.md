# Research log — Home page (`home`)

Written 17 October 2026. **Status: PARTLY VERIFIED DRAFT.**

The shared web-search budget for this workflow turn was used up before this step began. WebSearch said
"budget is used up" on the first query, and WebFetch/curl cannot reach outside sites. So **no new web page
was read for this log.** It uses two kinds of evidence, and every row says which:

- **Log ✔**: the claim was checked earlier the same day, with web sources, by a sibling research log that
  *was* search-verified: `kyoto-thousand-gates.md`, `tokyo-after-dark.md`, `nara-deer-and-temples.md` or
  `hakone-onsen-ryokan.md`. The URLs in those rows come from those logs.
- **Knowledge**: the claim comes from the editor's prior knowledge (training data to mid-2026). The URLs are the
  official pages to verify against. They were **not opened this session**. Confidence: **H** = well established,
  very unlikely to be wrong; **M** = believed correct, check; **L** = uncertain, check before publishing.

Run a verification pass (two sources per claim, per `docs/REAL_CONTENT.md`) before the home page claims
"Facts checked". Anything marked M or L that cannot be confirmed should be cut, not guessed.

Files covered: `src/pages/Home/homeContent.js`, `src/pages/Home/sections/*.jsx` (Hero, HeroStage, TriFold,
Seasons, Regions, Numbers, WordMarquee, Voices, Featured, HowItWorks, CtaBand), `src/data/regions.js`,
`src/data/seasons.js`, `src/data/categories.js`, and, because it shows on every page including Home,
`src/components/layout/japanTime.js` (`MONTH_NOTES`).

---

## 1. Corrections to apply (current text → corrected text)

In priority order. File and line references are to the code as it stood on 17 Oct 2026.

### 1.1 MUST: fictional testimonials (breaks REAL_CONTENT §1)

`homeContent.js` → `VOICES` (5 invented readers, cities, dates and quotes) and the file header comment
*"readers, names and quotes are fictional"*. The standard says: "No invented … people, testimonials". Replace the
section with **real, attributable haiku**, sent like postcards from the places that inspired them. The data shape
can stay the same: `name` = poet, `city` = place, `date` = year, `postmark` = place.
Add `quoteJp` and `romaji`. Translations are our own, so credit them "Translation: Tabi Guides".

| id | name | city (place) | postmark | date | quoteJp | romaji | quote (Translation: Tabi Guides) | Conf. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `basho-furuike` | Matsuo Bashō | Fukagawa, Edo (today Kōtō, Tokyo) | EDO | 1686 | 古池や蛙飛びこむ水の音 | Furuike ya / kawazu tobikomu / mizu no oto | The old pond — / a frog jumps in, / the sound of water. | H (text, year); M (written at the Bashō-an hut in Fukagawa) |
| `basho-hiraizumi` | Matsuo Bashō | Hiraizumi, Iwate | HIRAIZUMI | 1689 | 夏草や兵どもが夢の跡 | Natsukusa ya / tsuwamono-domo ga / yume no ato | Summer grasses — / all that is left / of warriors’ dreams. | H (*Oku no Hosomichi*) |
| `basho-yamadera` | Matsuo Bashō | Yamadera (Risshaku-ji), Yamagata | YAMADERA | 1689 | 閑さや岩にしみ入る蝉の声 | Shizukasa ya / iwa ni shimiiru / semi no koe | Such stillness — / the cicadas’ cry / seeps into the rocks. | H (same poem as `tohoku-summer-festivals`) |
| `issa-kashiwabara` | Kobayashi Issa | Kashiwabara, Shinano (today Shinano-machi, Nagano) | KASHIWABARA | 1812 | 是がまあつひの栖か雪五尺 | Kore ga maa / tsui no sumika ka / yuki go-shaku | So this, then, / is my final home? / Five feet of snow. | H (text); M (year 1812, on his return home) |
| `shiki-horyuji` | Masaoka Shiki | Hōryū-ji, Ikaruga, Nara | IKARUGA | 1895 | 柿食へば鐘が鳴るなり法隆寺 | Kaki kueba / kane ga naru nari / Hōryūji | I bite a persimmon — / and the bell rings out / at Hōryū-ji. | H |

- All three poets died before 1903, so the poems are public domain.
- Do **not** use 「松島や ああ松島や 松島や」. It is popularly credited to Bashō but is not his (it is usually traced to
  the later poet Tahara Bōsai).
- Section copy in `Voices.jsx` / `SectionHead`:
  - title `Letters from readers` → **`Postcards from the poets`**
  - intro `Notes from people who planned, dreamed or simply read their way around Japan with Tabi.` →
    **`Haiku by poets who travelled Japan, sent from the places that moved them. Translations: Tabi Guides.`**
  - `aria-label="Letters from readers"` → **`aria-label="Haiku postcards"`**; reader buttons `Letter N of 5: name, city` → `Postcard N of 5: poet, place`.
- `homeContent.js` header: `Facts about Japan are real and kept conservative; readers, names and quotes are fictional.` →
  **`Facts about Japan are real and logged in docs/research/home.md; quotes are real haiku with our own translations.`**
- `CtaBand`/`HowItWorks` say nothing invented. OK.

Coordinates for the postcards, if the map should pin them (all **L**, from memory):
Bashō Memorial Museum, Kōtō 35.6874, 139.7946 · Chūson-ji, Hiraizumi 38.9989, 141.0997 · Yamadera 38.3125, 140.4375 ·
Issa Memorial Museum, Shinano-machi 36.8070, 138.2060 · Hōryū-ji 34.6143, 135.7346.

### 1.2 SHOULD: Numbers notes (`homeContent.js` → `FACTS`)

| Field | Current | Corrected | Why |
| --- | --- | --- | --- |
| `volcanoes.note` | `51 of them are watched around the clock by the Japan Meteorological Agency.` | **`About 50 of them are watched around the clock by the Japan Meteorological Agency.`** | The JMA list of continuously monitored volcanoes was 50 from 2016. Whether it is 51 now could not be confirmed this session. "About 50" is true either way. Restore the exact number once it is checked on JMA's page. |
| `shinkansen.note` | `Reached by Hayabusa trains on the Tōhoku Shinkansen.` | **`Reached by Hayabusa and Komachi trains between Utsunomiya and Morioka on the Tōhoku Shinkansen.`** | More precise. 320 km/h applies only on that section. E6 Komachi runs at 320 km/h while coupled to an E5 Hayabusa. |
| `islands.note` | `Recounted by the Geospatial Information Authority of Japan in 2023.` | *(optional)* `Counted by the Geospatial Information Authority of Japan in 2023, more than double the old figure of 6,852.` | Current text is correct. The addition explains why the number looks new. |
| `prefectures.note` | `From Hokkaidō in the north to Okinawa in the south.` | no change | Correct. |

### 1.3 SHOULD: Hero tri-fold (`sections/TriFold.jsx` → `PANELS`, aria-label)

The panels currently show generative art. With the new photo slots (`home-hero-*`), use this copy:

| Panel | Photo | jp | title | body |
| --- | --- | --- | --- | --- |
| left | `home-hero-fuji` | 富士山 | Mount Fuji | `Japan’s highest peak rises 3,776 m between Shizuoka and Yamanashi.` (**unchanged, correct**). Optional suffix: ` Seen here from Lake Ashi, Hakone.` |
| middle | `home-hero-torii` | 伏見稲荷大社 | Fushimi Inari | **`Around 10,000 vermilion torii, gifts from worshippers, climb the slopes of Mount Inari in Kyoto.`** |
| right | `home-hero-shibuya` | 渋谷 | Shibuya Crossing | **`Up to about 3,000 people cross at once when the lights turn green.`** |

- aria-label `An illustrated tri-fold brochure about Japan, unfolding: Mount Fuji, the rising sun and seigaiha waves` →
  **`A tri-fold brochure about Japan, unfolding: photographs of Mount Fuji, the torii of Fushimi Inari and Shibuya Crossing at night`**.
- If the art panels are kept instead of photos:
  - middle `Nihon, the country’s own name for itself, literally means “origin of the sun”.` is **correct**: 日 sun + 本 origin. Keep it.
  - right `Overlapping waves — an old pattern that wishes for calm seas and good fortune.` →
    **`Overlapping waves — an old pattern named after a court dance, wishing for peace and good fortune that, like the waves, never end.`**
    The pattern takes its name from the gagaku piece *Seigaiha* ("blue sea waves"). Its usual meaning is a wish for
    lasting peace and good fortune. "Calm seas" is a loose reading. (M)
- Back panel `tabi.example`: a reserved placeholder domain, not a real business. OK.

### 1.4 SHOULD: Region map (`sections/Regions.jsx`, `data/regions.js`)

- `Schematic · not to scale` → once the real map (`src/data/geo/japan.js`) is used: **`Natural Earth · Okinawa inset ×1.25`**
  (or simply drop the line). "Schematic" would no longer be true.
- Blurbs: the current ones are all **accurate** (see §2.4). Proposed fuller "known for" lines and a pinned place per
  region are in §3. Suggested new fields: `knownFor`, `place: { name, nameJp, lat, lng, photo }`.
- Caption `Shinkansen spine` / `Seto Ōhashi bridge`: **correct**. There is a continuous Shinkansen network from
  Shin-Hakodate-Hokuto to Kagoshima-Chūō. Shikoku has no Shinkansen. The Seto-Ōhashi (opened 1988, road and rail)
  links Okayama (Chūgoku) and Kagawa (Shikoku). On a real map, draw the line through the actual stations instead of
  region centres.

### 1.5 COULD: Seasons copy (`homeContent.js` → `SEASON_LINES`)

All four lines are **correct**. If the summer photo is the Furano lavender slot, make the copy match it:
- summer `Lantern-lit matsuri, fireworks over the rivers and cool air high in the Japan Alps.` →
  **`Lantern-lit matsuri, fireworks over the rivers, lavender in Hokkaidō and cool air high in the Japan Alps.`**
- autumn (optional precision) `Maple leaves turn crimson from the north southwards, and temple gardens glow for weeks.` →
  `Maple leaves turn crimson from the north southwards and from the peaks down, and temple gardens glow for weeks.`

### 1.6 COULD: Marquee glosses (`homeContent.js` → `WORDS`)

All 18 words have correct kanji/kana and romaji. Glosses are acceptable. Two are a little loose:
- `間 ma — negative space` → **`the space between`** (*ma* is an interval in space *or* time, not only visual "negative space").
- `侘び寂び wabi-sabi — beauty in imperfection` → *(optional)* `beauty in the imperfect and impermanent`.

---

## 2. Fact check — every factual claim on the home page

### 2.1 Numbers (`FACTS`, Hero meta strip, HeroStage compass ring)

| Claim (where) | Value | Verdict | Verify against | Conf. |
| --- | --- | --- | --- | --- |
| 47 prefectures (FACTS, Hero meta, compass ring) | 47 = 1 *to* (Tokyo) + 1 *dō* (Hokkaidō) + 2 *fu* (Osaka, Kyoto) + 43 *ken* | ✔ correct | https://www.soumu.go.jp/ ; https://en.wikipedia.org/wiki/Prefectures_of_Japan | H |
| 14,125 islands, GSI, 2023 (FACTS) | 14,125. GSI announced it in Feb 2023 after counting islands of ≥100 m coastline on its 2022 digital maps. The previous official figure was 6,852 (Japan Coast Guard, 1987). | ✔ correct | https://www.gsi.go.jp/ (press release, Feb 2023) ; https://en.wikipedia.org/wiki/List_of_islands_of_Japan | H |
| 111 active volcanoes (FACTS) | 111 (JMA definition: erupted within ~10,000 years or with active fumaroles) | ✔ correct | https://www.data.jma.go.jp/vois/data/tokyo/STOCK/kaisetsu/katsukazan_toha/katsukazan_toha.html (check URL) ; https://en.wikipedia.org/wiki/List_of_volcanoes_in_Japan | H |
| 51 watched around the clock (FACTS note) | 50 since 2016 (after the 2014 Ontake eruption). 51 not confirmed. | ⚠ soften, see §1.2 | JMA "常時観測火山" page | M/L |
| 320 km/h top Shinkansen service speed (FACTS) | 320 km/h, E5/H5 Hayabusa (and E6 Komachi coupled), Utsunomiya–Morioka, since 2013 | ✔ correct, see §1.2 for precision | https://www.jreast.co.jp/multi/en/ ; https://en.wikipedia.org/wiki/E5_Series_Shinkansen | H |
| "one of the fastest railways on Earth" (Numbers intro) | 320 km/h is among the world's top commercial speeds (China runs some lines at 350 km/h) | ✔ fair ("one of") | as above | H |
| 4 seasons (Hero meta) | — | ✔ | — | H |
| `TOKYO 35°41′N 139°41′E` (compass ring) | Tokyo Metropolitan Government Building ≈ 35°41′22″N 139°41′30″E | ✔ correct | https://en.wikipedia.org/wiki/Tokyo | H |
| Tokyo time = JST (TokyoClock) | UTC+9, no daylight saving | ✔ | — | H |

### 2.2 Hero tri-fold (`TriFold.jsx`)

| Claim | Verdict | Verify against | Conf. |
| --- | --- | --- | --- |
| Mount Fuji, Japan's highest peak, 3,776 m, between Shizuoka and Yamanashi | ✔ correct. GSI's 2014 survey gives 3,775.63 m, conventionally 3,776 m. UNESCO World Heritage (cultural) since 2013. | https://whc.unesco.org/en/list/1418/ ; https://www.gsi.go.jp/ | H |
| "Nihon … literally means 'origin of the sun'" | ✔ correct: 日本 = sun + origin | https://en.wikipedia.org/wiki/Names_of_Japan | H |
| Seigaiha "wishes for calm seas and good fortune" | ⚠ loose, see §1.3 | https://en.wikipedia.org/wiki/Seigaiha (and Japanese pattern references) | M |
| Fushimi Inari ~10,000 torii, donated by worshippers (proposed) | ✔ **Log ✔** | https://inari.jp/en/history/ ; https://www.japan-guide.com/e/e3915.html | H |
| Shibuya Crossing, up to ~3,000 people per green (proposed) | ✔ **Log ✔** (other sources say 2,500–3,000, hence "about") | https://en.wikipedia.org/wiki/Shibuya_Crossing ; https://www.cnbc.com/shibuya-discover-the-beating-heart-of-tokyo/ | M/H |

### 2.3 Seasons (`data/seasons.js`, `SEASON_LINES`, `japanTime.js`)

| Claim | Verdict | Verify against | Conf. |
| --- | --- | --- | --- |
| Spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb | ✔ matches JMA's convention. `seasonIdForMonth` agrees. | https://www.jma.go.jp/jma/kishou/know/yougo_hp/toki.html (check URL) | H |
| 春 はる haru · 夏 なつ natsu · 秋 あき aki · 冬 ふゆ fuyu; 四季 shiki | ✔ | — | H |
| Sakura front travels north towards Hokkaidō week by week | ✔ Somei-yoshino open in Kyūshū/Tokyo from late March and in Hokkaidō from late April–May. Okinawa's *kanhizakura* (Jan–Feb) is separate. | https://www.jma.go.jp/ (sakura observations) ; https://www.japan.travel/en/ | H |
| Summer: matsuri, river fireworks, cool Japan Alps | ✔ | — | H |
| Autumn leaves move from north to south | ✔ They also move from the mountains down (see optional §1.5). | https://www.japan.travel/en/ | H |
| Winter: Hokkaidō powder snow, outdoor onsen | ✔ | — | H |
| `MONTH_NOTES` (Jan shrine visits … Dec illuminations) | ✔ all reasonable. Jul "Gion Matsuri in Kyoto" is **Log ✔** (the whole of July). Sep "moon viewing": the 15th night falls in mid-Sep to early Oct. | kyoto log | H/M |

### 2.4 Regions (`data/regions.js`, Regions section copy)

| Region | Current blurb | Verdict | Conf. |
| --- | --- | --- | --- |
| Hokkaidō 北海道 ほっかいどう | Powder snow, lavender fields and wide-open wilderness. | ✔ Niseko etc. for powder; lavender around Furano/Nakafurano in July; Shiretoko and Daisetsuzan for wilderness | H |
| Tōhoku 東北 とうほく | Quiet mountain onsen, summer festivals and apple country. | ✔ Aomori grows over half of Japan's apples (M on the share; not printed) | H |
| Kantō 関東 かんとう | Tokyo, Yokohama, Nikkō and the Kamakura coast. | ✔ | H |
| Chūbu 中部 ちゅうぶ | Mount Fuji, the Japan Alps and old post towns. | ✔ Fuji lies in Shizuoka/Yamanashi (both Chūbu). Post towns: Tsumago, Magome, Narai on the Nakasendō | H |
| Kansai 関西 かんさい | Kyoto’s temples, Osaka’s street food and Nara’s deer. | ✔ The region's formal name is Kinki (近畿); "Kansai" is common usage and fine | H |
| Chūgoku 中国 ちゅうごく | Hiroshima, Miyajima and the Seto Inland Sea. | ✔ | H |
| Shikoku 四国 しこく | The 88-temple pilgrimage and deep river gorges. | ✔ Ōboke/Koboke and the Iya Valley (Yoshino River) | H |
| Kyūshū & Okinawa 九州・沖縄 | Volcanoes, hot-spring towns and subtropical islands. | ✔ Aso, Sakurajima; Beppu, Yufuin; Okinawa, Amami | H |
| "Eight regions, one archipelago"; "From Hokkaidō’s powder snow to Okinawa’s coral coves" | ✔ (the traditional eight *chihō*) | H |
| Rail line north→south, bridge Chūgoku→Shikoku | ✔ see §1.4 | H |

### 2.5 Words, labels and Japanese (`WORDS`, `SECTIONS`, `STEPS`, CtaBand, TriFold back)

| Item | Verdict |
| --- | --- |
| 旅 tabi journey · 桜 sakura cherry blossom · 温泉 onsen hot spring · 祭 matsuri festival | ✔ |
| 侘び寂び wabi-sabi · 一期一会 ichigo ichie "one time, one meeting" (literal) · 木漏れ日 komorebi · おもてなし omotenashi | ✔ (optional wabi-sabi tweak in §1.6) |
| 間 ma "negative space" | ⚠ loose, see §1.6 |
| 生き甲斐 ikigai · 金継ぎ kintsugi "mending with gold" (lacquer dusted with gold) · 花見 hanami · 森林浴 shinrin-yoku (term coined 1982 by the Forestry Agency) | ✔ |
| 紅葉 momiji "autumn maple leaves" | ✔ (紅葉 is also read *kōyō*, "autumn colours"; both readings are standard) |
| 月見 tsukimi · 風鈴 fūrin · 物の哀れ mono no aware (often written もののあわれ) · 縁 en | ✔ |
| Running heads 表紙 言葉 特集 四季 地方 使い方 数字 声 制作 | ✔ |
| 探す sagasu · めくる mekuru · 作る tsukuru; 旅を作ろう; seal 作 "to make"; またね "Mata ne — see you soon"; 日本の旅; 日本海 Sea of Japan; 太平洋 Pacific Ocean; 日本地図 | ✔ |
| Categories 都市 寺社 自然 島 食 温泉 祭 工芸 and kana | ✔ (no factual claims) |

---

## 3. Regions: proposed "known for" line and representative place (for the real map)

One pin per region. Coordinates are decimal degrees (4 places). Every photo slot below is in `home.json`.

| Region | Proposed `knownFor` (one line) | Place (en / jp) | lat, lng | Coord. source / conf. | Facts for the card | Photo slot |
| --- | --- | --- | --- | --- | --- | --- |
| Hokkaidō | Powder snow, Furano’s July lavender, Ainu heritage and the wild Shiretoko Peninsula. | Shiretoko Five Lakes / 知床五湖 | 44.1200, 145.0830 | memory, **L** (±1 km) | Shiretoko: UNESCO World Heritage (natural) 2005 (H; https://whc.unesco.org/en/list/1193/). Upopoy (National Ainu Museum) opened 2020 (H). | `home-region-hokkaido` |
| Tōhoku | August lantern festivals, apple orchards, mountain onsen and Bashō’s Narrow Road. | Yamadera (Risshaku-ji) / 山寺（立石寺） | 38.3125, 140.4375 | memory, **L** | Founded 860 by the monk Ennin (M/H). About 1,000 stone steps to the Okunoin (M; often 1,015). Bashō's cicada haiku, 1689 (H). https://www.rissyakuji.jp/ (check URL) | `home-region-tohoku` |
| Kantō | Tokyo and Yokohama, the shrines of Nikkō, Kamakura’s Great Buddha and Hakone’s hot springs. | Sensō-ji, Asakusa / 浅草寺 | 35.7148, 139.7967 | **Log ✔** (tokyo log, Wikipedia main hall) | Tokyo's oldest temple; traces its story to 628 (**Log ✔**: https://senso-ji.jp/english/). Lit at night (**Log ✔**). | `home-region-kanto` |
| Chūbu | Mount Fuji, the Japan Alps, thatched Shirakawa-gō and castle towns like Matsumoto. | Matsumoto Castle / 松本城 | 36.2386, 137.9689 | memory (Wikipedia infobox), **M** | National Treasure; one of five castles whose keeps are National Treasures and one of twelve original keeps (H). Main keep from the 1590s (M). https://www.matsumoto-castle.jp/ (check URL) | `home-region-chubu` |
| Kansai | Kyoto’s temples, Nara’s deer and Great Buddha, Osaka’s street food and Himeji’s white castle. | Tōdai-ji, Nara / 東大寺 | 34.6892, 135.8397 | **Log ✔** (nara log, Wikipedia) | Great Buddha consecrated 752; 14.98 m seated; hall completed 1709 (**Log ✔**: https://www.todaiji.or.jp/en/history/ ; https://narashikanko.or.jp/en/feature/daibutsu). UNESCO 1998 (https://whc.unesco.org/en/list/870/). | `home-region-kansai` |
| Chūgoku | Hiroshima’s Peace Memorial, Miyajima’s floating torii and the Seto Inland Sea. | Itsukushima Shrine, Miyajima / 厳島神社 | 34.2959, 132.3198 | matches `hiroshima-miyajima.js` and memory, **M/H** | UNESCO 1996 (H; https://whc.unesco.org/en/list/776/). The torii seems to float at high tide. About 16 m tall, from 1875; restoration ended Dec 2022 (M/H). | `home-region-chugoku` |
| Shikoku | The 88-temple pilgrimage, Iya Valley vine bridges and Dōgo’s ancient hot spring. | Iya no Kazurabashi / 祖谷のかずら橋 | 33.8750, 133.8330 | memory, **L** | A vine bridge about 45 m long and about 14 m above the river, rebuilt every three years (M). Pilgrimage ≈1,200 km around the island (M; start: Ryōzen-ji, Naruto). Miyoshi City tourism (https://miyoshi-tourism.jp/, check URL) | `home-region-shikoku` |
| Kyūshū & Okinawa | Smoking Sakurajima and Aso, Beppu’s hot springs and Okinawa’s coral seas. | Sakurajima / 桜島 | 31.5810, 130.6590 | memory, **L** (summit area) | One of Japan's most active volcanoes. The 1914 Taishō eruption joined it to the Ōsumi Peninsula (H). Ferry from Kagoshima city about 15 min, runs around the clock (M). | `home-region-kyushu` |

Alternatives if a curator prefers: Hokkaidō, Sapporo Ōdōri Park (43.0600, 141.3480, L, from `hokkaido-powder-snow.md`).
Chūbu, Mount Fuji summit (35.3606, 138.7274, M/H). Shikoku, Dōgo Onsen Honkan (33.8519, 132.7864, M).
Kyūshū, Okinawa's Shuri Castle (26.2169, 127.7194, M, from `okinawa-coral-islands.md`).

### 3.1 Every other place the home page will picture (map pins for the photo slots)

| Slot | Place | lat, lng | Coord. conf. | Key facts (for captions) | Fact conf. |
| --- | --- | --- | --- | --- | --- |
| `home-hero-fuji` | Lake Ashi / Hakone Shrine (view to Mount Fuji, summit 35.3606, 138.7274) | 35.2039, 139.0256 | **Log ✔** (hakone log) | Fuji visible on clear days, best on winter mornings (**Log ✔**) | H |
| `home-hero-torii` | Fushimi Inari Taisha, Kyoto | 34.9672, 135.7728 | **Log ✔** (kyoto log) | Founded 711; head of ~30,000 Inari shrines; ~10,000 torii; grounds always open, free (**Log ✔**) | H |
| `home-hero-shibuya` | Shibuya Crossing, Tokyo | 35.6595, 139.7005 | **Log ✔** (tokyo log) | Up to ~3,000 people per green (**Log ✔**) | M/H |
| `home-season-spring` | Hirosaki Park / Hirosaki Castle, Aomori | 40.6075, 140.4636 | memory, **M** | About 2,600 cherry trees (M). Cherry Blossom Festival late April to early May (H). Keep built 1810 (M/H), one of twelve original keeps (H). https://www.hirosakipark.jp/ (check URL) | M/H |
| `home-season-summer` | Lavender fields, Nakafurano/Furano, Hokkaidō | 43.4180, 142.4270 | memory, **L** | Lavender peaks in July (H/M). Do not name a private farm in copy. https://www.furano.ne.jp/ (check URL) | M |
| `home-season-autumn` | Kiyomizu-dera, Kyoto | 34.9950, 135.7850 | **Log ✔** (kyoto log) | Founded 778; stage ~13 m on 18 zelkova pillars; autumn night opening 21–30 Nov 2026 (**Log ✔**: https://www.kiyomizudera.or.jp/en/) | H |
| `home-season-winter` | Ogimachi, Shirakawa-gō, Gifu | 36.2578, 136.9061 | memory, **M** | UNESCO 1995 with Gokayama (H; https://whc.unesco.org/en/list/734/). Steep *gasshō-zukuri* thatched roofs shed heavy snow (H). Winter light-ups Jan–Feb, recently by reservation only (M). | H/M |
| `home-cat-cities` | Tokyo Skytree | 35.7101, 139.8107 | **Log ✔** (tokyo log) | 634 m, Japan's tallest structure (**Log ✔**); opened 2012 (H) | H |
| `home-cat-heritage` | Kinkaku-ji, Kyoto | 35.0395, 135.7285 | **Log ✔** (kyoto log) | Yoshimitsu's villa, Zen temple after 1408; burned by arson 1950; rebuilt 1955; 9:00–17:00, ¥500 (**Log ✔**: https://www.shokoku-ji.jp/en/kinkakuji/) | H |
| `home-cat-nature` | Kamikōchi (Kappa-bashi), Nagano | 36.2516, 137.6375 | memory, **L** | Valley at about 1,500 m under the Hotaka peaks. Closed to private cars. Open mid/late April to mid-November (H/M; matches `japan-alps.js`). https://www.kamikochi.or.jp/ (check URL) | H/M |
| `home-cat-islands` | Kabira Bay, Ishigaki, Okinawa | 24.4526, 124.1442 | memory, **L** | National Place of Scenic Beauty (M). Swimming not allowed; glass-bottom boats (H/M). | M |
| `home-cat-food` | Dōtonbori, Osaka (Ebisu-bashi) | 34.6687, 135.5013 | matches `osaka-kuidaore.js`, **M** | Canal begun 1612 by Yasui Dōton; Osaka's *kuidaore* ("eat till you drop") culture (M/H) | M/H |
| `home-cat-onsen` | Dōgo Onsen Honkan, Matsuyama, Ehime | 33.8519, 132.7864 | memory (Wikipedia), **M** | Bathhouse built 1894; Important Cultural Property (1994). Dōgo is counted among Japan's oldest hot springs. Long restoration finished in 2024 (M). https://dogo.jp/ (check URL) | H/M |
| `home-cat-festivals` | Gion Matsuri, Kyoto (Yasaka Shrine) | 35.0036, 135.7786 | **Log ✔** (kyoto log, Yasaka Shrine) | All of July; float processions 17 and 24 July (**Log ✔**: https://www.yasaka-jinja.or.jp/en/yearly_events/ ; https://www.japan-guide.com/e/e3942.html). On UNESCO's intangible list, now within "Yama, Hoko, Yatai" (2016) (M/H). | H |
| `home-cat-craft` | Higashi Chaya district, Kanazawa | 36.5725, 136.6670 | memory, **M/L** | Kanazawa makes almost all (≈99%) of Japan's gold leaf (H/M). Teahouse district from 1820 (M). https://www.kanazawa-kankoukyoukai.or.jp/ (check URL) | M |

---

## 4. Photos (`src/data/photos/manifest/home.json`)

23 slots, ids prefixed `home-`. `use`: hero and seasons `cover` (portrait/tall panels), regions `wide`, categories `any`.

> ⚠ **Read before running `npm run photos:fetch`.** `fetch.mjs` takes the **first** candidate that exists and has a free
> licence. Slots marked ✘ below hold **unverified guesses**: they are plain titles that name the subject, but no Commons
> search was possible. Run `npm run photos:candidates -- home` first and look at the contact sheets. Then set `"file"`
> on each slot (or replace the candidates) and check that `alt`/`caption` match the chosen picture. The alt texts are
> written generically so they hold for most photos of the subject.

| Slot | Subject | Candidates | Status | Where to look on Commons |
| --- | --- | --- | --- | --- |
| `home-hero-fuji` | Mount Fuji over Lake Ashi | Lake Ashi & Mt Fuji & Hakone Shrine.jpg · Mount Fuji from Lake Ashi 20211202-2.jpg · View of Mount Fuji from Lake Ashi.jpg | ✔ search-verified (hakone log) | Upgrade to Chūreitō if a good portrait exists: Category:Chūreitō (Arakurayama Sengen Park), then change caption/place (Arakurayama Sengen Park, Fujiyoshida, 35.5011, 138.8019, **L**) |
| `home-hero-torii` | Senbon Torii, Fushimi Inari | Torii path with lantern … Kyoto, Japan.jpg (POTD 2024, 5765×3843) · Double torii path … .jpg · Fushimi Inari-taisha senbon-torii, August 2019.jpg | ✔ (kyoto log) | — |
| `home-hero-shibuya` | Shibuya Crossing at night | Shibuya crossing at night.jpg (portrait 3,024×4,032) · Shibuya Crossing at night (14738088849).jpg · 2025 Shibuya Crossing at night.jpg | ✔ (tokyo log) | Titles are case-sensitive after the first letter; `Shibuya Crossing at night.jpg` (capital C) is a different file |
| `home-season-spring` | Hirosaki Castle, cherry blossom | Hirosaki Castle and cherry blossoms.jpg · Hirosaki Castle in spring.jpg · 弘前城と桜.jpg | ✘ guess | Category:Hirosaki Castle; Category:Cherry blossoms in Hirosaki Park. Fallback subject: Philosopher's Path (Category:Philosopher's Walk) or Himeji Castle in spring; update caption/place |
| `home-season-summer` | Lavender, Furano | Lavender field in Furano.jpg · Furano lavender field.jpg · 富良野のラベンダー畑.jpg | ✘ guess | Category:Furano; Category:Lavender fields in Japan; Category:Farm Tomita. If a festival is preferred: Gion Matsuri floats by day (old floats, so no artwork-copyright problem). Avoid Nebuta floats (living artists; Japanese freedom of panorama does not cover non-permanent artworks) |
| `home-season-autumn` | Kiyomizu-dera in autumn | Kiyomizu-dera, Kyoto, November 2016 -01.jpg (FP/VI/POTD, 5852×3601) · … -02.jpg (QI) · Kiyomizu-dera in Kyoto-r.jpg | ✔ (kyoto log) | #3's season is unknown, so check that it shows autumn colour |
| `home-season-winter` | Shirakawa-gō in snow | Shirakawa-go in winter.jpg · Shirakawago in winter.jpg · 白川郷の冬.jpg | ✘ guess | Category:Ogimachi (Shirakawa); Category:Shirakawa-gō in winter. Daytime snow scenes, not the night light-up |
| `home-region-hokkaido` | Shiretoko Five Lakes | Shiretoko Goko.jpg · Shiretoko Five Lakes.jpg · 知床五湖.jpg | ✘ guess | Category:Shiretoko Five Lakes; Category:Shiretoko National Park |
| `home-region-tohoku` | Yamadera | Yamadera Godaido.jpg · Yamadera.jpg · 山寺五大堂.jpg | ✘ guess | Category:Risshaku-ji; Category:Godaidō (Yamadera). The Godaidō on the cliff is the classic view |
| `home-region-kanto` | Sensō-ji at night | Sensoji at night.JPG (4,872×3,208) · Sensoji at night 7.jpg · Night scenes at Sensou-ji, Tokyo-P1000768.JPG | ✔ (tokyo log) | — |
| `home-region-chubu` | Matsumoto Castle | Matsumoto Castle.jpg · Matsumoto-jo.jpg · 松本城.jpg | ✘ guess | Category:Matsumoto Castle (look for FP/QI; the view with the red Uzumi-bashi bridge or the Alps behind) |
| `home-region-kansai` | Tōdai-ji Great Buddha Hall | The Great Buddha Hall of Tōdai-ji, Nara, November 2016.jpg · Tōdai-ji Great Buddha Hall-2.jpg · Tōdai-ji Daibutsuden, June 2019.jpg | ✔ (nara log) | — |
| `home-region-chugoku` | Itsukushima torii | Itsukushima Gate.jpg · Itsukushima torii distance.jpg · Itsukushima torii angle.jpg | ✘ guess (editor recalls these as older Featured Pictures, M) | Category:Great Torii of Itsukushima Shrine. Pre-2019 photos are fine: the restoration did not change its look |
| `home-region-shikoku` | Iya Kazurabashi | Iya Kazurabashi.jpg · Kazurabashi.jpg · 祖谷のかずら橋.jpg | ✘ guess | Category:Kazura-bashi (Iya); Category:Iya Valley. Fallback: Ōboke Gorge |
| `home-region-kyushu` | Sakurajima | Sakurajima.jpg · Sakurajima from Shiroyama.jpg · Sakurajima and Kagoshima.jpg | ✘ guess | Category:Sakurajima. Prefer a view across the bay from Shiroyama; an eruption plume is fine if not mostly dark |
| `home-cat-cities` | Tokyo Skytree at night | Tokyo Skytree at night (Iki).jpg (3,314×4,705) · … (Miyabi).jpg · Tokyo Sky Tree at night.JPG | ✔ (tokyo log) | — |
| `home-cat-heritage` | Kinkaku-ji | Kinkaku-ji the Golden Temple … high rez.JPG · Water reflection of Kinkaku-ji … .jpg · Kinkaku-ji (-Temple of the Golden Pavilion-) seen across Kyōko-chi … -2.jpg | ✔ (kyoto log) | — |
| `home-cat-nature` | Kamikōchi | Kappabashi Kamikochi.jpg · Kamikochi.jpg · 上高地 河童橋.jpg | ✘ guess | Category:Kamikōchi; Category:Kappa-bashi; Category:Taishō-ike |
| `home-cat-islands` | Kabira Bay, Ishigaki | Kabira Bay.jpg · Kabira Bay, Ishigaki.jpg · 川平湾.jpg | ✘ guess | Category:Kabira Bay |
| `home-cat-food` | Dōtonbori | Dotonbori at night.jpg · Dotonbori.jpg · 道頓堀.jpg | ✘ guess | Category:Dōtonbori. Signs are fine as part of the street scene; avoid a single logo filling the frame |
| `home-cat-onsen` | Dōgo Onsen Honkan | Dogo Onsen Honkan.jpg · Dōgo Onsen Honkan.jpg · 道後温泉本館.jpg | ✘ guess | Category:Dōgo Onsen Honkan. Prefer a photo without the 2019–2024 scaffolding and art wrap, or caption it with the year |
| `home-cat-festivals` | Gion Matsuri float | Gion Matsuri Naginata-boko.jpg · Gion Matsuri Yamaboko Junko.jpg · 祇園祭 長刀鉾.jpg | ✘ guess | Category:Gion Matsuri; Category:Yamaboko Junkō; Category:Naginata-boko. Float as subject, not close-ups of people |
| `home-cat-craft` | Higashi Chaya, Kanazawa | Higashi Chaya District, Kanazawa.jpg · Higashi Chaya, Kanazawa.jpg · ひがし茶屋街.jpg | ✘ guess | Category:Higashi Chaya District. Alternative subject: Arita porcelain town (Category:Arita, Saga) |

All titles above are written without the `File:` prefix for readability; the manifest has the exact `File:` titles.

---

## 5. Not verified / left out

- Exact number of JMA continuously monitored volcanoes (50 vs 51): softened to "about 50" until checked.
- Every **M/L** coordinate in §3 (Shiretoko, Yamadera, Kazurabashi, Sakurajima, Furano, Kamikōchi, Kabira, Kanazawa, haiku
  postcards). Check against Wikipedia infoboxes and OpenStreetMap before they drive the map.
- Hirosaki tree count (≈2,600), Kazurabashi dimensions, Dōgo restoration end date, Kanazawa gold-leaf share,
  Sakurajima ferry details: not to be printed until checked.
- Issa haiku year (1812) and Bashō's Fukagawa attribution for *furuike*: wording kept to "Fukagawa, Edo"; year M.
- All 15 ✘ photo slots: titles unverified (see §4).
- No prices, hours or 2027 dates are proposed for the home page.
