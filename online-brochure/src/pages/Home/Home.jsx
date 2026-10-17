import { useBrochures } from '../../context/BrochureContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useMotionPaused } from './homeMotion.js';
import { CtaBand } from './sections/CtaBand.jsx';
import { Featured } from './sections/Featured.jsx';
import { Hero } from './sections/Hero.jsx';
import { HowItWorks } from './sections/HowItWorks.jsx';
import { Numbers } from './sections/Numbers.jsx';
import { Regions } from './sections/Regions.jsx';
import { Seasons } from './sections/Seasons.jsx';
import { Voices } from './sections/Voices.jsx';
import { WordMarquee } from './sections/WordMarquee.jsx';
import styles from './Home.module.css';

/**
 * Home — the magazine cover of Tabi, then a tour of what is inside:
 * 01 hero · 02 words · 03 featured · 04 seasons · 05 regions ·
 * 06 how it works · 07 numbers · 08 voices · 09 studio.
 *
 * `data-motion="paused"` (the hero's "Pause motion" control, homeMotion.js)
 * lets the sections' CSS loops hold still via `:global([data-motion='paused'])`.
 */
export default function Home() {
  useDocumentTitle(null);
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
      <Voices />
      <CtaBand />
    </div>
  );
}
