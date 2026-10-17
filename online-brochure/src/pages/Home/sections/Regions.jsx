import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react';
import { CoverArt } from '../../../components/brochure/CoverArt.jsx';
import { ErrorBoundary } from '../../../components/layout/ErrorBoundary.jsx';
import { Photo } from '../../../components/photo/Photo.jsx';
import { Button, IconButton, VerticalText } from '../../../components/ui/index.js';
import { useBrochures } from '../../../context/BrochureContext.jsx';
import { hasKey } from '../../../data/lookup.js';
import { getPhoto } from '../../../data/photos/index.js';
import { REGIONS, REGION_MAP } from '../../../data/regions.js';
import { pad, pluralize } from '../../../lib/format.js';
import { ease, fadeUp, viewportOnce } from '../../../lib/motion.js';
import { MAP_SOURCE, REGION_NOTES, SECTIONS } from '../homeContent.js';
import { busiestId, countBy } from '../homeStats.js';
import { stepId } from './regionMap.js';
import { SectionHead } from './SectionHead.jsx';
import styles from './Regions.module.css';

// The map and its prefecture outlines are their own chunk, fetched as the section nears the viewport.
const RegionsMap = lazy(() => import('./RegionsMap.jsx'));

const IDS = REGIONS.map((r) => r.id);
/** A pointer sweeping across the map previews a region only once it rests on it. */
const PREVIEW_MS = 90;
/** The art plate (until a photo is downloaded) is printed matter: fixed colours in both themes. */
const PRINT = { paper: '#f4eee2', ink: '#22140f', accent: '#d23a22', accent2: '#1d4f7a', muted: '#6e5b4f' };

const card = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: ease.in } },
};
const settle = {
  initial: { scale: 1.06 },
  animate: { scale: 1, transition: { duration: 1.1, ease: ease.out } },
};
const rise = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out, delay: 0.08 } },
};

/** Holds the map's place (same aspect ratio) until its chunk arrives. */
function MapPlaceholder() {
  return <div className={styles.placeholder} aria-hidden="true" />;
}

/** If the map's chunk cannot be fetched (offline, a stale deploy), the page stays whole: the card's pager still travels. */
function MapUnavailable() {
  return (
    <div className={styles.placeholder} data-failed="">
      <p className={styles.failed}>The map could not load. Use the arrows beside the region card to travel.</p>
    </div>
  );
}

/**
 * The chosen region's card: its photograph (or, until it is downloaded, a
 * generative plate), the Japanese name set vertically, what the region is
 * known for, one place to see, its brochure count and a link into the
 * Library. Cards cross-fade in place. Not a live region: hovering or
 * arrowing across the map would read the whole card out each time; it is
 * next in the tab order instead, with its own previous/next pager.
 */
