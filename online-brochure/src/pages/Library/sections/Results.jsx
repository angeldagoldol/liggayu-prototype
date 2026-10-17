import { useId } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { BrochureCard } from '../../../components/brochure/BrochureCard.jsx';
import { cn } from '../../../lib/cn.js';
import { ease } from '../../../lib/motion.js';
import { describeFilters } from '../filterBrochures.js';
import { ActiveFilters } from '../components/ActiveFilters.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ShelfHead } from '../components/ShelfHead.jsx';
import styles from './Results.module.css';

const swap = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: ease.in } },
};

/**
 * "All brochures" / search results: running head, a live result count,
 * removable filter pills, then the cards. Cards glide to their new places
 * when filters change (LayoutGroup + popLayout); switching grid/list
 * cross-fades the whole set. Shows <EmptyState> when nothing matches.
 */
export function Results({ num, results, total, filters, filtering, brochures, favoriteIds, onChange, onApply, onClear, ref }) {
  const headingId = useId();
  const pills = describeFilters(filters);
  const count = results.length;
  const view = filters.view === 'list' ? 'list' : 'grid';

  return (
    <section ref={ref} className={styles.results} aria-labelledby={headingId}>
      <div className="container">
        <ShelfHead id={headingId} num={num} title={filtering ? 'Results' : 'All brochures'} jp={filtering ? '検索結果' : '一覧'} />

        <div className={styles.summary}>
          <p className={styles.count} aria-live="polite" aria-atomic="true">
            <strong>{count}</strong> {count === 1 ? 'brochure' : 'brochures'}
            {filtering && <span className={styles.of}> of {total}</span>}
          </p>
          {pills.length > 0 && (
            <ActiveFilters pills={pills} onRemove={(patch) => onChange(patch)} onClear={() => onClear()} />
          )}
        </div>

        {count === 0 ? (
          <EmptyState filters={filters} brochures={brochures} favoriteIds={favoriteIds} onApply={onApply} onClear={() => onClear()} />
        ) : (
          <LayoutGroup id="library-results">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={view} className={cn(styles.cards, styles[view])} variants={swap} initial="initial" animate="animate" exit="exit">
                <AnimatePresence mode="popLayout">
                  {results.map((brochure, i) => (
                    <BrochureCard key={brochure.id ?? brochure.slug} brochure={brochure} index={i} variant={view} layout />
                  ))}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        )}
      </div>
    </section>
  );
}
