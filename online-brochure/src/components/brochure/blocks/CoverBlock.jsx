import { Hanko, VerticalText } from '../../ui/index.js';
import { CoverArt } from '../CoverArt.jsx';
import { usePage } from './pageContext.js';
import { fitSize, text } from './pageUtils.js';
import { Reveal } from './Reveal.jsx';
import styles from './CoverBlock.module.css';
import type from './type.module.css';

/**
 * Front cover: full-bleed generative art, a title slip (題簽, daisen) with
 * the Japanese title in vertical type, and a paper band (帯, obi) carrying
 * the headline, standfirst and a seal.
 */
export function CoverBlock({ page, brochure }) {
  const { isStatic, active } = usePage();
  const title = text(page.title) || text(brochure.title);
  const titleJp = text(page.titleJp) || text(brochure.titleJp);
  const eyebrow = text(page.eyebrow);
  const subtitle = text(page.subtitle);
  const organization = text(brochure.organization);
  const seal = Array.from(titleJp || '旅').slice(0, 2).join('');
  const cover = brochure.cover ?? {};

  return (
    <div className={styles.cover}>
      <Reveal variant="zoom" className={styles.art}>
        <CoverArt style={cover.art} seed={cover.seed} theme={brochure.theme} animated={active && !isStatic} />
      </Reveal>

      {organization && (
        <Reveal variant="fade" className={styles.masthead}>
          <span>{organization}</span>
        </Reveal>
      )}

      {titleJp && (
        <Reveal variant="fade" className={styles.daisen} style={{ '--jp': `${fitSize(titleJp, { max: 6.6, min: 3.2, ideal: 4 })}cqw` }}>
          <VerticalText className={styles.daisenText}>{titleJp}</VerticalText>
        </Reveal>
      )}

      <Reveal variant="rise" className={styles.obi}>
        <Reveal variant="stamp" className={styles.sealWrap}>
          <Hanko text={seal} className={styles.seal} />
        </Reveal>
        {eyebrow && <p className={`${type.kicker} ${styles.eyebrow}`}>{eyebrow}</p>}
        {title && (
          <h2 className={`${type.heading} ${type.clamp} ${styles.title}`} style={{ '--fs': `${fitSize(title, { max: 10.5, min: 5.6, ideal: 17 })}cqw`, '--lines': 3 }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className={`${type.clamp} ${styles.subtitle}`} style={{ '--lines': 3 }}>
            {subtitle}
          </p>
        )}
      </Reveal>
    </div>
  );
}
