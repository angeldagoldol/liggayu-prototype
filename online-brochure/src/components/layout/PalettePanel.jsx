import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useBrochures } from '../../context/BrochureContext.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { backdrop, ease, spring } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';
import { CoverArt } from '../brochure/CoverArt.jsx';
import { Icon, Kbd } from '../ui/index.js';
import { highlight } from './search.js';
import { createPaletteIndex, queryPalette } from './paletteItems.js';
import styles from './PalettePanel.module.css';

const SUGGESTIONS = ['Kyoto', 'Onsen', 'Autumn', 'Hokkaidō', 'Ramen', '京都'];
const JAPANESE = /[\u3040-\u30ff\u3400-\u9fff]/;

const panel = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.16, ease: ease.in } },
};

/** Text with matched characters wrapped in <mark>. */
function Highlight({ text, ranges, lang }) {
  return (
    <span lang={lang}>
      {highlight(text, ranges).map((segment, i) =>
        segment.match ? (
          <mark key={i} className={styles.mark}>
            {segment.text}
          </mark>
        ) : (
          segment.text
        ),
      )}
    </span>
  );
}

/** Mini cover for brochures, an icon tile for everything else. */
function RowVisual({ item }) {
  if (item.kind === 'brochure') {
    const b = item.brochure;
    return (
      <span className={styles.swatch} aria-hidden="true">
        <CoverArt style={b.cover?.art ?? 'hinomaru'} seed={b.cover?.seed ?? 1} theme={b.theme} className={styles.swatchArt} />
      </span>
    );
  }
  return (
    <span className={cn(styles.iconTile, item.kind === 'action' && styles.iconAction)} aria-hidden="true">
      <Icon name={item.icon} size={17} />
    </span>
  );
}

function Row({ item, id, active, onRun, onHover }) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      className={styles.row}
      data-active={active || undefined}
      onClick={() => onRun(item)}
      onPointerMove={() => !active && onHover(item.index)}
    >
      {active && <motion.span layoutId="palette-active" className={styles.activeBg} transition={spring.snappy} />}
      <RowVisual item={item} />
      <span className={styles.text}>
        <span className={styles.title}>
          <Highlight text={item.title} ranges={item.matches?.title} />
          {item.titleJp && (
            <span className={styles.titleJp}>
              <Highlight text={item.titleJp} ranges={item.matches?.titleJp} lang="ja" />
            </span>
          )}
        </span>
        <span className={styles.meta}>{item.meta}</span>
      </span>
      <span className={styles.enter} aria-hidden="true">
        <CornerDownLeft size={14} />
      </span>
    </div>
  );
}

function EmptyState({ query, onPick, onBrowse }) {
  return (
    <div className={styles.empty}>
      <svg className={styles.emptyEnso} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M49 15a24 24 0 1 0 6 17" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <p className={styles.emptyTitle}>
        Nothing found for <q>{query}</q>
      </p>
      <p className={styles.emptyHint}>Try a place, a season or a craving:</p>
      <div className={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={styles.suggestion}
            onClick={() => onPick(s)}
            lang={JAPANESE.test(s) ? 'ja' : undefined}
          >
            {s}
          </button>
        ))}
      </div>
      <button type="button" className={styles.browse} onClick={onBrowse}>
        Browse the whole library →
      </button>
    </div>
  );
}

/**
 * The ⌘K / Ctrl K command palette panel: search brochures, places, library
 * filters and actions. ARIA combobox + listbox with aria-activedescendant;
 * ↑ ↓ Home End to move, Enter to open, Esc to close. Lazy-loaded by
 * <CommandPalette> so its search index, cover art and icon registry stay out
 * of the entry chunk. Props: onClose.
 */
