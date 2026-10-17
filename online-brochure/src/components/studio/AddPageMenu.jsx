import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PAGE_TYPES, PAGE_TYPE_IDS } from '../../data/schema.js';
import { Button, Icon } from '../ui/index.js';
import { ease } from '../../lib/motion.js';
import { SECTION_JP } from '../brochure/blocks/pageUtils.js';
import { nextIndex } from './a11y.js';
import { Popover } from './Popover.jsx';
import styles from './AddPageMenu.module.css';

/**
 * "Add page" button with a menu of every page type (icon, name, what it is
 * for and its Japanese section name). Arrow keys move, Enter adds.
 *   <AddPageMenu onAdd={(type) => …} where="after page 03" />
 */
export function AddPageMenu({ onAdd, where, variant = 'primary', size = 'sm', block = false }) {
  const anchorRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);

  const onKeyDown = (event) => {
    const items = [...(listRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
    const current = items.indexOf(document.activeElement);
    const next = nextIndex(event.key, current, items.length);
    if (next === -1 || event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
    event.preventDefault();
    items[next]?.focus();
  };

  const choose = (type) => {
    setOpen(false);
    onAdd(type);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        variant={variant}
        size={size}
        block={block}
        iconLeft={<Plus />}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Add page
      </Button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} role="menu" label="Add a page" placement="bottom-end" className={styles.menu}>
        <p className={styles.head} aria-hidden="true">
          <span>Add a page</span>
          <span lang="ja">頁を足す</span>
        </p>
        {where && <p className={styles.where}>Goes {where}</p>}
        <motion.ul
          ref={listRef}
          role="none"
          className={styles.list}
          onKeyDown={onKeyDown}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }}
        >
          {PAGE_TYPE_IDS.map((type) => {
            const meta = PAGE_TYPES[type];
            return (
              <motion.li
                key={type}
                role="none"
                variants={{
                  hidden: { opacity: 0, x: -6 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.out } },
                }}
              >
                <button type="button" role="menuitem" className={styles.item} onClick={() => choose(type)}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon name={meta.icon} size={18} />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.label}>{meta.label}</span>
                    <span className={styles.description}>{meta.description}</span>
                  </span>
                  <span lang="ja" className={styles.jp} aria-hidden="true">
                    {SECTION_JP[type]}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </Popover>
    </>
  );
}
