import { useEffect, useState } from 'react';
import { formatJapanTime, msUntilNextMinute } from '../../../components/layout/japanTime.js';
import { cn } from '../../../lib/cn.js';
import styles from './TokyoClock.module.css';

/**
 * Live Tokyo time ("Tokyo 21:04 JST"), whatever the visitor's own time zone.
 * Ticks on the minute; the colon blinks unless reduced motion is on.
 */
export function TokyoClock({ className }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval = 0;
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 60_000);
    }, msUntilNextMinute());
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const time = formatJapanTime(now);
  const [hours, minutes] = time.split(':');

  return (
    <p className={cn(styles.clock, className)}>
      <span className={styles.live} aria-hidden="true" />
      <span>Tokyo</span>
      <time dateTime={now.toISOString()} className={styles.time}>
        <span className="sr-only">{time}</span>
        <span aria-hidden="true">
          {hours}
          <span className={styles.colon}>:</span>
          {minutes}
        </span>
      </time>
      <abbr title="Japan Standard Time" className={styles.zone}>
        JST
      </abbr>
    </p>
  );
}
