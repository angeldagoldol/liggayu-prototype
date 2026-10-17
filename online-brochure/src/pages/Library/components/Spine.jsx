import { Link } from 'react-router-dom';
import { CoverArt } from '../../../components/brochure/CoverArt.jsx';
import { Hanko } from '../../../components/ui/index.js';
import styles from './Spine.module.css';

/**
 * A brochure seen from its spine, standing on a shelf: a slice of the cover
 * art, the Japanese and English titles set vertically, a seal at the foot.
 * Height and thickness follow the page count, so the shelf looks lived-in.
 */
export function Spine({ brochure }) {
  const theme = brochure.theme ?? {};
  const pages = Array.isArray(brochure.pages) ? brochure.pages.length : 6;
  const titleJp = String(brochure.titleJp ?? '').trim() || '旅';
  const title = String(brochure.title ?? '').trim() || 'Untitled brochure';
  const seal = Array.from(titleJp.replace(/[・\s]/g, '') || '旅')[0];
  const cover = brochure.cover ?? {};

  return (
    <Link
      to={`/brochures/${encodeURIComponent(brochure.slug ?? '')}`}
      className={styles.spine}
      style={{
        '--b-paper': theme.paper || 'var(--page-paper)',
        '--b-ink': theme.ink || 'var(--wa-sumi)',
        '--b-accent': theme.accent || 'var(--wa-shu)',
        '--h': `${17 + (pages % 5) * 0.5}rem`,
        '--w': `${3.3 + Math.min(pages, 14) * 0.04}rem`,
      }}
    >
      <span className={styles.art} aria-hidden="true">
        <CoverArt style={cover.art} seed={cover.seed} theme={theme} />
      </span>
      <span className={styles.titles}>
        <span lang="ja" className={styles.jp}>
          {titleJp}
        </span>
        <span className={styles.en}>{title}</span>
      </span>
      <Hanko text={seal} size={22} className={styles.seal} />
      <span className="sr-only"> — continue reading</span>
    </Link>
  );
}
