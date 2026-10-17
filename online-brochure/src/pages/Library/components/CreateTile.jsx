import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { VerticalText } from '../../../components/ui/index.js';
import styles from './CreateTile.module.css';

/** Dashed "blank brochure" tile that starts a new one in the Studio. */
export function CreateTile() {
  return (
    <Link to="/studio" className={styles.tile}>
      <span className={styles.page}>
        <span className={styles.plus} aria-hidden="true">
          <Plus />
        </span>
        <VerticalText className={styles.jp} aria-hidden="true">
          新しい旅
        </VerticalText>
      </span>
      <span className={styles.meta}>
        <span className={styles.title}>Create new</span>
        <span className={styles.text}>Start blank, or remix any brochure in the Studio.</span>
      </span>
    </Link>
  );
}
