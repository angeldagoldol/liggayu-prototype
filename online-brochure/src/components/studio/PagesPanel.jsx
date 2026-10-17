import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from 'lucide-react';
import { PAGE_TYPES } from '../../data/schema.js';
import { Icon, IconButton } from '../ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { createId } from '../../lib/id.js';
import { pad } from '../../lib/format.js';
import { spring } from '../../lib/motion.js';
import { pageHeading, SECTION_JP } from '../brochure/blocks/pageUtils.js';
import { AddPageMenu } from './AddPageMenu.jsx';
import { studioActions as A } from './studioReducer.js';
import styles from './PagesPanel.module.css';

function PageRow({ page, brochure, index, total, selected, onOpen, onMove, onDuplicate, onRemove, onDragEnd }) {
  const controls = useDragControls();
  const meta = PAGE_TYPES[page.type] ?? { label: 'Page', icon: 'Info' };
  const heading = pageHeading(page, brochure);
  return (
    <Reorder.Item
      value={page.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={styles.row}
      data-selected={selected || undefined}
      whileDrag={{ scale: 1.03, boxShadow: 'var(--shadow-lg)', zIndex: 3 }}
      transition={spring.snappy}
    >
      <span
        className={styles.grip}
        onPointerDown={(event) => {
          event.preventDefault();
          controls.start(event);
        }}
        aria-hidden="true"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </span>
      <button type="button" className={styles.main} onClick={onOpen} aria-current={selected ? 'page' : undefined}>
        <span className={styles.number}>{pad(index + 1)}</span>
        <span className={styles.typeIcon} aria-hidden="true">
          <Icon name={meta.icon} size={16} />
        </span>
        <span className={styles.text}>
          <span className={styles.heading}>{heading}</span>
          <span className={styles.type}>
            {meta.label}
            <span lang="ja"> · {SECTION_JP[page.type] ?? ''}</span>
          </span>
        </span>
      </button>
      <span className={styles.actions}>
        <IconButton label={`Move “${heading}” up`} icon={<ArrowUp />} size="sm" tooltipSide="top" disabled={index === 0} onClick={() => onMove(index - 1)} />
        <IconButton
          label={`Move “${heading}” down`}
          icon={<ArrowDown />}
          size="sm"
          tooltipSide="top"
          disabled={index === total - 1}
          onClick={() => onMove(index + 1)}
        />
        <IconButton label={`Duplicate “${heading}”`} icon={<Copy />} size="sm" tooltipSide="top" onClick={onDuplicate} />
        <IconButton label={`Delete “${heading}”`} icon={<Trash2 />} size="sm" tooltipSide="left" disabled={total <= 1} onClick={onRemove} />
      </span>
    </Reorder.Item>
  );
}

/**
 * The page list: drag the handle (or use the arrow buttons) to reorder,
 * select to edit, duplicate, delete with an Undo toast, and add any page
 * type after the selected page.
 *   <PagesPanel brochure={doc} selectedId={id} dispatch={dispatch} onOpenPage={(id) => …} />
 */
export function PagesPanel({ brochure, selectedId, dispatch, onOpenPage }) {
  const toast = useToast();
  const pages = brochure.pages;
  const [dragOrder, setDragOrder] = useState(null);
  const [message, setMessage] = useState('');
  const byId = new Map(pages.map((p) => [p.id, p]));
  const order = dragOrder && dragOrder.length === pages.length && dragOrder.every((id) => byId.has(id)) ? dragOrder : pages.map((p) => p.id);
  const selectedIndex = pages.findIndex((p) => p.id === selectedId);

  const add = (type) => {
    const page = { id: createId('pg'), type, ...PAGE_TYPES[type].create() };
    dispatch(A.addPage(page));
    setMessage(`Added a ${PAGE_TYPES[type].label} page`);
    onOpenPage?.(page.id, { added: true });
  };

  const remove = (page, index) => {
    dispatch(A.removePage(page.id));
    const heading = pageHeading(page, brochure);
    setMessage(`Deleted ${heading}`);
    toast({
      title: 'Page deleted',
      description: `“${heading}” was removed.`,
      action: { label: 'Undo', onClick: () => dispatch(A.addPage(page, index)) },
    });
  };

  const commitDrag = () => {
    if (dragOrder) dispatch(A.reorderPages(dragOrder));
    setDragOrder(null);
  };

  return (
    <div className={styles.panel}>
      <header className={styles.head}>
        <p className={styles.count}>
          <span className={styles.big}>{pages.length}</span> {pages.length === 1 ? 'page' : 'pages'}
          <span lang="ja" className={styles.jp}>
            頁
          </span>
        </p>
        <AddPageMenu onAdd={add} where={selectedIndex >= 0 ? `after page ${pad(selectedIndex + 1)}` : 'at the end'} />
      </header>

      <Reorder.Group as="ol" axis="y" values={order} onReorder={setDragOrder} className={styles.list} aria-label="Pages in reading order">
        {order.map((id, index) => {
          const page = byId.get(id);
          return (
            <PageRow
              key={id}
              page={page}
              brochure={brochure}
              index={index}
              total={order.length}
              selected={id === selectedId}
              onOpen={() => onOpenPage?.(id)}
              onMove={(to) => {
                dispatch(A.movePage(id, to));
                setMessage(`Moved to position ${to + 1} of ${order.length}`);
              }}
              onDuplicate={() => {
                dispatch(A.duplicatePage(id, createId('pg')));
                setMessage(`Duplicated ${pageHeading(page, brochure)}`);
              }}
              onRemove={() => remove(page, index)}
              onDragEnd={commitDrag}
            />
          );
        })}
      </Reorder.Group>

      <p className={styles.hint}>Drag the handle to reorder — or use the arrows. A brochure opens with a cover and closes with a back cover.</p>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
