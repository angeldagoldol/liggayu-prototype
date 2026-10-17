import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { safeUrl, toLat, toLng } from '../../../data/sanitize.js';
import { VerticalText } from '../../ui/index.js';
import { Photo } from '../../photo/Photo.jsx';
import { CoverArt } from '../CoverArt.jsx';
import { LazyJapanMap } from './LazyJapanMap.jsx';
import { usePage } from './pageContext.js';
import { fitSize, formatLatLng, hostLabel, list, pageHeading, paragraphs, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './PlaceBlock.module.css';
import type from './type.module.css';

/**
 * One real sight in depth — the kit's signature page. A photograph bleeds to
 * the trim across the top of the page (the brochure's art until it is
 * downloaded) carrying the Japanese name on a vertical paper slip (短冊) and a
 * small "you are here" map of Japan; below it the name, the story, and a
 * column of practical facts (Hours, Admission, Getting there…) ending in the
 * official website. Copy and facts shrink to fit rather than clip.
 */
export function PlaceBlock({ page, brochure, index }) {
  const { isStatic, active } = usePage();
  const kicker = text(page.kicker);
  const name = text(page.name);
  const nameJp = text(page.nameJp);
  const copy = paragraphs(page.body);
  const facts = list(page.facts, 5).filter((f) => text(f.label) || text(f.value));
  const website = safeUrl(page.website);
  const lat = toLat(page.lat);
  const lng = toLng(page.lng);
  const where = formatLatLng(lat, lng);
  const cover = brochure.cover ?? {};
  const photo = text(page.photo);
  const pins = useMemo(() => (lat !== null && lng !== null ? [{ id: 'here', lat, lng, label: name }] : []), [lat, lng, name]);
  const jpChars = Array.from(nameJp).length;
  const hasAside = facts.length > 0 || Boolean(website);

  return (
    <div className={styles.place}>
      <Reveal variant="fade" className={styles.media} data-bleed="both">
        <Photo
          id={photo}
          sizes="(min-width: 1100px) 680px, 100vw"
          credit={photo ? 'overlay' : 'none'}
          creditLinks={!isStatic}
          kenBurns={active && !isStatic}
          className={styles.photo}
          fallback={<CoverArt style={cover.art} seed={(Number(cover.seed) || 1) + index * 7} theme={brochure.theme} />}
        />
        {nameJp && (
          <span className={styles.slip} aria-hidden="true" style={{ '--jp': `${Math.min(4.6, 39 / Math.max(3, jpChars * 1.18)).toFixed(2)}cqw` }}>
            <VerticalText className={styles.slipText}>{nameJp}</VerticalText>
          </span>
        )}
        {pins.length > 0 && (
          <figure className={styles.locator}>
            <div className={styles.locatorMap}>
              <LazyJapanMap variant="locator" pins={pins} highlightedRegion={text(brochure.region) || undefined} labelScale={2.4} label={`Where ${name || 'this place'} is in Japan`} />
            </div>
            <figcaption className={styles.coords}>{where}</figcaption>
          </figure>
        )}
      </Reveal>

      <header className={`${type.header} ${styles.header}`}>
        {kicker && (
          <Reveal as="p" className={type.kicker}>
            {kicker}
          </Reveal>
        )}
        <Reveal as="h2" className={`${type.heading} ${styles.name} ${name ? '' : 'sr-only'}`} style={{ '--fs': `${fitSize(name, { max: 7, min: 4.4, ideal: 18 })}cqw` }}>
          {name || pageHeading(page, brochure)}
          {nameJp && (
            <span className="sr-only" lang="ja">
              {` ${nameJp}`}
            </span>
          )}
        </Reveal>
      </header>

      <div className={styles.columns} data-aside={hasAside || undefined}>
        {copy.length > 0 && (
          <Reveal className={styles.copy} data-fit="">
            {copy.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
        )}

        {hasAside && (
          <Reveal className={styles.aside} data-fit="">
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
            {website && (
              <p className={styles.site}>
                <span className={styles.siteLabel}>Official website</span>
                {isStatic ? (
                  <span className={styles.siteLink}>{hostLabel(website)}</span>
                ) : (
                  <a className={styles.siteLink} href={website} target="_blank" rel="noopener noreferrer">
                    {hostLabel(website)}
                    <ArrowUpRight aria-hidden="true" focusable="false" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </p>
            )}
          </Reveal>
        )}
      </div>
    </div>
  );
}
