import { useMemo } from 'react';
import { toLat, toLng } from '../../../data/sanitize.js';
import { LazyJapanMap } from './LazyJapanMap.jsx';
import { fitSize, list, pageHeading, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './MapBlock.module.css';
import type from './type.module.css';

/**
 * The brochure's real places on an accurate map of Japan (Natural Earth
 * prefectures): numbered pins on a plate zoomed to where the places are —
 * down to city scale, with a key map of the whole country in a free corner —
 * and a numbered list with the Japanese names and a note for each.
 */
export function MapBlock({ page, brochure }) {
  const heading = text(page.heading);
  const body = text(page.body);
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
  const rows = list(page.places, 8)
    .map((place, i) => ({ n: i + 1, name: text(place.name), nameJp: text(place.nameJp), note: text(place.note) }))
    .filter((r) => r.name || r.nameJp || r.note);

  return (
    <div className={styles.map}>
      <header className={type.header}>
        <Reveal as="h2" className={`${type.heading} ${heading ? '' : 'sr-only'}`} style={{ '--fs': `${fitSize(heading, { max: 6.6, min: 4.2, ideal: 26 })}cqw` }}>
          {heading || pageHeading(page, brochure)}
        </Reveal>
        {body && (
          <Reveal as="p" className={`${type.lede} ${styles.lede}`}>
            {body}
          </Reveal>
        )}
      </header>

      <Reveal variant="fade" className={styles.chart}>
        <LazyJapanMap pins={pins} highlightedRegion={text(brochure.region) || undefined} aspect={1.45} labelScale={1.05} minSpan={0.016} overview className={styles.japan} />
      </Reveal>

      {rows.length > 0 && (
        <ol className={styles.places} data-count={rows.length} data-fit="" data-fit-min="0.55">
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
                {row.note && <span className={styles.note}>{row.note}</span>}
              </span>
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
