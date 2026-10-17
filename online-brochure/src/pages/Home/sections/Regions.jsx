import { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, PenLine } from 'lucide-react';
import { Button, VerticalText } from '../../../components/ui/index.js';
import { useBrochures } from '../../../context/BrochureContext.jsx';
import { REGIONS, REGION_MAP } from '../../../data/regions.js';
import { pad, pluralize } from '../../../lib/format.js';
import { ease, fadeUp, viewportOnce } from '../../../lib/motion.js';
import { BRIDGE_LINE, RAIL_LINE, SECTIONS } from '../homeContent.js';
import { brochuresWith, busiestId, countBy } from '../homeStats.js';
import { neighborInDirection, routePoints, tileBounds } from './regionMap.js';
import { SectionHead } from './SectionHead.jsx';
import styles from './Regions.module.css';

const BOUNDS = tileBounds(REGIONS);
const RAIL = routePoints(REGIONS, RAIL_LINE, BOUNDS);
const BRIDGE = routePoints(REGIONS, BRIDGE_LINE, BOUNDS);
/** Each tile is printed with its own traditional pattern. */
const PATTERNS = ['asanoha', 'seigaiha', 'ichimatsu', 'stripes', 'dots', 'seigaiha', 'asanoha', 'ichimatsu'];

const tileIn = {
  hidden: { opacity: 0, scale: 0.6 },
  show: (i) => ({ opacity: 1, scale: 1, transition: { duration: 0.7, ease: ease.out, delay: 0.15 + i * 0.06 } }),
};

/**
 * The open region's card: vertical kanji, blurb, count and its brochures.
 * Not a live region: the focused tile already says "Kantō, 2 brochures", and
 * re-reading the whole card on every arrow key drowned that out. The tiles
 * point here with aria-controls, and the card is next in the tab order.
 */
function RegionDetail({ id, region, count, brochures, index }) {
  return (
    <div id={id} className={styles.detail}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={region.id}
          className={styles.detailInner}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.out } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
        >
          <VerticalText className={styles.detailJp}>{region.jp}</VerticalText>
          <div className={styles.detailBody}>
            <p className={styles.detailMeta}>
              Region {pad(index + 1)} / {pad(REGIONS.length)} · {count > 0 ? pluralize(count, 'brochure') : 'No brochures yet'}
            </p>
            <h3 className={styles.detailTitle}>{region.label}</h3>
            <p className={styles.blurb}>{region.blurb}</p>
            {brochures.length > 0 && (
              <ul className={styles.list}>
                {brochures.map((b) => (
                  <li key={b.id ?? b.slug}>
                    <Link to={`/brochures/${b.slug}`} className={styles.listLink}>
                      <span>{b.title}</span>
                      {b.titleJp && (
                        <span lang="ja" className={styles.listJp}>
                          {b.titleJp}
                        </span>
                      )}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.detailActions}>
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
      </AnimatePresence>
    </div>
  );
}

/**
 * 05 地方 — Japan's eight regions as a printed mosaic on a schematic grid
 * (REGIONS[].tile), joined by a rail line. Hover or focus a tile to lift it
 * and open its card; arrow keys move across the map spatially.
 */
export function Regions() {
  const { brochures } = useBrochures();
  const counts = useMemo(() => countBy(brochures, 'region'), [brochures]);
  const [activeId, setActiveId] = useState(() => busiestId(counts, REGIONS.map((r) => r.id)));
  const tiles = useRef({});
  const detailId = `${useId()}-region-detail`;
  const region = REGION_MAP[activeId] ?? REGIONS[0];
  const regionIndex = REGIONS.findIndex((r) => r.id === region.id);
  const inRegion = useMemo(() => brochuresWith(brochures, 'region', region.id, 3), [brochures, region.id]);

  const onKeyDown = (event) => {
    let next = neighborInDirection(REGIONS, region.id, event.key);
    if (event.key === 'Home') next = REGIONS[0].id;
    if (event.key === 'End') next = REGIONS[REGIONS.length - 1].id;
    if (!next || (next === region.id && !event.key.startsWith('Arrow'))) return;
    event.preventDefault();
    setActiveId(next);
    tiles.current[next]?.focus();
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead
          section={SECTIONS.regions}
          title={['Eight regions, ', { text: 'one', className: 'serif-italic' }, ' archipelago']}
          intro="From Hokkaidō’s powder snow to Okinawa’s coral coves. Hover or tab through the map — arrow keys travel across it."
        />

        <div className={styles.layout}>
          <motion.figure className={styles.print} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <div className={styles.printHead} aria-hidden="true">
              <span>日本地図</span>
              <span>Schematic · not to scale</span>
              <span className={styles.compass}>N ↑</span>
            </div>

            <div
              className={styles.map}
              style={{ '--cols': BOUNDS.cols, '--rows': BOUNDS.rows }}
              role="group"
              aria-label="Regions of Japan"
              onKeyDown={onKeyDown}
            >
              <svg className={styles.rail} viewBox={`0 0 ${BOUNDS.cols} ${BOUNDS.rows}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <polyline points={RAIL} className={styles.railLine} vectorEffect="non-scaling-stroke" />
                <polyline points={BRIDGE} className={styles.bridgeLine} vectorEffect="non-scaling-stroke" />
              </svg>

              <span className={styles.sea} data-sea="west" aria-hidden="true">
                <VerticalText className={styles.seaJp}>日本海</VerticalText>
                <span className={styles.seaEn}>Sea of Japan</span>
              </span>
              <span className={styles.sea} data-sea="east" aria-hidden="true">
                <VerticalText className={styles.seaJp}>太平洋</VerticalText>
                <span className={styles.seaEn}>Pacific Ocean</span>
              </span>

              {REGIONS.map((r, i) => {
                const active = r.id === region.id;
                const count = counts[r.id] ?? 0;
                const lines = r.jp.split('・');
                return (
                  <motion.button
                    key={r.id}
                    ref={(node) => {
                      tiles.current[r.id] = node;
                    }}
                    type="button"
                    className={styles.tile}
                    data-active={active || undefined}
                    data-pattern={PATTERNS[i % PATTERNS.length]}
                    style={{ gridColumn: r.tile.x - BOUNDS.minX + 1, gridRow: r.tile.y - BOUNDS.minY + 1 }}
                    custom={i}
                    variants={tileIn}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                    tabIndex={active ? 0 : -1}
                    aria-pressed={active}
                    aria-controls={detailId}
                    aria-label={`${r.label}, ${count > 0 ? pluralize(count, 'brochure') : 'no brochures yet'}`}
                    onPointerEnter={(event) => event.pointerType === 'mouse' && setActiveId(r.id)}
                    onFocus={() => setActiveId(r.id)}
                    onClick={() => setActiveId(r.id)}
                  >
                    <span className={styles.face}>
                      <span lang="ja" className={styles.tileJp} data-long={lines.length > 1 || undefined}>
                        {lines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                      <span className={styles.tileLabel}>{r.label.split(' ')[0]}</span>
                      {count > 0 && <span className={styles.tileCount}>{count}</span>}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <figcaption className={styles.caption}>
              <span>
                <span className={styles.railKey} aria-hidden="true" /> Shinkansen spine
              </span>
              <span>
                <span className={styles.bridgeKey} aria-hidden="true" /> Seto Ōhashi bridge
              </span>
              <span className={styles.keys}>← ↑ → ↓ to travel</span>
            </figcaption>
          </motion.figure>

          <RegionDetail id={detailId} region={region} index={regionIndex} count={counts[region.id] ?? 0} brochures={inRegion} />
        </div>
      </div>
    </section>
  );
}
