import { useEffect, useState } from 'react';
import { BrochurePage } from '../components/brochure/BrochurePage.jsx';
import { CoverArt } from '../components/brochure/CoverArt.jsx';
import { themeVars } from '../components/brochure/blocks/pageUtils.js';
import { JapanMap } from '../components/map/JapanMap.jsx';
import { Photo } from '../components/photo/Photo.jsx';
import { Button, Chip, Field, Select, Switch } from '../components/ui/index.js';
import { BROCHURES } from '../data/brochures.js';
import { ART_LABELS, ART_STYLES, PAGE_TYPE_IDS } from '../data/schema.js';
import styles from './Playground.module.css';

const SECTIONS = [
  { id: 'art', label: 'Art styles' },
  { id: 'pages', label: 'All pages' },
  { id: 'large', label: 'Large brochure' },
  { id: 'empty', label: 'Empty pages' },
  { id: 'map', label: 'Map' },
  { id: 'photo', label: 'Photo states' },
  { id: 'real', label: 'Place & map pages' },
];

/** Real places for the new page types (coordinates WGS84, 4 decimals). */
const REAL_PAGES = [
  {
    id: 'demo-place',
    type: 'place',
    kicker: 'Spotlight',
    name: 'Kiyomizu-dera',
    nameJp: '清水寺',
    photo: 'kyoto-kiyomizu-dera',
    body: 'A Buddhist temple on the slopes of Mount Otowa, founded in 778. Its main hall stands on a wooden stage held up by tall pillars, built without nails.\n\nCome at opening time for the view over the city before the crowds.',
    facts: [
      { label: 'Hours', value: 'Usually from 6:00; closing varies by season' },
      { label: 'Getting there', value: 'Bus to Gojōzaka or Kiyomizu-michi, then a 10-minute walk uphill' },
      { label: 'Time needed', value: '1–1.5 hours' },
    ],
    lat: 34.9949,
    lng: 135.785,
    website: 'https://www.kiyomizudera.or.jp/en/',
  },
  {
    id: 'demo-map',
    type: 'map',
    heading: 'Where it all is',
    body: 'The places in this brochure, from the southern shrine gates to the western hills.',
    places: [
      { name: 'Fushimi Inari Taisha', nameJp: '伏見稲荷大社', lat: 34.9671, lng: 135.7727, note: 'JR Inari Station' },
      { name: 'Kiyomizu-dera', nameJp: '清水寺', lat: 34.9949, lng: 135.785, note: 'Higashiyama' },
      { name: 'Gion', nameJp: '祇園', lat: 35.0037, lng: 135.7788, note: 'Yasaka Shrine' },
      { name: 'Kinkaku-ji', nameJp: '金閣寺', lat: 35.0394, lng: 135.7292, note: 'Northern hills' },
      { name: 'Arashiyama', nameJp: '嵐山', lat: 35.017, lng: 135.6713, note: 'Bamboo grove' },
    ],
  },
  {
    id: 'demo-quote',
    type: 'quote',
    quoteJp: '古池や蛙飛び込む水の音',
    quote: 'The old pond — a frog jumps in, the sound of water.',
    author: 'Matsuo Bashō',
    role: '1686 · Translation: Tabi Guides',
  },
];

/**
 * A test card drawn on a canvas at runtime (never a real photograph, never
 * written to public/photos), wrapped as a photo record so <Photo> can be
 * tried before any real photo is downloaded.
 */
function useTestCard() {
  const [record, setRecord] = useState(null);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1067;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const sky = ctx.createLinearGradient(0, 0, 0, 1067);
    sky.addColorStop(0, '#f2c9a0');
    sky.addColorStop(0.55, '#d96f4a');
    sky.addColorStop(1, '#3b2a33');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1600, 1067);
    ctx.fillStyle = '#f7e6c8';
    ctx.beginPath();
    ctx.arc(1120, 380, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1d24';
    ctx.beginPath();
    ctx.moveTo(0, 1067);
    ctx.lineTo(0, 760);
    ctx.lineTo(420, 520);
    ctx.lineTo(760, 700);
    ctx.lineTo(1100, 560);
    ctx.lineTo(1600, 820);
    ctx.lineTo(1600, 1067);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '600 44px ui-monospace, monospace';
    ctx.fillText('TEST CARD · not a real photograph', 60, 100);
    const tiny = document.createElement('canvas');
    tiny.width = 24;
    tiny.height = 16;
    tiny.getContext('2d').drawImage(canvas, 0, 0, 24, 16);
    let url = '';
    canvas.toBlob((blob) => {
      if (!blob) return;
      url = URL.createObjectURL(blob);
      setRecord({
        id: 'test-card',
        alt: 'A test card: a sunset gradient behind a dark mountain ridge',
        caption: 'Test card',
        focus: '70% 40%',
        width: 1600,
        height: 1067,
        widths: [1600],
        lqip: tiny.toDataURL('image/png'),
        color: '#b65a44',
        credit: { author: 'Tabi test card', authorUrl: '', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', sourceUrl: 'https://example.com/test-card' },
        attributionRequired: false,
        available: true,
        src: () => url,
        srcSet: `${url} 1600w`,
      });
    }, 'image/png');
    return () => url && URL.revokeObjectURL(url);
  }, []);
  return record;
}

