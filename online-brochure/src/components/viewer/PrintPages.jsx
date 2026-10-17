import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { BrochurePage } from '../brochure/index.js';
import styles from './PrintPages.module.css';

/**
 * Print edition of a brochure: every page, full width, one per sheet.
 * It only exists while the browser prints (beforeprint → afterprint), so
 * the reader never pays for it; everything else on the page carries
 * data-print="hide".
 * Props: brochure.
 */
export function PrintPages({ brochure }) {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    // Commit synchronously: the browser lays out for print right after this event.
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  if (!printing) return null;
  const pages = Array.isArray(brochure.pages) ? brochure.pages : [];

  return (
    <div className={styles.print}>
      {pages.map((page, i) => (
        <div key={page?.id ?? i} className={styles.sheet}>
          <BrochurePage brochure={brochure} page={page} index={i} total={pages.length} isStatic />
        </div>
      ))}
    </div>
  );
}
