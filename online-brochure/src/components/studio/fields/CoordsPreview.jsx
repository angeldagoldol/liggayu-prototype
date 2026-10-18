import { useEffect, useMemo } from 'react';
import { prefectures, project } from '../../../data/geo/japan.js';
import { JapanMap } from '../../map/JapanMap.jsx';
import { locate } from '../geoLookup.js';
import styles from './CoordsField.module.css';

/**
 * The Studio's "you are here" check for one coordinate (lazy: it carries the
 * map's outlines): a small locator map of Japan with the pin, and the
 * prefecture the pin lands in, read from the same outlines — so a typo that
 * puts Kyoto in the sea is caught before it is printed.
 *   <CoordsPreview lat={34.99} lng={135.78} name="Kiyomizu-dera" onLocate={(result) => …} />
 */
export default function CoordsPreview({ lat, lng, name, onLocate }) {
  const result = useMemo(() => locate(lat, lng, { project, prefectures }), [lat, lng]);
  const pins = useMemo(() => [{ id: 'here', lat, lng, label: name || 'This place' }], [lat, lng, name]);
  const code = result?.state === 'land' ? result.prefecture.code : result?.state ?? '';

  useEffect(() => {
    onLocate?.(result);
    // Tell the host only when the answer changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const prefecture = result?.state === 'land' ? result.prefecture : null;
  return (
    <figure className={styles.figure}>
      <div className={styles.mini}>
        <JapanMap
          variant="locator"
          pins={pins}
          highlightedRegion={prefecture?.region}
          labelScale={3}
          label={`Map of Japan with a pin for ${name || 'this place'}${prefecture ? ` in ${prefecture.name}` : ''}`}
        />
      </div>
      <figcaption className={styles.prefecture} data-state={result?.state}>
        {prefecture ? (
          <>
            <span lang="ja" className={styles.prefJp}>
              {prefecture.nameJp}
            </span>
            <span className={styles.prefEn}>{prefecture.name}</span>
          </>
        ) : (
          <span className={styles.prefEn}>{result?.state === 'sea' ? 'Offshore?' : 'Off the map'}</span>
        )}
      </figcaption>
    </figure>
  );
}
