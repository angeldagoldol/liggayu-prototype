import { useBrochures } from '../../context/BrochureContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useRequestLivePhotos } from '../../components/photo/useLivePhotos.js';
import { HERO_PANELS, REGION_NOTES, SEASON_PHOTOS } from './homeContent.js';
import { useMotionPaused } from './homeMotion.js';
import { CtaBand } from './sections/CtaBand.jsx';
import { Featured } from './sections/Featured.jsx';
import { Haiku } from './sections/Haiku.jsx';
import { Hero } from './sections/Hero.jsx';
import { HowItWorks } from './sections/HowItWorks.jsx';
import { Numbers } from './sections/Numbers.jsx';
import { Regions } from './sections/Regions.jsx';
import { Seasons } from './sections/Seasons.jsx';
import { WordMarquee } from './sections/WordMarquee.jsx';
import styles from './Home.module.css';

/**
 * Home — the magazine cover of Tabi, then a tour of what is inside:
 * 01 hero · 02 words · 03 featured · 04 seasons · 05 regions ·
 * 06 how it works · 07 numbers · 08 haiku · 09 studio.
 * Real places, photographs (data/photos manifest `home.json`) and facts
 * (docs/research/home.md) throughout; nothing on the page is invented.
 *
 * `data-motion="paused"` (the hero's "Pause motion" control, homeMotion.js)
 * lets the sections' CSS loops hold still via `:global([data-motion='paused'])`.
 */
/** Every photograph the page shows: asked for together, so the live ones arrive in one batch. */
const HOME_PHOTO_IDS = [
  ...Object.values(HERO_PANELS).map((p) => p.photo),
  ...Object.values(SEASON_PHOTOS),
  ...Object.values(REGION_NOTES).map((r) => r.photo),
];

export default function Home() {
  useDocumentTitle(null);
  useRequestLivePhotos(HOME_PHOTO_IDS);
  const { brochures } = useBrochures();
  const motionPaused = useMotionPaused();

  return (
    <div className={styles.home} data-motion={motionPaused ? 'paused' : undefined}>
      <Hero brochureCount={brochures.length} />
      <WordMarquee />
      <Featured />
      <Seasons />
      <Regions />
      <HowItWorks />
      <Numbers />
      <Haiku />
      <CtaBand />
    </div>
  );
}
