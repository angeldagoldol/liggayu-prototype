import { CoverArt } from '../CoverArt.jsx';
import { fitSize, pageHeading, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './QuoteBlock.module.css';

/** Real, attributed words — a haiku, a proverb — set large between Japanese quotation
 *  brackets 「 」 over a faint ensō; the original Japanese (quoteJp) sits above a translation. */
export function QuoteBlock({ page, brochure, index }) {
  const quote = text(page.quote);
  const quoteJp = text(page.quoteJp);
  const author = text(page.author);
  const role = text(page.role);

  return (
    <figure className={styles.quote}>
      <h2 className="sr-only">{pageHeading(page, brochure)}</h2>
      <Reveal variant="fade" className={styles.art} aria-hidden="true">
        <CoverArt style="enso" seed={index + 3} theme={brochure.theme} />
      </Reveal>

      <Reveal variant="fade" className={styles.open} aria-hidden="true">
        <span lang="ja">「</span>
      </Reveal>
      {(quote || quoteJp) && (
        <Reveal as="blockquote" className={styles.text} data-translation={quoteJp && quote ? true : undefined}>
          {quoteJp && (
            <p className={styles.original} lang="ja" style={{ '--fs': `${fitSize(quoteJp, { max: 4.6, min: 2.8, ideal: 18 })}cqw` }}>
              {quoteJp}
            </p>
          )}
          {quote && (
            <p style={{ '--fs': `${fitSize(quote, { max: 6.2, min: 3.4, ideal: 90 })}cqw` }}>
              {quote}
              <span className={styles.close} lang="ja" aria-hidden="true">
                」
              </span>
            </p>
          )}
        </Reveal>
      )}
      {(author || role) && (
        <Reveal as="figcaption" className={styles.by}>
          {author && <span className={styles.author}>{author}</span>}
          {role && <span className={styles.role}>{role}</span>}
        </Reveal>
      )}
    </figure>
  );
}