/** Real places (WGS84, 4 decimals) for the map workbench. */
const MAP_SETS = {
  japan: [
    { id: 'sapporo', lat: 43.0618, lng: 141.3545, label: 'Sapporo', labelJp: '札幌' },
    { id: 'tokyo', lat: 35.6812, lng: 139.7671, label: 'Tokyo', labelJp: '東京' },
    { id: 'kamikochi', lat: 36.2486, lng: 137.6386, label: 'Kamikōchi', labelJp: '上高地' },
    { id: 'kyoto', lat: 34.9858, lng: 135.7588, label: 'Kyoto', labelJp: '京都' },
    { id: 'miyajima', lat: 34.2959, lng: 132.3199, label: 'Itsukushima', labelJp: '厳島' },
    { id: 'naha', lat: 26.2172, lng: 127.7195, label: 'Shuri Castle', labelJp: '首里城' },
    { id: 'ishigaki', lat: 24.3448, lng: 124.1572, label: 'Ishigaki', labelJp: '石垣' },
  ],
  kyoto: [
    { id: 'inari', lat: 34.9671, lng: 135.7727, label: 'Fushimi Inari Taisha', labelJp: '伏見稲荷大社' },
    { id: 'kiyomizu', lat: 34.9949, lng: 135.785, label: 'Kiyomizu-dera', labelJp: '清水寺' },
    { id: 'gion', lat: 35.0037, lng: 135.7788, label: 'Gion', labelJp: '祇園' },
    { id: 'kinkaku', lat: 35.0394, lng: 135.7292, label: 'Kinkaku-ji', labelJp: '金閣寺' },
    { id: 'arashiyama', lat: 35.017, lng: 135.6713, label: 'Arashiyama', labelJp: '嵐山' },
  ],
  okinawa: [
    { id: 'shuri', lat: 26.2172, lng: 127.7195, label: 'Shuri Castle', labelJp: '首里城' },
    { id: 'churaumi', lat: 26.6944, lng: 127.8779, label: 'Churaumi Aquarium', labelJp: '美ら海水族館' },
    { id: 'kerama', lat: 26.1983, lng: 127.3533, label: 'Tokashiki', labelJp: '渡嘉敷島' },
    { id: 'ishigaki', lat: 24.3448, lng: 124.1572, label: 'Ishigaki', labelJp: '石垣島' },
    { id: 'taketomi', lat: 24.3289, lng: 124.0867, label: 'Taketomi', labelJp: '竹富島' },
  ],
  alps: [
    { id: 'matsumoto', lat: 36.2386, lng: 137.9689, label: 'Matsumoto Castle', labelJp: '松本城' },
    { id: 'kamikochi', lat: 36.2486, lng: 137.6386, label: 'Kamikōchi', labelJp: '上高地' },
    { id: 'takayama', lat: 36.1461, lng: 137.2522, label: 'Takayama', labelJp: '高山' },
    { id: 'shirakawa', lat: 36.2577, lng: 136.9063, label: 'Shirakawa-gō', labelJp: '白川郷' },
    { id: 'kanazawa', lat: 36.5621, lng: 136.6627, label: 'Kenroku-en', labelJp: '兼六園' },
  ],
};
const DEFAULT_SEEDS = [7, 23, 61];
const CROPS = { native: '1 / 1.414', '3:4': '3 / 4', '1:1': '1 / 1' };

const params = new URLSearchParams(window.location.search);
const SEEDS = params.get('seeds')?.split(',').map(Number).filter(Number.isFinite) ?? DEFAULT_SEEDS;
const STYLES = ART_STYLES.includes(params.get('style')) ? [params.get('style')] : ART_STYLES;
const EMPTY_BROCHURE = { id: 'b_empty', slug: 'empty', pages: PAGE_TYPE_IDS.map((type) => ({ id: type, type })) };

