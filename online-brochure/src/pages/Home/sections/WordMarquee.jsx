import { Marquee } from '../../../components/ui/index.js';
import { cn } from '../../../lib/cn.js';
import { SECTIONS, WORDS } from '../homeContent.js';
import styles from './WordMarquee.module.css';

/** One word: 旅 · tabi · journey. */
function Word({ word }) {
  return (
    <span className={styles.word}>
      <span lang="ja" className={styles.jp}>
        {word.jp}
      </span>
      <span className={styles.gloss}>
        <span className={styles.romaji}>{word.romaji}</span>
        <span className={styles.meaning}>{word.meaning}</span>
      </span>
      <span className={styles.sun} aria-hidden="true" />
    </span>
  );
}

/**
 * Two counter-scrolling bands of Japanese words with romaji and meaning,
 * laid across the page like strips of washi tape. Pauses on hover; static
 * and scrollable under reduced motion (handled by <Marquee>).
 */
export function WordMarquee() {
  const [first, second] = WORDS;
  return (
    <section className={styles.section}>
      <h2 className={cn('container', styles.label)}>
        <span className={styles.num}>{SECTIONS.words.num}</span>
        {SECTIONS.words.label}
        <span lang="ja" className={styles.labelJp}>
          {SECTIONS.words.jp}
        </span>
      </h2>
      <div className={styles.bands}>
        <div className={cn(styles.band, styles.ink)}>
          <Marquee speed={70} gap="2.5rem">
            {first.map((word) => (
              <Word key={word.romaji} word={word} />
            ))}
          </Marquee>
        </div>
        <div className={cn(styles.band, styles.shu)}>
          <Marquee speed={80} gap="2.5rem" reverse>
            {second.map((word) => (
              <Word key={word.romaji} word={word} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
