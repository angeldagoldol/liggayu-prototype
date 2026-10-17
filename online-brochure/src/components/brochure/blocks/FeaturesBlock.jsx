import { Icon } from '../../ui/index.js';
import { fitSize, kanjiNumeral, list, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './FeaturesBlock.module.css';
import type from './type.module.css';

/** Highlights grid: numbered (一, 二, 三…) cells with an icon, title and short text. */
export function FeaturesBlock({ page }) {
  const kicker = text(page.kicker);
  const heading = text(page.heading);
  const items = list(page.items, 6).filter((item) => text(item.title) || text(item.text));
  const columns = items.length >= 4 ? 2 : 1;
  const rows = Math.ceil(items.length / columns);

  return (
    <div className={styles.features}>
      <header className={type.header}>
        {kicker && (
          <Reveal as="p" className={type.kicker}>
            {kicker}
          </Reveal>
        )}
        {heading && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(heading, { max: 6.8, min: 4.2, ideal: 30 })}cqw`, '--lines': 2 }}>
            {heading}
          </Reveal>
        )}
      </header>

      {items.length > 0 && (
        <ul className={styles.grid} data-columns={columns} data-rows={rows} style={{ '--rows': rows }}>
          {items.map((item, i) => (
            <Reveal as="li" key={i} className={styles.item}>
              <span className={`${styles.num} ${type.jp}`} lang="ja" aria-hidden="true">
                {kanjiNumeral(i + 1)}
              </span>
              <span className={styles.icon}>
                <Icon name={item.icon} />
              </span>
              <div className={styles.copy}>
                {text(item.title) && (
                  <h3 className={`${styles.title} ${type.clamp}`} style={{ '--lines': 2 }}>
                    {text(item.title)}
                  </h3>
                )}
                {text(item.text) && (
                  <p className={`${styles.text} ${type.clamp}`} style={{ '--lines': items.length > 4 ? 3 : 4 }}>
                    {text(item.text)}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