export default function PalettePanel({ onClose }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { brochures, builtins, recentIds } = useBrochures();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  useFocusTrap(panelRef, true, inputRef);
  useLockBodyScroll(true);

  const paletteIndex = useMemo(() => createPaletteIndex({ brochures, theme }), [brochures, theme]);
  const { groups, flat } = useMemo(() => queryPalette(paletteIndex, query, recentIds), [paletteIndex, query, recentIds]);
  const activeIndex = flat.length ? Math.min(active, flat.length - 1) : -1;
  const activeItem = flat[activeIndex];
  const optionId = (item) => `${baseId}-opt-${item.index}`;
  const activeId = activeItem ? optionId(activeItem) : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const run = (item) => {
    onClose();
    if (item.action === 'toggle-theme') toggle();
    else if (item.action === 'random-brochure') {
      const pool = builtins.length ? builtins : brochures;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) navigate(`/brochures/${pick.slug}`);
    } else if (item.to) navigate(item.to);
  };

  const updateQuery = (value) => {
    setQuery(value);
    setActive(0);
  };

  const onInputKeyDown = (event) => {
    if (!flat.length) return;
    const last = flat.length - 1;
    const moves = {
      ArrowDown: activeIndex >= last ? 0 : activeIndex + 1,
      ArrowUp: activeIndex <= 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };
    if (event.key in moves && !event.shiftKey) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === 'Enter' && activeItem) {
      event.preventDefault();
      run(activeItem);
    }
  };

  const trimmed = query.trim();

  return (
    <div className={styles.root} data-print="hide">
      <motion.div
        className={styles.backdrop}
        variants={backdrop}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Tabi"
        className={styles.panel}
        variants={panel}
        initial="hidden"
        animate="show"
        exit="exit"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <div className={styles.searchRow}>
          <Search className={styles.searchIcon} size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search brochures, places, pages and actions"
            placeholder="Search Kyoto, onsen, 秋…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
          />
          {query && (
            <button type="button" className={styles.clear} onClick={() => updateQuery('')} aria-label="Clear search">
              <X size={15} aria-hidden="true" />
            </button>
          )}
          <button type="button" className={styles.esc} onClick={onClose} aria-label="Close search">
            <span className={styles.escKey}>Esc</span>
            <X className={styles.escIcon} size={18} aria-hidden="true" />
          </button>
        </div>

        <motion.div layoutScroll className={styles.results}>
          <div id={listId} role="listbox" aria-label="Results" className={styles.listbox}>
            {groups.map((group) => (
              <div key={group.id} role="group" aria-labelledby={`${baseId}-${group.id}`} className={styles.group}>
                <div id={`${baseId}-${group.id}`} className={styles.groupLabel}>
                  <span>{group.label}</span>
                  <span lang="ja" className={styles.groupJp} aria-hidden="true">
                    {group.jp}
                  </span>
                </div>
                {group.items.map((item) => (
                  <Row
                    key={item.id}
                    id={optionId(item)}
                    item={item}
                    active={item.index === activeIndex}
                    onRun={run}
                    onHover={setActive}
                  />
                ))}
              </div>
            ))}
          </div>
          {!flat.length && (
            <EmptyState
              query={trimmed}
              onPick={(s) => {
                updateQuery(s);
                inputRef.current?.focus();
              }}
              onBrowse={() => {
                onClose();
                navigate(`/brochures?q=${encodeURIComponent(trimmed)}`);
              }}
            />
          )}
        </motion.div>

        <footer className={styles.footer}>
          <span className={styles.hint}>
            <Kbd className={styles.kbd}>↑</Kbd>
            <Kbd className={styles.kbd}>↓</Kbd> Navigate
          </span>
          <span className={styles.hint}>
            <Kbd className={styles.kbd}>↵</Kbd> Open
          </span>
          <span className={styles.hint}>
            <Kbd className={styles.kbd}>Esc</Kbd> Close
          </span>
          <span className={styles.tagline} aria-hidden="true">
            Japan, folded into pages
          </span>
          <span className={styles.count} aria-live="polite" aria-atomic="true">
            {trimmed ? `${flat.length} ${flat.length === 1 ? 'result' : 'results'}` : ''}
          </span>
          <span lang="ja" className={styles.brand} aria-hidden="true">
            旅
          </span>
        </footer>
      </motion.div>
    </div>
  );
}
