import { useEffect, useState } from 'react';
import { BrochurePage } from '../components/brochure/BrochurePage.jsx';
import { CoverArt } from '../components/brochure/CoverArt.jsx';
import { Button, Chip, Field, Select, Switch } from '../components/ui/index.js';
import { BROCHURES } from '../data/brochures.js';
import { ART_LABELS, ART_STYLES, PAGE_TYPE_IDS } from '../data/schema.js';
import styles from './Playground.module.css';

const SECTIONS = [
  { id: 'art', label: 'Art styles' },
  { id: 'pages', label: 'All pages' },
  { id: 'large', label: 'Large brochure' },
  { id: 'empty', label: 'Empty pages' },
];
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
