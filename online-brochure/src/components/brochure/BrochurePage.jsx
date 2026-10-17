import { useLayoutEffect, useMemo, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '../../lib/cn.js';
import { PhotoContext } from '../photo/photoContext.js';
import { BLOCKS, FULL_BLEED, FallbackBlock } from './blocks/index.js';
import { Folio } from './blocks/Folio.jsx';
import { PageContext } from './blocks/pageContext.js';
import { pageLabel, themeVars } from './blocks/pageUtils.js';
import { PrintMarks } from './blocks/PrintMarks.jsx';
import { RunningHead } from './blocks/RunningHead.jsx';
import { SideLabel } from './blocks/SideLabel.jsx';
import { useFit } from './useFit.js';
import styles from './BrochurePage.module.css';

/** Staggers the page's <Reveal> children when the page becomes active. */
const SHEET_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

/**
 * One page of a brochure, art-directed per page type and scaled entirely in
 * container units: the same markup renders as a 90px thumbnail or a 900px
 * reader page. Fills its parent's width at an A-series ratio (1 : 1.414).
 *
 *   <BrochurePage brochure={b} page={b.pages[i]} index={i} total={b.pages.length} active onCta={…} />
 *
 * - `active`   plays a light entrance (stagger fade/rise) and starts counters each time it turns true.
 * - `isStatic` no motion and nothing focusable — thumbnails, flip back faces, studio previews.
 * - `onCta`    called by the contact page's button when it has no ctaUrl (rendered inert when absent or static).
 * Colours and heading typeface come from `brochure.theme`, never from the app theme.
 * Photos resolve in this brochure (PhotoContext), so "user:<key>" ids show its own uploads.
 * Copy regions marked data-fit shrink until nothing overflows (blocks/fit.js): text is never clipped.
 * Missing or empty fields are skipped; unknown page types get a quiet fallback.
 */
export function BrochurePage({ brochure, page, index = 0, total = 1, active = false, isStatic = false, onCta, className }) {
  const b = brochure && typeof brochure === 'object' ? brochure : {};
  const p = page && typeof page === 'object' ? page : {};
  const Block = BLOCKS[p.type] ?? FallbackBlock;
  const fullBleed = FULL_BLEED.has(p.type);
  const number = index + 1;
  const recto = number % 2 === 1;

  const vars = useMemo(() => themeVars(b.theme), [b.theme]);
  const context = useMemo(() => ({ isStatic, active, onCta, recto }), [isStatic, active, onCta, recto]);
  const ref = useRef(null);
  useFit(ref, p, b);

  // Replay the entrance whenever the page becomes active; inactive pages rest fully drawn.
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    if (isStatic) return;
    if (active) {
      controls.set('hidden');
      controls.start('show');
    } else {
      controls.stop();
      controls.set('show');
    }
  }, [active, isStatic, controls]);

  const Sheet = isStatic ? 'div' : motion.div;
  const sheetProps = isStatic ? {} : { initial: false, animate: controls, variants: SHEET_VARIANTS };

  return (
    <article
      ref={ref}
      className={cn(styles.page, className)}
      style={vars}
      aria-label={pageLabel(p, b, index, total)}
      data-type={p.type ?? 'unknown'}
      data-typeface={b.theme?.typeface ?? 'serif'}
      data-static={isStatic || undefined}
      data-side={recto ? 'recto' : 'verso'}
    >
      <PageContext.Provider value={context}>
        <PhotoContext.Provider value={b}>
          <Sheet className={cn(styles.sheet, fullBleed && styles.bleed)} {...sheetProps}>
            {!fullBleed && <RunningHead brochure={b} />}
            <div className={styles.body}>
              <Block page={p} brochure={b} index={index} total={total} />
            </div>
            {!fullBleed && <Folio type={p.type} number={number} total={total} recto={recto} />}
            {!fullBleed && <SideLabel type={p.type} recto={recto} />}
            <PrintMarks recto={recto} />
          </Sheet>
        </PhotoContext.Provider>
      </PageContext.Provider>
    </article>
  );
}
