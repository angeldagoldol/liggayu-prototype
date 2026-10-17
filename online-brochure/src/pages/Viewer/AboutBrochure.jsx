import { useId } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, PenLine } from 'lucide-react';
import { sealText } from '../../components/viewer/pageMeta.js';
import { Button, Hanko, RevealText, VerticalText } from '../../components/ui/index.js';
import { getCategory } from '../../data/categories.js';
import { getRegion } from '../../data/regions.js';
import { FORMATS } from '../../data/schema.js';
import { SEASONS } from '../../data/seasons.js';
import { formatDate, pluralize } from '../../lib/format.js';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion.js';
import styles from './AboutBrochure.module.css';

/** 春 夏 秋 冬 — all four seasons, the brochure's best ones inked in their colours. */
function SeasonMarks({ seasons }) {
  const best = new Set(Array.isArray(seasons) ? seasons : []);
  const names = SEASONS.filter((s) => best.has(s.id)).map((s) => s.label.toLowerCase());
  return (
    <span className={styles.seasons}>
      <span className="sr-only">{names.length ? names.join(', ') : 'Any season'}</span>
      {SEASONS.map((s) => (
        <span
          key={s.id}
          lang="ja"
          className={styles.season}
          data-best={best.has(s.id) || undefined}
          style={{ '--season': s.color }}
          title={`${s.label} · ${s.months}`}
          aria-hidden="true"
        >
          {s.jp}
        </span>
      ))}
    </span>
  );
}

/**
 * "About this brochure": the story in a sentence, tags and the colophon
 * facts (region, seasons, format, pages, updated, publisher), with the two
 * next steps — plan the trip or remix the brochure in the Studio.
 * Props: brochure, onPlan.
 */
export function AboutBrochure({ brochure, onPlan }) {
  const headingId = useId();
  const region = getRegion(brochure.region);
  const category = getCategory(brochure.category);
  const format = FORMATS.find((f) => f.id === brochure.format)?.label ?? 'Booklet';
  const pages = Array.isArray(brochure.pages) ? brochure.pages.length : 0;
  const tags = (Array.isArray(brochure.tags) ? brochure.tags : []).filter((t) => typeof t === 'string' && t.trim());
  const updated = formatDate(brochure.updatedAt);
  const headline = brochure.subtitle || brochure.title || 'A Japan brochure';

  const facts = [
    { label: 'Region', value: region.label, jp: region.jp },
    { label: 'Best seasons', node: <SeasonMarks seasons={brochure.seasons} /> },
    { label: 'Category', value: category.label, jp: category.jp },
    { label: 'Format', value: `${format} · ${pluralize(pages, 'page')}` },
    Number.isFinite(brochure.readMinutes) && { label: 'Reading time', value: `${brochure.readMinutes} min` },
    updated && { label: 'Updated', node: <time dateTime={brochure.updatedAt}>{updated}</time> },
    brochure.organization && { label: 'Publisher', value: brochure.organization },
  ].filter(Boolean);

  return (
    <section className={styles.about} aria-labelledby={headingId}>
      <div className={`container ${styles.grid}`}>
        <motion.aside className={styles.aside} initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp} aria-hidden="true">
          <VerticalText className={styles.bigJp}>{brochure.titleJp || '旅'}</VerticalText>
          <Hanko text={sealText(brochure)} size={52} className={styles.seal} />
        </motion.aside>

        <div className={styles.main}>
          <p className="eyebrow">
            About this brochure
            <span lang="ja" className={styles.eyebrowJp}>
              この冊子について
            </span>
          </p>
          <RevealText as="h2" text={headline} className={styles.heading} />
          <span id={headingId} className="sr-only">
            About {brochure.title}
          </span>

          <motion.div className={styles.body} initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger(0.08, 0.1)}>
            {brochure.summary && (
              <motion.p className={styles.summary} variants={fadeUp}>
                {brochure.summary}
              </motion.p>
            )}

            {tags.length > 0 && (
              <motion.ul className={styles.tags} variants={fadeUp} aria-label="Tags">
                {tags.map((tag) => (
                  <li key={tag} className={styles.tag}>
                    {tag}
                  </li>
                ))}
              </motion.ul>
            )}

            <motion.dl className={styles.facts} variants={fadeUp}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.node ?? fact.value}
                    {fact.jp && (
                      <span lang="ja" className={styles.factJp}>
                        {fact.jp}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </motion.dl>

            <motion.div className={styles.actions} variants={fadeUp}>
              <Button variant="accent" size="lg" onClick={onPlan} iconRight={<ArrowUpRight />}>
                Plan this trip
              </Button>
              <Button variant="secondary" size="lg" to={`/studio?from=${encodeURIComponent(brochure.slug ?? '')}`} iconLeft={<PenLine />}>
                Remix in Studio
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
