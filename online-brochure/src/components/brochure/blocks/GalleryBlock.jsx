import { pad } from '../../../lib/format.js';
import { CoverArt } from '../CoverArt.jsx';
import { fitSize, list, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './GalleryBlock.module.css';
import type from './type.module.css';

/** Plates of generative art in an asymmetric magazine grid, each with a numbered caption. */
export function GalleryBlock({ page, brochure }) {
  const heading = text(page.heading);
  const items = list(page.items, 4);

  return (
    <div className={styles.gallery}>
      <header className={`${type.header} ${styles.header}`}>
        {heading && (
          <Reveal as="h2" className={`${type.heading} ${type.clamp}`} style={{ '--fs': `${fitSize(heading, { max: 6.8, min: 4.2, ideal: 26 })}cqw`, '--lines': 2 }}>
            {heading}
          </Reveal>
        )}
        {items.length > 0 && (
          <Reveal as="p" variant="fade" className={styles.count}>
            {`${pad(items.length)} ${items.length === 1 ? 'plate' : 'plates'}`}
          </Reveal>
        )}
      </header>

      {items.length > 0 && (
        <ul className={styles.grid} data-count={items.length}>
          {items.map((item, i) => (
            <Reveal as="li" key={i} className={styles.cell}>
              <figure className={styles.figure}>
                <div className={styles.frame}>
                  <CoverArt style={item.art} seed={item.seed ?? i + 1} theme={brochure.theme} />
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.fig}>{`Fig. ${pad(i + 1)}`}</span>
                  {text(item.caption) && <span className={type.clamp} style={{ '--lines': 2 }}>{text(item.caption)}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
