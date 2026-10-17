import { Check } from 'lucide-react';
import { fitSize, list, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './PricingBlock.module.css';
import type from './type.module.css';

/** Plans side by side; the highlighted one gets a tinted card and an おすすめ (recommended) tag. */
export function PricingBlock({ page }) {
  const heading = text(page.heading);
  const note = text(page.note);
  const plans = list(page.plans, 3).filter((plan) => text(plan.name) || text(plan.price));
  const prices = plans.map((plan) => text(plan.price));
  const longest = prices.reduce((a, b) => (b.length > a.length ? b : a), '');
  const priceSize = fitSize(longest, { max: [9, 7, 5.4][plans.length - 1] ?? 5.4, min: 3.4, ideal: 7 });

  return (
    <div className={styles.pricing}>
      <span className={type.watermark} lang="ja" aria-hidden="true">
        円
      </span>
      <header className={type.header}>
        {heading && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(heading, { max: 6.8, min: 4.2, ideal: 26 })}cqw`, '--lines': 2 }}>
            {heading}
          </Reveal>
        )}
      </header>

      {plans.length > 0 && (
        <ul className={styles.plans} data-count={plans.length} style={{ '--n': plans.length, '--price': `${priceSize}cqw` }}>
          {plans.map((plan, i) => {
            const features = list(plan.features, 6).map(text).filter(Boolean);
            return (
              <Reveal as="li" key={i} className={styles.plan} data-highlight={plan.highlight ? true : undefined}>
                {plan.highlight && (
                  <span className={styles.tag}>
                    <span lang="ja" aria-hidden="true">おすすめ</span>
                    <span className="sr-only">Recommended</span>
                  </span>
                )}
                {text(plan.name) && <h3 className={styles.name}>{text(plan.name)}</h3>}
                {prices[i] && <p className={styles.price}>{prices[i]}</p>}
                {text(plan.period) && <p className={styles.period}>{text(plan.period)}</p>}
                {features.length > 0 && (
                  <ul className={styles.features}>
                    {features.map((feature, f) => (
                      <li key={f}>
                        <Check aria-hidden="true" focusable="false" />
                        <span className={type.clamp} style={{ '--lines': 2 }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            );
          })}
        </ul>
      )}

      {note && (
        <Reveal as="p" variant="fade" className={`${styles.note} ${type.clamp}`} style={{ '--lines': 3 }}>
          <span className={styles.mark} aria-hidden="true">
            ※
          </span>
          {note}
        </Reveal>
      )}
    </div>
  );
}
