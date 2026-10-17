import { FORMATS } from '../../../data/schema.js';
import { Hanko } from '../../ui/index.js';
import { CoverArt } from '../CoverArt.jsx';
import { fitSize, formatEdition, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './BackBlock.module.css';
import type from './type.module.css';

const SWATCHES = ['--b-ink', '--b-accent', '--b-accent2', '--b-muted', '--b-paper'];

/**
 * Back cover: a band of the front artwork, the closing line, and a colophon
 * (奥付, okuzuke) stamped with the publisher's seal.
 */
export function BackBlock({ page, brochure, total }) {
  const title = text(page.title);
  const body = text(page.body);
  const tagline = text(page.tagline);
  const cover = brochure.cover ?? {};
  const seal = Array.from(text(brochure.titleJp) || '旅').slice(0, 2).join('');
  const format = FORMATS.find((f) => f.id === brochure.format)?.label;
  const colophon = [
    { jp: '書名', en: 'Title', value: text(brochure.title) },
    { jp: '発行', en: 'Publisher', value: text(brochure.organization) },
    { jp: '発行日', en: 'Edition', value: formatEdition(brochure.updatedAt) },
    { jp: '判型', en: 'Format', value: [format, total > 1 ? `${total} pages` : ''].filter(Boolean).join(' · ') },
  ].filter((row) => row.value);

  return (
    <div className={styles.back}>
      <Reveal variant="fade" className={styles.band}>
        {/* The front artwork wraps around to the back, as on a printed jacket. */}
        <CoverArt style={cover.art} seed={cover.seed} theme={brochure.theme} />
      </Reveal>

      <div className={styles.content}>
        {title && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(title, { max: 7.2, min: 4.2, ideal: 26 })}cqw`, '--lines': 3 }}>
            {title}
          </Reveal>
        )}
        {body && (
          <Reveal as="p" className={`${type.lede} ${type.clamp}`} style={{ '--lines': 4 }}>
            {body}
          </Reveal>
        )}
        {tagline && (
          <Reveal as="p" className={styles.tagline}>
            {tagline}
          </Reveal>
        )}

        <Reveal className={styles.colophon}>
          <p className={styles.colophonTitle}>
            <span lang="ja" className={type.jp}>
              奥付
            </span>
            <span>Colophon</span>
          </p>
          {colophon.length > 0 && (
            <dl className={styles.rows}>
              {colophon.map((row) => (
                <div key={row.en} className={styles.row}>
                  <dt>
                    <span lang="ja" className={type.jp}>
                      {row.jp}
                    </span>
                    {row.en}
                  </dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <Reveal variant="stamp" className={styles.sealWrap}>
            <Hanko text={seal} shape="circle" className={styles.seal} />
          </Reveal>
        </Reveal>

        <div className={styles.proof} aria-hidden="true">
          {SWATCHES.map((name) => (
            <span key={name} style={{ background: `var(${name})` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
