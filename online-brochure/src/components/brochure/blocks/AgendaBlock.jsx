import { fitSize, list, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './AgendaBlock.module.css';
import type from './type.module.css';

/** Itinerary drawn like a Japanese railway line diagram: times, stations and short notes. */
export function AgendaBlock({ page }) {
  const heading = text(page.heading);
  const items = list(page.items, 6).filter((item) => text(item.title) || text(item.text) || text(item.time));

  return (
    <div className={styles.agenda}>
      <header className={type.header}>
        {heading && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(heading, { max: 6.8, min: 4.2, ideal: 26 })}cqw`, '--lines': 2 }}>
            {heading}
          </Reveal>
        )}
      </header>

      {items.length > 0 && (
        <ol className={styles.line} data-count={items.length}>
          {items.map((item, i) => (
            <Reveal as="li" key={i} className={styles.stop}>
              <span className={styles.time}>{text(item.time)}</span>
              <span className={styles.station} aria-hidden="true" />
              <div className={styles.copy}>
                {text(item.title) && (
                  <h3 className={`${styles.title} ${type.clamp}`} style={{ '--lines': 2 }}>
                    {text(item.title)}
                  </h3>
                )}
                {text(item.text) && (
                  <p className={`${styles.text} ${type.clamp}`} style={{ '--lines': items.length > 5 ? 1 : 2 }}>
                    {text(item.text)}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
