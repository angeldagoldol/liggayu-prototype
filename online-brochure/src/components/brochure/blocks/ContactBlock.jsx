import { ArrowUpRight } from 'lucide-react';
import { pad } from '../../../lib/format.js';
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
 * Contact page: headline, a ticket (切符, kippu) listing the details with a
 * perforated stub, and a call to action that calls `onCta`.
 */
export function ContactBlock({ page, brochure, index }) {
  const { isStatic, onCta } = usePage();
  const heading = text(page.heading);
  const body = text(page.body);
  const cta = text(page.cta);
  const details = list(page.details, 4).filter((d) => text(d.value));
  const titleJp = text(brochure.titleJp) || '旅';
  const interactive = !isStatic && typeof onCta === 'function';

  return (
    <div className={styles.contact}>
      <span className={`${type.watermark} ${styles.postmark}`} lang="ja" aria-hidden="true">
        〒
      </span>
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
          <dl className={styles.details}>
            {details.map((detail, i) => {
              const value = text(detail.value);
              const href = isStatic ? null : hrefFor(value);
              return (
                <div key={i} className={styles.row}>
                  <span className={styles.icon}>
                    <Icon name={detail.icon} />
                  </span>
                  <dt>{text(detail.label) || 'Detail'}</dt>
                  <dd>{href ? <a href={href}>{value}</a> : value}</dd>
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
          {interactive ? (
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
