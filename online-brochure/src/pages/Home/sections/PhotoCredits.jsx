import { PhotoCredit } from '../../../components/photo/PhotoCredit.jsx';
import { getPhoto } from '../../../data/photos/index.js';
import { cn } from '../../../lib/cn.js';
import { creditEntries } from '../photoCredits.js';
import styles from './PhotoCredits.module.css';

/**
 * A printed credit line for photographs shown without their own chip (the
 * hero tri-fold, whose pictures sit inside one 3D object):
 * a colophon block, the lead-in beside one credit per line
 * ("PHOTOS  Mount Fuji: Author · CC BY-SA 4.0").
 * Each entry is the shared <PhotoCredit> (author → Commons file page,
 * licence → deed, new tab; the author shortens before the licence does).
 * Renders nothing until at least one of the photos is downloaded.
 *
 * - `slots`  `[{ id, label }]` photo ids with a short label each.
 * - `label`  the line's lead-in ("Photos").
 */
export function PhotoCredits({ slots, label = 'Photos', className }) {
  const entries = creditEntries(slots, getPhoto);
  if (entries.length === 0) return null;
  return (
    <p className={cn(styles.credits, className)}>
      <span className={styles.lead}>{label}</span>
      {entries.map((entry) => (
        <PhotoCredit key={entry.id} credit={entry} label={entry.label ? `${entry.label}:` : ''} as="span" className={styles.credit} />
      ))}
    </p>
  );
}
