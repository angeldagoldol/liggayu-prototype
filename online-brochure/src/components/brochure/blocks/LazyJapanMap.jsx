import { lazy, Suspense } from 'react';
import styles from './LazyJapanMap.module.css';

// The map and its prefecture outlines (~46 KB) load only when a page with a map is drawn.
const JapanMap = lazy(() => import('../../map/JapanMap.jsx').then((m) => ({ default: m.JapanMap })));

/**
 * <JapanMap> for brochure pages, loaded on demand: a quiet paper tint holds
 * its box until the map chunk arrives. Takes every JapanMap prop.
 */
export function LazyJapanMap(props) {
  return (
    <Suspense fallback={<div className={styles.placeholder} aria-hidden="true" />}>
      <JapanMap {...props} />
    </Suspense>
  );
}
