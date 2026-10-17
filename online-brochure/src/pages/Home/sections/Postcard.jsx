import { useId } from 'react';
import { CoverArt } from '../../../components/brochure/CoverArt.jsx';
import styles from './Postcard.module.css';

/** Stamps are printed matter: fixed paper colours in both themes. */
const STAMP_THEME = { paper: '#f6f0e4', ink: '#22140f', accent: '#d23a22', accent2: '#1d4f7a', muted: '#6e5b4f' };

/** Circular cancellation mark with the town around the top and the date across. */
function Postmark({ town, date }) {
  const arcId = `pm${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className={styles.postmark} viewBox="0 0 150 80" aria-hidden="true" focusable="false">
      <defs>
        <path id={arcId} d="M78 40 a30 30 0 0 1 60 0" />
      </defs>
      <g className={styles.waves}>
        {[24, 34, 44, 54].map((y) => (
          <path key={y} d={`M2 ${y} q8 -5 16 0 t16 0 t16 0 t16 0`} />
        ))}
      </g>
      <circle cx="108" cy="40" r="36" className={styles.ring} />
      <circle cx="108" cy="40" r="25" className={styles.ringInner} />
      <text className={styles.town}>
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          {town}
        </textPath>
      </text>
      <text x="108" y="44" textAnchor="middle" className={styles.date}>
        {date}
      </text>
    </svg>
  );
}

/**
 * A reader's letter as a postcard: the message on the left, a perforated
 * stamp, postmark and sender on the right.
 *   <Postcard voice={{ name, city, quote, postmark, date, art, seed }} />
 */
export function Postcard({ voice }) {
  return (
    <figure className={styles.card}>
      <div className={styles.message}>
        <span className={styles.open} lang="ja" aria-hidden="true">
          「
        </span>
        <blockquote className={styles.quote}>
          <p>{voice.quote}</p>
        </blockquote>
        <span className={styles.close} lang="ja" aria-hidden="true">
          」
        </span>
      </div>

      <div className={styles.side}>
        <div className={styles.franking}>
          <Postmark town={voice.postmark} date={voice.date} />
          <span className={styles.stamp} aria-hidden="true">
            <span className={styles.stampArt}>
              <CoverArt style={voice.art} seed={voice.seed} theme={STAMP_THEME} />
            </span>
            <span className={styles.stampText}>NIPPON</span>
          </span>
        </div>
        <figcaption className={styles.from}>
          <span className={styles.fromLabel}>From</span>
          <span className={styles.name}>{voice.name}</span>
          <span className={styles.city}>{voice.city}</span>
        </figcaption>
        <span className={styles.lines} aria-hidden="true" />
      </div>
    </figure>
  );
}
