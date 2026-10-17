import { cn } from '../../lib/cn.js';
import styles from './Marquee.module.css';

/**
 * Seamless infinite ticker (pure CSS animation, pauses on hover).
 *   <Marquee speed={40} reverse>{items}</Marquee>
 * speed = seconds per full loop. The duplicate copy is hidden from AT.
 */
export function Marquee({ children, speed = 40, reverse = false, pauseOnHover = true, gap = '3rem', fade = true, className }) {
  return (
    <div
      className={cn(styles.marquee, { [styles.pausable]: pauseOnHover, [styles.fade]: fade }, className)}
      style={{ '--duration': `${speed}s`, '--gap': gap }}
      data-reverse={reverse || undefined}
    >
      <div className={styles.track}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
