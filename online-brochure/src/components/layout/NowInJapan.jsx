import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn.js';
import { japanNow, msUntilNextMinute } from './japanTime.js';
import styles from './NowInJapan.module.css';

/** Japan's season and Tokyo time, re-read on every minute boundary. */
function useJapanClock() {
  const [now, setNow] = useState(() => japanNow());
  useEffect(() => {
    let interval;
    const timeout = setTimeout(() => {
      setNow(japanNow());
      interval = setInterval(() => setNow(japanNow()), 60000);
    }, msUntilNextMinute());
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);
  return now;
}

/**
 * "Now in Japan: 秋 Autumn — maple season · 21:04 JST" — a live strip with
 * the current Japanese season and Tokyo time. Props: className.
 */
export function NowInJapan({ className }) {
  const now = useJapanClock();
  return (
    <p className={cn(styles.now, className)}>
      <span className={styles.label}>
        <span className={styles.pulse} aria-hidden="true" />
        Now in Japan
      </span>
      <span className={styles.season}>
        <span lang="ja" className={styles.seasonJp}>
          {now.season.jp}
        </span>{' '}
        {now.season.label} <span className={styles.dash}>—</span> {now.note}
      </span>
      <span className={styles.clock}>
        <time dateTime={now.time}>{now.time}</time> JST · Tokyo
      </span>
    </p>
  );
}