function RegionCard({ region, index, count, onStep }) {
  const note = REGION_NOTES[region.id];
  const photo = getPhoto(note?.photo);
  const hasPhoto = Boolean(photo?.available);
  const prev = REGION_MAP[stepId(IDS, region.id, -1)];
  const next = REGION_MAP[stepId(IDS, region.id, 1)];

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.cardMeta}>{count > 0 ? pluralize(count, 'brochure') : 'No brochures yet'}</p>
        <div className={styles.pager}>
          <IconButton label={`Previous region: ${prev.label}`} icon={<ArrowLeft />} variant="outline" size="sm" tooltipSide="top" onClick={() => onStep(-1)} />
          <span className={styles.pagerCount} aria-hidden="true">
            {pad(index + 1)} <span>/ {pad(REGIONS.length)}</span>
          </span>
          <IconButton label={`Next region: ${next.label}`} icon={<ArrowRight />} variant="outline" size="sm" tooltipSide="top" onClick={() => onStep(1)} />
        </div>
      </div>

      <div className={styles.stack}>
        <AnimatePresence initial={false}>
          <motion.div key={region.id} className={styles.cardInner} {...card}>
            <div className={styles.plate}>
              <motion.div className={styles.plateInner} {...settle}>
                <Photo
                  id={note?.photo}
                  sizes="(min-width: 900px) 42vw, 100vw"
                  credit="overlay"
                  fallback={<CoverArt style={note?.art} seed={note?.seed} theme={PRINT} />}
                />
              </motion.div>
            </div>

            <motion.div className={styles.cardBody} {...rise}>
              <VerticalText className={styles.cardJp}>{region.jp}</VerticalText>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{region.label}</h3>
                <p className={styles.knownFor}>{note?.knownFor || region.blurb}</p>
                {note && (
                  <p className={styles.place}>
                    <span className={styles.placeLabel}>{hasPhoto ? 'Pictured' : 'Highlight'}</span>
                    <span className={styles.placeName}>{hasPhoto && photo.caption ? photo.caption : note.place}</span>
                    <span lang="ja" className={styles.placeJp}>
                      {note.placeJp}
                    </span>
                  </p>
                )}
                <div className={styles.cardActions}>
                  {count > 0 ? (
                    <Button to={`/brochures?region=${region.id}`} variant="primary" iconRight={<ArrowRight />}>
                      {`Browse ${region.label}`}
                    </Button>
                  ) : (
                    <Button to="/studio" variant="secondary" iconRight={<PenLine />}>
                      Make the first one
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </article>
  );
}

/**
 * 05 地方 — Japan's eight regions on the accurate map (<JapanMap>, loaded
 * lazily as the section nears the viewport) beside a card for the chosen
 * region. Hover or focus a region to preview it, click or press it to
 * choose it; arrow keys travel across the map and the card has a pager.
 * Opens on the region with the most brochures.
 */
export function Regions() {
  const { brochures } = useBrochures();
  const counts = useMemo(() => countBy(brochures, 'region'), [brochures]);
  const [activeId, setActiveId] = useState(() => busiestId(counts, IDS));
  const sectionRef = useRef(null);
  const timer = useRef(0);
  const near = useInView(sectionRef, { once: true, margin: '900px 0px' });
  const region = REGION_MAP[activeId] ?? REGIONS[0];
  const index = IDS.indexOf(region.id);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const select = useCallback((id) => {
    window.clearTimeout(timer.current);
    if (hasKey(REGION_MAP, id)) setActiveId(id);
  }, []);

  // Pointer / focus: wait for the pointer to rest; leaving the map cancels a pending preview.
  const preview = useCallback(
    (id) => {
      window.clearTimeout(timer.current);
      if (id) timer.current = window.setTimeout(() => select(id), PREVIEW_MS);
    },
    [select],
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className="container">
        <SectionHead
          section={SECTIONS.regions}
          title={['Eight regions, ', { text: 'one', className: 'serif-italic' }, ' archipelago']}
          intro="From Hokkaidō’s powder snow to Okinawa’s coral coves. Hover or tab through the map — arrow keys travel across it."
        />

        <div className={styles.layout}>
          <motion.figure className={styles.print} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <div className={styles.printHead} aria-hidden="true">
              <span lang="ja">日本地図</span>
              <span>The eight regions</span>
              <span className={styles.compass}>N ↑</span>
            </div>

            <div className={styles.mapSlot}>
              {near ? (
                <ErrorBoundary fallback={() => <MapUnavailable />}>
                  <Suspense fallback={<MapPlaceholder />}>
                    <RegionsMap activeId={region.id} onPreview={preview} onSelect={select} />
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <MapPlaceholder />
              )}
            </div>

            <figcaption className={styles.caption}>
              <span>{MAP_SOURCE}</span>
              <span className={styles.keys} aria-hidden="true">
                Tab · ← ↑ → ↓ to travel
              </span>
              <span className={styles.tap} aria-hidden="true">
                Tap a region
              </span>
            </figcaption>
          </motion.figure>

          <RegionCard region={region} index={index} count={counts[region.id] ?? 0} onStep={(delta) => select(stepId(IDS, region.id, delta))} />
        </div>
      </div>
    </section>
  );
}