/**
 * Dev-only workbench for the brochure kit: every art style × seed × theme,
 * every page of every brochure as thumbnails, one brochure at reading size,
 * and every page type with empty fields. Query params (section, style,
 * seeds, b, crop, animate, a, z) pin a view for screenshots.
 */
export function Playground() {
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [animated, setAnimated] = useState(params.get('animate') === '1');
  const [crop, setCrop] = useState(CROPS[params.get('crop')] ? params.get('crop') : 'native');
  const [slug, setSlug] = useState(params.get('b') ?? BROCHURES[0].slug);
  const [themeA, setThemeA] = useState(params.get('a') ?? BROCHURES[0].slug);
  const [themeB, setThemeB] = useState(params.get('z') ?? BROCHURES[1].slug);
  const [activePage, setActivePage] = useState(0);
  const [cta, setCta] = useState(0);
  const [mapRegion, setMapRegion] = useState(null);
  const [pickedRegion, setPickedRegion] = useState('kansai');
  const testCard = useTestCard();
  const kyotoTheme = (BROCHURES.find((x) => x.slug === 'kyoto-thousand-gates') ?? BROCHURES[0]).theme;
  const only = params.get('section');
  const brochure = BROCHURES.find((b) => b.slug === slug) ?? BROCHURES[0];
  const themes = [themeA, themeB].map((s) => BROCHURES.find((b) => b.slug === s) ?? BROCHURES[0]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  const show = (id) => !only || only === id;
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <p className={styles.brand}>
          <span lang="ja">旅</span> Tabi kit
        </p>
        <nav className={styles.nav} aria-label="Sections">
          {SECTIONS.filter((s) => show(s.id)).map((s) => (
            <Chip key={s.id} onClick={() => jump(s.id)}>
              {s.label}
            </Chip>
          ))}
        </nav>
        <div className={styles.controls}>
          <Switch checked={animated} onChange={setAnimated} label="Animate art" />
          <Switch checked={dark} onChange={setDark} label="Dark app" />
        </div>
      </header>

      {show('art') && (
        <section id="art" className={styles.section} aria-labelledby="art-title">
          <div className={styles.sectionHead}>
            <h2 id="art-title" className={styles.title}>Art styles · 3 seeds × 2 themes</h2>
            <div className={styles.filters}>
              <Field label="Theme A">
                <Select value={themeA} onChange={(e) => setThemeA(e.target.value)}>
                  {BROCHURES.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Theme B">
                <Select value={themeB} onChange={(e) => setThemeB(e.target.value)}>
                  {BROCHURES.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Crop">
                <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
                  {Object.keys(CROPS).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
          <div className={styles.artRows}>
            {STYLES.map((style) => (
              <div key={style} className={styles.artRow}>
                <p className={styles.artName}>
                  {ART_LABELS[style].label} <span lang="ja">{ART_LABELS[style].jp}</span>
                </p>
                <div className={styles.artGrid}>
                  {themes.flatMap((b) =>
                    SEEDS.map((seed) => (
                      <figure key={`${b.slug}-${seed}`} className={styles.artTile}>
                        <div className={styles.artFrame} style={{ aspectRatio: CROPS[crop] }}>
                          <CoverArt style={style} seed={seed} theme={b.theme} animated={animated} title={`${style} ${seed}`} />
                        </div>
                        <figcaption>{`${seed} · ${b.titleJp}`}</figcaption>
                      </figure>
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {show('pages') && (
        <section id="pages" className={styles.section} aria-labelledby="pages-title">
          <h2 id="pages-title" className={styles.title}>Every page of every brochure</h2>
          {BROCHURES.map((b) => (
            <div key={b.id} className={styles.strip}>
              <p className={styles.stripTitle}>
                {b.title} <span>{`${b.pages.length} pages · ${b.cover.art}`}</span>
              </p>
              <div className={styles.thumbs}>
                {b.pages.map((page, i) => (
                  <BrochurePage key={page.id} brochure={b} page={page} index={i} total={b.pages.length} isStatic className={styles.thumb} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {show('large') && (
        <section id="large" className={styles.section} aria-labelledby="large-title">
          <div className={styles.sectionHead}>
            <h2 id="large-title" className={styles.title}>Reading size</h2>
            <div className={styles.filters}>
              <Field label="Brochure">
                <Select
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setActivePage(0);
                  }}
                >
                  {BROCHURES.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <p className={styles.note} aria-live="polite">
                {`Active page ${activePage + 1} · CTA clicks ${cta}`}
              </p>
            </div>
          </div>
          <div className={styles.large}>
            {brochure.pages.map((page, i) => (
              <div key={page.id} className={styles.largeItem}>
                <BrochurePage
                  brochure={brochure}
                  page={page}
                  index={i}
                  total={brochure.pages.length}
                  active={i === activePage}
                  onCta={() => setCta((n) => n + 1)}
                  className={styles.largePage}
                />
                <Button size="sm" variant={i === activePage ? 'accent' : 'secondary'} onClick={() => setActivePage(i)}>
                  {i === activePage ? `Page ${i + 1} is active` : `Activate page ${i + 1}`}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {show('map') && (
        <section id="map" className={styles.section} aria-labelledby="map-title">
          <h2 id="map-title" className={styles.title}>Map of Japan · Natural Earth prefectures</h2>
          <div className={styles.maps}>
            <figure className={styles.mapTile}>
              <JapanMap pins={MAP_SETS.japan} fillByRegion focus="japan" />
              <figcaption>App tokens · whole country, region tones</figcaption>
            </figure>
            <figure className={styles.mapTile}>
              <JapanMap regionLabels highlightedRegion={mapRegion ?? pickedRegion} onRegionEnter={setMapRegion} onRegionClick={setPickedRegion} />
              <figcaption aria-live="polite">{`Interactive · picked ${pickedRegion}${mapRegion ? ` · hovering ${mapRegion}` : ''}`}</figcaption>
            </figure>
            {[
              ['kyoto', 'kyoto-thousand-gates'],
              ['okinawa', 'okinawa-coral-islands'],
              ['alps', 'japan-alps'],
            ].map(([set, theme]) => {
              const b = BROCHURES.find((x) => x.slug === theme) ?? BROCHURES[0];
              return (
                <figure key={set} className={styles.mapTile}>
                  <div className={styles.mapPaper} style={themeVars(b.theme)}>
                    <JapanMap pins={MAP_SETS[set]} highlightedRegion={b.region} />
                  </div>
                  <figcaption>{`${b.title} theme · ${set} pins (zoomed)`}</figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {show('photo') && (
        <section id="photo" className={styles.section} aria-labelledby="photo-title">
          <h2 id="photo-title" className={styles.title}>Photo states · runtime test card</h2>
          <div className={styles.photos}>
            {[
              ['Loaded · overlay credit', { photo: testCard, credit: 'overlay' }],
              ['Caption credit · rounded', { photo: testCard, credit: 'caption', rounded: true }],
              ['Contain', { photo: testCard, fit: 'contain' }],
              ['Ken Burns', { photo: testCard, kenBurns: true, credit: 'overlay' }],
              ['Unknown id → fallback art', { id: 'no-such-photo' }],
              ['Listed, not downloaded → fallback art', { id: 'kyoto-senbon-torii', credit: 'overlay' }],
            ].map(([label, props], i) => (
              <figure key={label} className={styles.photoTile}>
                <div className={styles.photoBox}>
                  <Photo sizes="320px" {...props} fallback={<CoverArt style="torii" seed={5 + i} theme={kyotoTheme} />} />
                </div>
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {show('real') && (
        <section id="real" className={styles.section} aria-labelledby="real-title">
          <h2 id="real-title" className={styles.title}>Place, map and quote pages (photos not downloaded: art stands in)</h2>
          <div className={styles.large}>
            {REAL_PAGES.map((page, i) => (
              <div key={page.id} className={styles.largeItem}>
                <BrochurePage brochure={brochure} page={page} index={i + 3} total={14} active={i === activePage} className={styles.largePage} />
              </div>
            ))}
          </div>
        </section>
      )}

      {show('empty') && (
        <section id="empty" className={styles.section} aria-labelledby="empty-title">
          <h2 id="empty-title" className={styles.title}>Every page type with empty fields</h2>
          <div className={styles.thumbs}>
            {[...EMPTY_BROCHURE.pages, { id: 'mystery', type: 'mystery' }].map((page, i) => (
              <BrochurePage key={page.id} brochure={EMPTY_BROCHURE} page={page} index={i} total={EMPTY_BROCHURE.pages.length + 1} className={styles.emptyPage} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
