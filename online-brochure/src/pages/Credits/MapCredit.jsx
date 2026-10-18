import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { LazyJapanMap } from '../../components/brochure/blocks/LazyJapanMap.jsx';
import { pad } from '../../lib/format.js';
import { MAP_DATA } from './creditsContent.js';
import styles from './Credits.module.css';

/** "Kyoto: A Thousand Gates" → "Kyoto". */
const shortTitle = (title) => String(title ?? '').split(/[:—–]/)[0].trim();

/**
 * The map credit, shown with the map itself: the Natural Earth plate with
 * a pin at each built-in brochure's main place, a numbered index beside it
 * (same numbers), and where the data comes from and how it was made.
 * Props: brochures (the built-ins).
 */
export function MapCredit({ brochures }) {
  const located = useMemo(
    () =>
      brochures.filter(
        (b) => b?.location && Number.isFinite(b.location.lat) && Number.isFinite(b.location.lng),
      ),
    [brochures],
  );
  const pins = useMemo(
    () => located.map((b) => ({ id: b.id, lat: b.location.lat, lng: b.location.lng, label: shortTitle(b.title), labelJp: b.titleJp })),
    [located],
  );

  return (
    <div className={styles.mapCredit}>
      <figure className={styles.mapFigure}>
        <div className={styles.mapPlate}>
          {/* Numbers only: the index beside the map names each pin, and twelve labels at country scale collide. */}
          <LazyJapanMap pins={pins} focus="japan" aspect={1.05} labelScale={1.1} showLabels={false} label={`Map of Japan with the ${pins.length} brochures’ main places`} />
        </div>
        <figcaption className={styles.mapCaption}>
          Natural Earth · 1:10m · Lambert conformal conic · Okinawa &amp; Amami inset
        </figcaption>
      </figure>

      <div className={styles.mapText}>
        <p>
          Every map in Tabi is drawn from{' '}
          <a href={MAP_DATA.url} target="_blank" rel="noopener noreferrer">
            {MAP_DATA.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          , free vector map data in the <strong>public domain</strong>. The 47 prefectures come from its 1:10m states and
          provinces layer and Lake Biwa from its lakes layer; they are simplified, projected with a Lambert conformal conic
          projection and drawn with Okinawa and the Amami Islands in an inset. Some small islands are not drawn at this scale.
        </p>
        <ul className={styles.layers}>
          {MAP_DATA.layers.map((layer) => (
            <li key={layer}>{layer}</li>
          ))}
        </ul>
        <p className={styles.small}>
          <a href={MAP_DATA.termsUrl} target="_blank" rel="noopener noreferrer" className={styles.ext}>
            Natural Earth terms of use
            <ArrowUpRight aria-hidden="true" focusable="false" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>

        <ol className={styles.mapIndex} aria-label="Pins on the map">
          {located.map((b, i) => (
            <li key={b.id}>
              <Link to={`/brochures/${encodeURIComponent(b.slug)}`} className={styles.mapIndexLink}>
                <span className={styles.mapIndexNum} aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className={styles.mapIndexName}>
                  {shortTitle(b.title)}
                  <span lang="ja" className={styles.mapIndexJp}>
                    {b.titleJp}
                  </span>
                </span>
                <span className={styles.mapIndexPlace}>{b.location.name}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
