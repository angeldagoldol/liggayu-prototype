import { ArrowUpRight } from 'lucide-react';
import { safeUrl } from '../../../data/sanitize.js';
import { Photo } from '../../photo/Photo.jsx';
import { CoverArt } from '../CoverArt.jsx';
import { usePage } from './pageContext.js';
import { fitSize, formatLatLng, list, pageHeading, paragraphs, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './PlaceBlock.module.css';
import type from './type.module.css';

/** "www.kiyomizudera.or.jp/en/" → "kiyomizudera.or.jp" */
function siteLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * One real sight in depth, set like a museum label: a photograph (the
 * brochure's art until it is downloaded), the name in English and Japanese,
 * the story, and a column of practical facts with the official website.
 */
export function PlaceBlock({ page, brochure, index }) {
  const { isStatic, active } = usePage();
  const kicker = text(page.kicker);
  const name = text(page.name);
  const nameJp = text(page.nameJp);
  const copy = paragraphs(page.body);
  const facts = list(page.facts, 5).filter((f) => text(f.label) || text(f.value));
  const website = safeUrl(page.website);
  const where = formatLatLng(page.lat, page.lng);
  const cover = brochure.cover ?? {};
  const photo = text(page.photo);

  return (
    <div className={styles.place}>
      <Reveal variant="fade" className={styles.media}>
        <Photo
          id={photo}
          sizes="(min-width: 1100px) 560px, 90vw"
          credit={photo ? 'overlay' : 'none'}
          creditLinks={!isStatic}
          kenBurns={active && !isStatic}
          className={styles.photo}
          fallback={<CoverArt style={cover.art} seed={(Number(cover.seed) || 1) + index * 7} theme={brochure.theme} />}
        />
      </Reveal>

      <header className={`${type.header} ${styles.header}`}>
        {kicker && (
          <Reveal as="p" className={type.kicker}>
            {kicker}
          </Reveal>
        )}
        <Reveal
          as="h2"
          className={`${type.heading} ${type.clamp} ${name ? '' : 'sr-only'}`}
          style={{ '--fs': `${fitSize(name, { max: 6.6, min: 4, ideal: 20 })}cqw`, '--lines': 2 }}
        >
          {name || pageHeading(page, brochure)}
          {nameJp && (
            <span className={`${styles.nameJp} ${type.jp}`} lang="ja">
              {nameJp}
            </span>
          )}
        </Reveal>
      </header>

      <div className={styles.columns} data-facts={facts.length > 0 || website || where ? true : undefined}>
        {copy.length > 0 && (
          <Reveal className={styles.copy} style={{ '--copy': `${fitSize(copy.join(' '), { max: 2.55, min: 1.9, ideal: 420 })}cqw` }}>
            {copy.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
        )}

        {(facts.length > 0 || website || where) && (
          <Reveal className={styles.aside}>
            {facts.length > 0 && (
              <dl className={styles.facts}>
                {facts.map((fact, i) => (
                  <div key={i} className={styles.fact}>
                    <dt>{text(fact.label) || 'Note'}</dt>
                    <dd>{text(fact.value) || '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
            {website &&
              (isStatic ? (
                <p className={styles.site}>{siteLabel(website)}</p>
              ) : (
                <a className={styles.site} href={website} target="_blank" rel="noopener noreferrer">
                  {siteLabel(website)}
                  <ArrowUpRight aria-hidden="true" focusable="false" />
                  <span className="sr-only"> (official website, opens in a new tab)</span>
                </a>
              ))}
            {where && <p className={styles.where}>{where}</p>}
          </Reveal>
        )}
      </div>
    </div>
  );
}
