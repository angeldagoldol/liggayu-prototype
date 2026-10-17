import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { IconButton } from '../../../components/ui/index.js';
import { pad } from '../../../lib/format.js';
import { ease } from '../../../lib/motion.js';
import { SECTIONS, VOICES } from '../homeContent.js';
import { Postcard } from './Postcard.jsx';
import { SectionHead } from './SectionHead.jsx';
import styles from './Voices.module.css';

const SECONDS_PER_LETTER = 7;

/** Cards are dealt in from the side they come from and tossed out the other way. */
const deal = {
  enter: (dir) => ({ opacity: 0, x: dir * 90, y: 36, rotate: dir * 7 }),
  center: { opacity: 1, x: 0, y: 0, rotate: -1.2, transition: { type: 'spring', stiffness: 110, damping: 19 } },
  exit: (dir) => ({ opacity: 0, x: dir * -170, y: -24, rotate: dir * -9, transition: { duration: 0.45, ease: ease.in } }),
};

/**
 * 08 声 — letters from readers as a deck of postcards. Advances on its own
 * every few seconds while visible, pausing on hover, while keyboard focus is
 * inside, when the visitor presses pause, and by default under reduced motion.
 */
export function Voices() {
  const sectionRef = useRef(null);
  const shownIndex = useRef(0);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [userPaused, setUserPaused] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const progress = useMotionValue(0);
  const paused = userPaused ?? Boolean(reduce);
  const running = inView && !paused && !hovered && !focused;
  const count = VOICES.length;
  const voice = VOICES[index];

  useEffect(() => {
    // A new letter always starts its timer from zero.
    if (shownIndex.current !== index) {
      shownIndex.current = index;
      progress.set(0);
    }
    if (!running) return undefined;
    const controls = animate(progress, 1, {
      duration: SECONDS_PER_LETTER * (1 - progress.get()),
      ease: 'linear',
      onComplete: () => {
        setDirection(1);
        setIndex((i) => (i + 1) % count);
      },
    });
    return () => controls.stop();
  }, [running, index, progress, count]);

  const show = (next, dir) => {
    setDirection(dir);
    setIndex(((next % count) + count) % count);
  };

  return (
    <section ref={sectionRef} className={styles.section} aria-roledescription="carousel" aria-label="Letters from readers">
      <div
        className={`container ${styles.layout}`}
        onFocus={(event) => event.target.matches(':focus-visible') && setFocused(true)}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
      >
        <div className={styles.aside}>
          <SectionHead
            section={SECTIONS.voices}
            layout="stack"
            title={['Letters from ', { text: 'readers', className: 'serif-italic' }]}
            intro="Notes from people who planned, dreamed or simply read their way around Japan with Tabi."
          />

          <ol className={styles.readers}>
            {VOICES.map((v, i) => (
              <li key={v.id}>
                <button
                  type="button"
                  className={styles.reader}
                  aria-current={i === index || undefined}
                  aria-label={`Letter ${i + 1} of ${count}: ${v.name}, ${v.city}`}
                  onClick={() => i !== index && show(i, i > index ? 1 : -1)}
                >
                  <span className={styles.readerNum}>{pad(i + 1)}</span>
                  <span className={styles.readerName}>{v.name}</span>
                  <span className={styles.readerCity}>{v.city}</span>
                  <span className={styles.readerBar} aria-hidden="true">
                    {i === index && <motion.span className={styles.readerFill} style={{ scaleX: progress }} />}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className={styles.controls}>
            <IconButton label="Previous letter" icon={<ArrowLeft />} variant="outline" size="lg" tooltipSide="top" onClick={() => show(index - 1, -1)} />
            <IconButton
              label={paused ? 'Play letters automatically' : 'Pause letters'}
              icon={paused ? <Play /> : <Pause />}
              variant="solid"
              size="lg"
              tooltipSide="top"
              onClick={() => setUserPaused(!paused)}
            />
            <IconButton label="Next letter" icon={<ArrowRight />} variant="outline" size="lg" tooltipSide="top" onClick={() => show(index + 1, 1)} />
            <span className={styles.counter} aria-hidden="true">
              {pad(index + 1)} <span>/ {pad(count)}</span>
            </span>
          </div>
        </div>

        <div
          className={styles.stage}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <span className={styles.behind} data-depth="2" aria-hidden="true" />
          <span className={styles.behind} data-depth="1" aria-hidden="true" />
          <div className={styles.deck} aria-live={running ? 'off' : 'polite'}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={voice.id}
                className={styles.slot}
                custom={direction}
                variants={deal}
                initial="enter"
                animate="center"
                exit="exit"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
              >
                <Postcard voice={voice} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
