import { ArrowUpRight } from 'lucide-react';
import { pad } from '../../../lib/format.js';
import { safeUrl } from '../../../data/sanitize.js';
import { Button, Icon, VerticalText } from '../../ui/index.js';
import { usePage } from './pageContext.js';
import { fitSize, list, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './ContactBlock.module.css';
import type from './type.module.css';

/** mailto:/tel: links for contact values that look like an email or a phone number. */
function hrefFor(value) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^\+?[\d\s().-]{7,}$/.test(value)) return `tel:${value.replace(/[^\d+]/g, '')}`;
  return null;
}

/**
 * Contact page — for built-ins, "Visitor information": headline, a ticket
 * (切符, kippu) listing the details with a perforated stub, and a call to
 * action. Details with a `url` link to it (http(s) only, new tab); with a
 * `ctaUrl` the call to action opens that site, otherwise it calls `onCta`.
 */
export function ContactBlock({ page, brochure, index }) {
  const { isStatic, onCta } = usePage();
  const heading = text(page.heading);
  const body = text(page.body);
  const cta = text(page.cta);
  const details = list(page.details, 4).filter((d) => text(d.value));
  const titleJp = text(brochure.titleJp) || '旅';
  const ctaUrl = safeUrl(page.ctaUrl);
  const interactive = !isStatic && (Boolean(ctaUrl) || typeof onCta === 'function');
  // 〒, the Japan Post mark, is a ghost in the open space above the ticket.
  // It hangs off the ticket's top edge so the ticket (whose height depends on
  // the details) never hides part of the glyph.
  const postmark = (
    <span className={`${type.watermark} ${styles.postmark}`} lang="ja" aria-hidden="true">
      〒
    </span>
  );

  return (
    <div className={styles.contact}>
      {details.length === 0 && postmark}
      <header className={type.header}>
        {heading && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(heading, { max: 7.4, min: 4.4, ideal: 22 })}cqw`, '--lines': 2 }}>
            {heading}
          </Reveal>
        )}
        {body && (
          <Reveal as="p" className={`${type.lede} ${type.clamp}`} style={{ '--lines': 4 }}>
            {body}
          </Reveal>
        )}
      </header>

      {details.length > 0 && (
        <Reveal className={styles.ticket}>
          {postmark}
          <dl className={styles.details}>
            {details.map((detail, i) => {
              const value = text(detail.value);
              const url = safeUrl(detail.url);
              const href = isStatic ? null : url || hrefFor(value);
              return (
                <div key={i} className={styles.row}>
                  {/* A dl group may only hold dt/dd, so the icon lives inside the term. */}
                  <dt>
                    <span className={styles.icon} aria-hidden="true">
                      <Icon name={detail.icon} />
                    </span>
                    {text(detail.label) || 'Detail'}
                  </dt>
                  <dd>
                    {href ? (
                      <a href={href} {...(url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {value}
                        {url && <span className="sr-only"> (opens in a new tab)</span>}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div className={styles.stub} aria-hidden="true">
            <VerticalText className={styles.stubJp}>{titleJp}</VerticalText>
            <span className={styles.serial}>{`No. ${pad(index + 1, 4)}`}</span>
          </div>
        </Reveal>
      )}

      {cta && (
        <Reveal className={styles.action}>
          {interactive && ctaUrl ? (
            <Button variant="accent" className={styles.cta} href={ctaUrl} target="_blank" rel="noopener noreferrer" iconRight={<ArrowUpRight aria-hidden="true" />}>
              {cta}
              <span className="sr-only"> (opens in a new tab)</span>
            </Button>
          ) : interactive ? (
            <Button variant="accent" className={styles.cta} onClick={onCta} iconRight={<ArrowUpRight aria-hidden="true" />}>
              {cta}
            </Button>
          ) : (
            <span className={`${styles.cta} ${styles.ctaStatic}`}>
              {cta}
              <ArrowUpRight aria-hidden="true" focusable="false" />
            </span>
          )}
        </Reveal>
      )}
    </div>
  );
}
