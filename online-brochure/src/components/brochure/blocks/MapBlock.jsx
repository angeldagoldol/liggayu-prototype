import { lazy, Suspense, useMemo } from 'react';
import { toLat, toLng } from '../../../data/sanitize.js';
import { fitSize, list, pageHeading, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './MapBlock.module.css';
import type from './type.module.css';

// The map and its prefecture outlines (~45 KB) load only when a map page is drawn.
const JapanMap = lazy(() => import('../../map/JapanMap.jsx').then((m) => ({ default: m.JapanMap })));

/**
 * The brochure's real places on an accurate map of Japan: numbered pins
 * (zoomed to where the places are, the brochure's region tinted) and a
 * numbered list with the Japanese names and a note for each.
 */
export function MapBlock({ page, brochure }) {
  const heading = text(page.heading);
  const body = text(page.body);
  const places = list(page.places, 8);
  // Keyed on the stored list, so the map's layout is not redone on every render.
  const pins = useMemo(
    () =>
      list(page.places, 8).map((place, i) => ({
        id: `place-${i}`,
        lat: toLat(place.lat),
        lng: toLng(place.lng),
        label: text(place.name),
        labelJp: text(place.nameJp),
      })),
    [page.places],
  );
  const rows = places.map((place, i) => ({ n: i + 1, name: text(place.name), nameJp: text(place.nameJp), note: text(place.note) })).filter((r) => r.name || r.note);

  return (
    <div className={styles.map}>
      <header className={type.header}>
        <Reveal
          as="h2"
          className={`${type.heading} ${type.clamp} ${heading ? '' : 'sr-only'}`}
          style={{ '--fs': `${fitSize(heading, { max: 6.6, min: 4.2, ideal: 26 })}cqw`, '--lines': 2 }}
        >
          {heading || pageHeading(page, brochure)}
        </Reveal>
        {body && (
          <Reveal as="p" className={`${type.lede} ${type.clamp}`} style={{ '--lines': 3 }}>
            {body}
          </Reveal>
        )}
      </header>

      <Reveal variant="fade" className={styles.chart}>
        <Suspense fallback={<div className={styles.placeholder} aria-hidden="true" />}>
          <JapanMap pins={pins} highlightedRegion={text(brochure.region) || undefined} aspect={1.3} labelScale={1.1} className={styles.japan} />
        </Suspense>
      </Reveal>

      {rows.length > 0 && (
        <ol className={styles.places} data-count={rows.length}>
          {rows.map((row) => (
            <Reveal as="li" key={row.n} className={styles.row} value={row.n}>
              <span className={styles.num} aria-hidden="true">
                {row.n}
              </span>
              <span className={styles.label}>
                <span className={styles.name}>
                  {row.name}
                  {row.nameJp && (
                    <span className={`${styles.nameJp} ${type.jp}`} lang="ja">
                      {row.nameJp}
                    </span>
                  )}
                </span>
                {row.note && (
                  <span className={`${styles.note} ${type.clamp}`} style={{ '--lines': 1 }}>
                    {row.note}
                  </span>
                )}
              </span>
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
