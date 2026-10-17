/**
 * Motion system. One place for easing curves, springs and reusable variants,
 * so every animation in Tabi shares the same physical "feel".
 *
 * Global reduced-motion handling is done by <MotionConfig reducedMotion="user">
 * in main.jsx, which turns transform/layout animations into instant changes.
 */

export const ease = {
  out: [0.16, 1, 0.3, 1], // expo-out: fast start, long graceful settle
  inOut: [0.76, 0, 0.24, 1], // quart-in-out: deliberate, editorial
  in: [0.7, 0, 0.84, 0],
  soft: [0.22, 1, 0.36, 1],
};

export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 170, damping: 26 },
  bouncy: { type: 'spring', stiffness: 320, damping: 18 },
  page: { type: 'spring', stiffness: 80, damping: 17, mass: 1.1 }, // paper turning
  magnetic: { type: 'spring', stiffness: 220, damping: 16, mass: 0.4 },
};

export const duration = { fast: 0.2, base: 0.45, slow: 0.8, slower: 1.2 };

/** Shared `whileInView` viewport options: animate once, when ~25% visible. */
export const viewportOnce = { once: true, amount: 0.25 };

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.out } },
};

/** Text line rising out of an overflow-hidden mask. */
export const lineReveal = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1, ease: ease.out } },
};

/** Parent variant that staggers its children. */
export function stagger(each = 0.08, delayChildren = 0) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: each, delayChildren } },
  };
}

/** Route-level transition used by <PageTransition>. */
export const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: ease.in } },
};

/** Overlay (modal / drawer / palette) backdrop. */
export const backdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: ease.in } },
};
