import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookDashed, RotateCcw } from 'lucide-react';
import { Button, IconButton, Kbd, VerticalText } from '../../components/ui/index.js';
import {
  Flipbook,
  Overview,
  ReaderToolbar,
  Scrubber,
  ThumbRail,
  PAGE_RATIO,
  ZOOM_LEVELS,
  buildBook,
  clampPan,
  computeBookLayout,
  pageAtPosition,
  positionOfPage,
  spreadAnnouncement,
  spreadCaption,
  spreadLabel,
  stepZoom,
  useElementSize,
  useFullscreen,
} from '../../components/viewer/index.js';
import { useHotkey } from '../../hooks/useHotkey.js';
import { pad } from '../../lib/format.js';
import { spring } from '../../lib/motion.js';
import { usePageParam } from './usePageParam.js';
import { useShare } from './useShare.js';
import styles from './Reader.module.css';

/**
 * Breathing room around the book: wide stages keep space for the side
 * arrows, and the vertical margin lets a lifted leaf grow towards the
 * reader without being clipped.
 */
function stagePadding(width) {
  if (width >= 900) return { padX: 96, padY: 44 };
  if (width >= 600) return { padX: 72, padY: 36 };
  return { padX: 14, padY: 14 };
}

/** Drag-to-pan and wheel-to-pan for a zoomed book; springs back inside its limits (home at 1×) whenever they change. */
function usePan(stageRef, { zoom, layout, size }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const drag = useRef(null);

  const bounds = useCallback(
    (nx, ny) =>
      clampPan({
        x: nx,
        y: ny,
        zoom,
        bookWidth: layout.bookWidth,
        bookHeight: layout.bookHeight,
        stageWidth: size.width,
        stageHeight: size.height,
      }),
    [zoom, layout.bookWidth, layout.bookHeight, size.width, size.height],
  );

  // Re-clamp whenever the zoom or the stage changes (and centre at 1×).
  useEffect(() => {
    const next = bounds(x.get(), y.get());
    const a = animate(x, next.x, spring.gentle);
    const b = animate(y, next.y, spring.gentle);
    return () => {
      a.stop();
      b.stop();
    };
  }, [bounds, x, y]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || zoom <= 1) return undefined;
    const onWheel = (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const next = bounds(x.get() - event.deltaX, y.get() - event.deltaY);
      x.set(next.x);
      y.set(next.y);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [stageRef, zoom, bounds, x, y]);

  const handlers = {
    onPointerDown: (event) => {
      if (zoom <= 1 || event.button !== 0 || event.target.closest('a, button, input, [role="slider"]')) return;
      drag.current = { id: event.pointerId, sx: event.clientX, sy: event.clientY, x: x.get(), y: y.get() };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event) => {
      const d = drag.current;
      if (!d || d.id !== event.pointerId) return;
      const next = bounds(d.x + event.clientX - d.sx, d.y + event.clientY - d.sy);
      x.set(next.x);
      y.set(next.y);
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
  };

  return { x, y, handlers };
}

/** FLIP for zoom: start at the old size, spring to the new one. */
function useZoomBridge(zoom, reduce) {
  const scale = useMotionValue(1);
  const previous = useRef(zoom);
  useLayoutEffect(() => {
    if (previous.current === zoom) return undefined;
    const from = previous.current / zoom;
    previous.current = zoom;
    if (reduce) return undefined;
    scale.set(from);
    const run = animate(scale, 1, spring.gentle);
    return () => run.stop();
  }, [zoom, reduce, scale]);
  return scale;
}

/**
 * The reading room: toolbar, the flipbook on its stage, the scrubber and
 * thumbnail rail, and the overview grid. Owns page (in ?p=), zoom, pan,
 * overview and fullscreen state.
 * Props: brochure; onPlan opens the inquiry drawer; planOpen pauses the
 * page-turn shortcuts while it is open.
 */
export function Reader({ brochure, onPlan, planOpen = false }) {
  const pages = useMemo(() => (Array.isArray(brochure.pages) ? brochure.pages : []), [brochure.pages]);
  const count = pages.length;
  const reduce = useReducedMotion();
  const readerRef = useRef(null);
  const stageRef = useRef(null);
  const size = useElementSize(stageRef);
  const [zoom, setZoom] = useState(1);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [page, setPage] = usePageParam(count);
  const fullscreen = useFullscreen(readerRef);
  const share = useShare(brochure);

  // The drawer is portalled to <body>, outside the fullscreen element: leave fullscreen first.
  const { active: fullscreenActive, toggle: toggleFullscreen } = fullscreen;
  const plan = useCallback(() => {
    if (fullscreenActive) toggleFullscreen();
    onPlan();
  }, [fullscreenActive, toggleFullscreen, onPlan]);

  // Zoom re-lays the book out at its real size (text stays crisp); the
  // scale animation below only bridges the jump.
  const { base, layout } = useMemo(() => {
    const fit = computeBookLayout({ width: size.width, height: size.height, ...stagePadding(size.width) });
    const pageWidth = Math.round(fit.pageWidth * zoom);
    return { base: fit, layout: { ...fit, pageWidth, pageHeight: Math.round(pageWidth * PAGE_RATIO) } };
  }, [size.width, size.height, zoom]);
  const zoomScale = useZoomBridge(zoom, reduce);
  const book = useMemo(() => buildBook(count, base.mode), [count, base.mode]);
  const position = positionOfPage(book, page);
  const lastPosition = book.spreads.length - 1;
  const spread = book.spreads[position];
  const pan = usePan(stageRef, { zoom, layout: base, size });

  // The latest requested position, so rapid input stacks up instead of repeating.
  const target = useRef(position);
  useEffect(() => {
    target.current = position;
  }, [position]);

  const go = useCallback(
    (next) => {
      const clamped = Math.min(Math.max(next, 0), lastPosition);
      target.current = clamped;
      setPage(pageAtPosition(book, clamped));
    },
    [book, lastPosition, setPage],
  );
  const goToPage = useCallback((index) => go(positionOfPage(book, index)), [book, go]);
  const next = useCallback(() => go(target.current + 1), [go]);
  const prev = useCallback(() => go(target.current - 1), [go]);

  const reading = !overviewOpen && !planOpen && count > 0;
  useHotkey(['ArrowRight', 'PageDown'], next, { enabled: reading });
  useHotkey(['ArrowLeft', 'PageUp'], prev, { enabled: reading });
  useHotkey('Home', () => go(0), { enabled: reading });
  useHotkey('End', () => go(lastPosition), { enabled: reading });
  // Matched by key code ("+" is Shift+Equal): useHotkey reads "+" as a combo separator.
  useHotkey(['Equal', 'shift+Equal', 'NumpadAdd'], () => setZoom((z) => stepZoom(z, 1)), { enabled: reading });
  useHotkey(['Minus', 'NumpadSubtract'], () => setZoom((z) => stepZoom(z, -1)), { enabled: reading });
  useHotkey(['Digit0', 'Numpad0'], () => setZoom(1), { enabled: reading });

  const caption = spreadCaption(spread, pages);
  const announcement = count ? `${spreadAnnouncement(spread, count)}${caption ? `: ${caption}` : ''}` : '';
  const zoomed = zoom > 1;
  const sideArrows = size.width >= 600;
  const zoomIndex = ZOOM_LEVELS.indexOf(zoom);

  return (
    <section ref={readerRef} className={styles.reader} aria-label="Brochure reader" data-print="hide">
      <ReaderToolbar
        brochure={brochure}
        indicator={{ label: spreadLabel(spread), total: pad(count), caption }}
        onShare={share}
        overview={{ open: overviewOpen, onToggle: () => setOverviewOpen((o) => !o), disabled: count === 0 }}
        zoom={{
          value: zoom,
          canIn: zoomIndex < ZOOM_LEVELS.length - 1,
          canOut: zoomIndex > 0,
          onIn: () => setZoom(stepZoom(zoom, 1)),
          onOut: () => setZoom(stepZoom(zoom, -1)),
          onReset: () => setZoom(1),
        }}
        fullscreen={{ supported: fullscreen.supported, active: fullscreen.active, onToggle: fullscreen.toggle }}
        onPrint={() => window.print()}
        onPlan={plan}
      />

      <div className={styles.body}>
        <div
          ref={stageRef}
          className={styles.stage}
          data-zoomed={zoomed || undefined}
          data-mode={layout.mode}
          {...pan.handlers}
        >
          <div className={styles.surface} aria-hidden="true">
            <VerticalText className={styles.watermark}>{brochure.titleJp || '旅'}</VerticalText>
            <span className={styles.crop} data-corner="tl" />
            <span className={styles.crop} data-corner="tr" />
            <span className={styles.crop} data-corner="bl" />
            <span className={styles.crop} data-corner="br" />
          </div>

          {count === 0 ? (
            <div className={styles.empty}>
              <BookDashed aria-hidden="true" />
              <h2>This brochure has no pages yet</h2>
              <p>Add a cover and a few pages in the Studio, then come back to read it here.</p>
              <Button variant="primary" to={brochure.source === 'user' ? `/studio/${encodeURIComponent(brochure.id)}` : '/brochures'}>
                {brochure.source === 'user' ? 'Open in Studio' : 'Back to the library'}
              </Button>
            </div>
          ) : (
            size.width > 0 && (
              <motion.div className={styles.pan} style={{ x: pan.x, y: pan.y }}>
                <motion.div className={styles.center} style={{ scale: zoomScale }}>
                  <Flipbook
                    brochure={brochure}
                    book={book}
                    position={position}
                    onNavigate={go}
                    layout={layout}
                    onCta={plan}
                    interactive={!zoomed}
                    label={`${brochure.title} — ${count} pages`}
                  />
                </motion.div>
              </motion.div>
            )
          )}

          {count > 0 && sideArrows && (
            <>
              <span className={styles.arrow} data-side="prev">
                <IconButton label="Previous page" icon={<ArrowLeft />} variant="outline" size="lg" tooltipSide="right" onClick={prev} disabled={position === 0} />
              </span>
              <span className={styles.arrow} data-side="next">
                <IconButton label="Next page" icon={<ArrowRight />} variant="outline" size="lg" tooltipSide="left" onClick={next} disabled={position === lastPosition} />
              </span>
            </>
          )}

          <AnimatePresence>
            {zoomed && (
              <motion.div
                className={styles.zoomPill}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={spring.snappy}
              >
                <span className="mono">{Math.round(zoom * 100)}%</span>
                <span className={styles.zoomHint}>Drag or scroll to pan</span>
                <button type="button" className={styles.zoomReset} onClick={() => setZoom(1)}>
                  <RotateCcw aria-hidden="true" />
                  Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {count > 0 && (
          <div className={styles.bottom}>
            <div className={styles.scrubRow}>
              {!sideArrows && (
                <IconButton label="Previous page" icon={<ArrowLeft />} variant="outline" onClick={prev} disabled={position === 0} tooltip={false} />
              )}
              <p className={styles.counter} aria-hidden="true">
                <span className={styles.counterNow}>{spreadLabel(spread)}</span>
                <span className={styles.counterTotal}>/ {pad(count)}</span>
              </p>
              <Scrubber brochure={brochure} book={book} position={position} onChange={go} />
              {sideArrows ? (
                <p className={styles.keys}>
                  <Kbd>←</Kbd>
                  <Kbd>→</Kbd>
                  <span>turn</span>
                  <span className={styles.keysSep} aria-hidden="true" />
                  <span>drag a corner</span>
                </p>
              ) : (
                <IconButton label="Next page" icon={<ArrowRight />} variant="outline" onClick={next} disabled={position === lastPosition} tooltip={false} />
              )}
            </div>
            <ThumbRail brochure={brochure} book={book} position={position} onSelect={go} smooth={!reduce} />
          </div>
        )}

        <AnimatePresence>
          {overviewOpen && (
            <Overview
              brochure={brochure}
              book={book}
              position={position}
              onSelect={(index) => {
                goToPage(index);
                setOverviewOpen(false);
              }}
              onClose={() => setOverviewOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
