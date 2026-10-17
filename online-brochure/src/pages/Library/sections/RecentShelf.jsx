import { useId } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/index.js';
import { ease, fadeUp, spring } from '../../../lib/motion.js';
import { ShelfHead } from '../components/ShelfHead.jsx';
import { Spine } from '../components/Spine.jsx';
import styles from './Shelves.module.css';

const book = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({ opacity: 1, y: 0, transition: { ...spring.gentle, delay: 0.15 + i * 0.05 } }),
};

/**
 * "Recently viewed": the last brochures opened, standing spine-out on a
 * shelf (newest first), with a one-click way back into the latest.
 */
export function RecentShelf({ num, brochures }) {
  const headingId = useId();
  const [latest] = brochures;

  return (
    <motion.section
      className={styles.section}
      aria-labelledby={headingId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: ease.out }}
    >
      <div className="container">
        <ShelfHead id={headingId} num={num} title="Recently viewed" jp="閲覧履歴" />
        <div className={styles.shelf}>
          <div className={styles.rack}>
            <ol className={styles.spines} aria-label="Newest first">
              {brochures.map((brochure, i) => (
                <motion.li key={brochure.id} custom={i} variants={book} initial="hidden" animate="show">
                  <Spine brochure={brochure} />
                </motion.li>
              ))}
            </ol>
            <span className={styles.plank} aria-hidden="true" />
          </div>

          <motion.div className={styles.latest} variants={fadeUp} initial="hidden" animate="show">
            <p className={styles.latestLabel}>Last opened</p>
            <p className={styles.latestTitle}>
              {latest.title || 'Untitled brochure'}
              {latest.titleJp && (
                <span lang="ja" className={styles.latestJp}>
                  {latest.titleJp}
                </span>
              )}
            </p>
            {latest.subtitle && <p className={styles.latestText}>{latest.subtitle}</p>}
            <Button
              to={`/brochures/${encodeURIComponent(latest.slug ?? '')}`}
              variant="secondary"
              iconRight={<ArrowRight />}
              aria-label={`Continue reading ${latest.title || 'Untitled brochure'}`}
            >
              Continue reading
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
