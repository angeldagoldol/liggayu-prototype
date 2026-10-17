import { text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './FallbackBlock.module.css';
import type from './type.module.css';

/** Shown for page types this renderer does not know: a calm 空 ("empty") instead of a crash. */
export function FallbackBlock({ page }) {
  const heading = text(page.heading) || text(page.title) || 'Untitled page';
  const kind = text(page.type);

  return (
    <div className={styles.fallback}>
      <span className={`${styles.glyph} ${type.jp}`} lang="ja" aria-hidden="true">
        空
      </span>
      <Reveal as="h2" className={`${type.heading} ${type.clamp} ${styles.heading}`} style={{ '--fs': '5.4cqw', '--lines': 3 }}>
        {heading}
      </Reveal>
      <Reveal as="p" className={styles.note}>
        {kind ? `This “${kind}” page can’t be shown in this edition yet.` : 'This page has no content yet.'}
      </Reveal>
    </div>
  );
}
