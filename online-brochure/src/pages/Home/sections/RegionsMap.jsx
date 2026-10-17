import { useRef } from 'react';
import { JapanMap } from '../../../components/map/JapanMap.jsx';
import { regionCenters } from '../../../data/geo/japan.js';
import { REGIONS } from '../../../data/regions.js';
import { useMediaQuery } from '../../../hooks/useMediaQuery.js';
import { neighborInDirection, regionPoints } from './regionMap.js';
import styles from './RegionsMap.module.css';

const POINTS = regionPoints(REGIONS, regionCenters);

/**
 * The lazily loaded half of 05 地方 (its own chunk with the map outlines):
 * the accurate <JapanMap> with the eight regions as buttons. Hover or focus
 * previews a region, click / Enter / Space selects it; arrow keys travel
 * across the map the way the islands lie, Home/End jump to Hokkaidō and
 * Kyūshū & Okinawa.
 *
 * - `activeId`   the region shown in the card (highlighted on the map).
 * - `onPreview`  `(id | null)` pointer or focus entered (null: left) a region.
 * - `onSelect`   `(id)` a region was clicked or pressed.
 */
export default function RegionsMap({ activeId, onPreview, onSelect }) {
  const ref = useRef(null);
  // Names are drawn in map units: on a phone-sized map they would collide, so
  // the highlight and the card name the region there instead.
  const roomy = useMediaQuery('(min-width: 640px)');

  const onKeyDown = (event) => {
    const from = event.target instanceof Element ? event.target.closest('[data-region]')?.getAttribute('data-region') : null;
    if (!from) return;
    let next = neighborInDirection(POINTS, from, event.key);
    if (event.key === 'Home') next = POINTS[0]?.id;
    if (event.key === 'End') next = POINTS.at(-1)?.id;
    if (!next) return;
    event.preventDefault();
    if (next !== from) ref.current?.querySelector(`[data-region="${next}"]`)?.focus();
  };

  return (
    <div ref={ref} className={styles.wrap} onKeyDown={onKeyDown}>
      <JapanMap
        focus="japan"
        fillByRegion
        regionLabels={roomy}
        highlightedRegion={activeId}
        onRegionEnter={onPreview}
        onRegionClick={onSelect}
        labelScale={roomy ? 1.15 : 1.5}
        label="Map of Japan’s eight regions"
        className={styles.map}
      />
    </div>
  );
}
