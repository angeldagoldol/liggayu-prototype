import { Photo } from '../../photo/Photo.jsx';
import { CoverArt } from '../CoverArt.jsx';
import { usePage } from './pageContext.js';
import { fitSize, paragraphs, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './IntroBlock.module.css';
import type from './type.module.css';

/** Opening story: kicker, headline, an optional photograph of the place, two-column
 *  copy with a drop cap, and a bracketed pull quote. */
export function IntroBlock({ page, brochure }) {
  const { isStatic } = usePage();
  const photo = text(page.photo);
  const cover = brochure?.cover ?? {};
  const kicker = text(page.kicker);
  const heading = text(page.heading);
  const copy = paragraphs(page.body);
  const pullQuote = text(page.pullQuote);
  const length = copy.join(' ').length;
  // Narrow letters (I, J, l…) make a weak drop cap, as does anything non-Latin.
  const dropCap = /^[A-HK-Za-hkm-z]/.test(copy[0] ?? '');

  return (
    <div className={styles.intro}>
      <header className={type.header}>
        {kicker && (
          <Reveal as="p" className={type.kicker}>
            {kicker}
          </Reveal>
        )}
        {heading && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(heading, { max: 7.4, min: 4.4, ideal: 32 })}cqw`, '--lines': 3 }}>
            {heading}
          </Reveal>
        )}
      </header>

      {photo && (
        <Reveal variant="fade" className={styles.media}>
          <Photo
            id={photo}
            sizes="(min-width: 1100px) 560px, 90vw"
            credit="overlay"
            creditLinks={!isStatic}
            className={styles.photo}
            fallback={<CoverArt style={cover.art} seed={(Number(cover.seed) || 1) + 2} theme={brochure?.theme} />}
          />
        </Reveal>
      )}

      <Reveal variant="wipe" className={`${type.rule} ${styles.rule}`} />

      {copy.length > 0 && (
        <Reveal
          className={styles.copy}
          data-columns={length > 320 ? 2 : 1}
          data-dropcap={dropCap || undefined}
          data-long={length > (photo ? 520 : 900) || undefined}
          style={{ '--copy': `${fitSize(copy.join(' '), { max: length > 320 ? 2.75 : 3, min: 1.85, ideal: photo ? 360 : 560 })}cqw` }}
        >
          {copy.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Reveal>
      )}

      {pullQuote && (
        <Reveal as="blockquote" className={styles.pull}>
          <span className={styles.bracket} lang="ja" aria-hidden="true">
            「
          </span>
          <p className={type.clamp} style={{ '--fs': `${fitSize(pullQuote, { max: 4.4, min: 2.8, ideal: 60 })}cqw`, '--lines': 3 }}>
            {pullQuote}
          </p>
        </Reveal>
      )}
    </div>
  );
}
