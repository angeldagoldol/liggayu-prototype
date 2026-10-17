import { motion } from 'framer-motion';
import { Counter, Hanko, RevealText, VerticalText } from '../../../components/ui/index.js';
import { ease, fadeUp, stagger } from '../../../lib/motion.js';
import styles from './LibraryHeader.module.css';

const rule = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.2, ease: ease.out, delay: 0.3 } },
};

/**
 * Editorial opener: eyebrow, headline, standfirst, live counts set with
 * Japanese counters (冊 for bound volumes, 分 for minutes) and a vertical
 * 旅のしおり accent.
 * `stats`: { brochures, regions, minutes, saved }.
 */
export function LibraryHeader({ stats }) {
  const items = [
    { value: stats.brochures, unit: '冊', label: stats.brochures === 1 ? 'Brochure' : 'Brochures' },
    { value: stats.regions, unit: '地方', label: stats.regions === 1 ? 'Region' : 'Regions' },
    { value: stats.minutes, unit: '分', label: 'Minutes of reading' },
    { value: stats.saved, unit: '件', label: 'Saved by you' },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <VerticalText className={styles.mobileAccent} aria-hidden="true">
          旅のしおり
        </VerticalText>

        <motion.div className={styles.copy} variants={stagger(0.1, 0.15)} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className={`eyebrow ${styles.eyebrow}`}>
            <span>Library</span>
            <span aria-hidden="true">·</span>
            <span lang="ja" className={styles.eyebrowJp}>
              資料室
            </span>
          </motion.p>

          <RevealText
            as="h1"
            immediate
            delay={0.1}
            className={styles.title}
            text={['Every brochure, ', { text: 'unfolded.', className: 'serif-italic' }]}
          />

          <motion.p variants={fadeUp} className={styles.standfirst}>
            Temples at dawn, ramen after midnight, powder snow and coral reefs — every journey in the collection, ready to
            flip through. Filter by season, region or mood, or search in English or <span lang="ja">日本語</span>.
          </motion.p>

          <motion.dl variants={fadeUp} className={styles.stats}>
            {items.map((item) => (
              <div key={item.unit} className={styles.stat}>
                <dt className={styles.statLabel}>{item.label}</dt>
                <dd className={styles.statValue}>
                  <Counter value={item.value} duration={1.4} />
                  <span lang="ja" className={styles.unit} aria-hidden="true">
                    {item.unit}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.aside
          className={styles.accent}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: ease.out, delay: 0.35 }}
          aria-label="Tabi no shiori"
        >
          <VerticalText className={styles.vertical}>旅のしおり</VerticalText>
          <Hanko text="資料" size={52} className={styles.hanko} />
          <p className={styles.caption}>
            <em>Tabi no shiori</em> — the little booklet handed out before every Japanese school trip.
          </p>
        </motion.aside>
      </div>

      <div className="container">
        <motion.span className={styles.rule} variants={rule} initial="hidden" animate="show" aria-hidden="true" />
      </div>
    </header>
  );
}
