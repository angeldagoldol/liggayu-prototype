import { useRef, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { MemoryRouter } from 'react-router-dom';
import { BrochureProvider } from '../../context/BrochureContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';
import { serializeBrochure } from './brochureIO.js';
import { IconPicker } from './fields/IconPicker.jsx';
import { ListEditor } from './fields/ListEditor.jsx';
import { NumberField } from './fields/NumberField.jsx';
import { PagesPanel } from './PagesPanel.jsx';
import { StudioEditor } from './StudioEditor.jsx';
import { DRAFT_KEY, readDraft } from './draftStore.js';
import { createBlank, createFromTemplate } from './templates.js';
import { useAutosave, useStudio } from './useStudio.js';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function renderEditor(doc = createBlank()) {
  return render(
    <MemoryRouter initialEntries={['/studio?draft=1']}>
      <ToastProvider>
        <BrochureProvider>
          <StudioEditor mode="new" initial={{ doc, selectedId: doc.pages[0].id, savedAt: 0 }} storageKey="studio-draft" />
        </BrochureProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

const undoKey = (target) => fireEvent.keyDown(target, { key: 'z', code: 'KeyZ', ctrlKey: true });
// Lets presence animations (the save indicator's label swap) finish inside act().
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)));

describe('<StudioEditor>', () => {
  it('lands focus on its heading when opened from the start screen (regression)', () => {
    document.body.focus();
    renderEditor(createFromTemplate('food-crawl'));
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent('Studio: designing “Fukuoka: A Yatai Crawl”');
  });

  it('says how long ago restored changes were made', () => {
    const doc = { ...createBlank(), id: 'b_mine', source: 'user' };
    render(
      <MemoryRouter initialEntries={['/studio/b_mine']}>
        <ToastProvider>
          <BrochureProvider>
            <StudioEditor
              mode="edit"
              initial={{ doc: { ...doc, title: 'Changed' }, selectedId: null, savedAt: Date.now() - 5 * 60_000 }}
              baseline={doc}
              storageKey="studio-edit:b_mine"
              restored
            />
          </BrochureProvider>
        </ToastProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Restored the unsaved changes you made 5 min ago\./)).toBeInTheDocument();
  });

  it('undoes a whole burst of typing in a field with ⌘Z (regression)', async () => {
    renderEditor();
    const title = screen.getByLabelText('Brochure title');
    const original = title.value;
    for (const suffix of [' X', ' XY', ' XYZ']) fireEvent.change(title, { target: { value: original + suffix } });
    expect(title).toHaveValue(`${original} XYZ`);
    undoKey(title);
    expect(title).toHaveValue(original);
    fireEvent.keyDown(title, { key: 'z', code: 'KeyZ', ctrlKey: true, shiftKey: true });
    expect(title).toHaveValue(`${original} XYZ`);
    await settle();
  });

  it('“Undo import” restores the document from before the import, even after more edits (regression)', async () => {
    const { container } = renderEditor();
    const title = screen.getByLabelText('Brochure title');
    const original = title.value;
    const incoming = { ...createFromTemplate('temple-trail'), title: 'Imported trail' };
    const file = new File([serializeBrochure(incoming)], 'trail.tabi.json', { type: 'application/json' });
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
    await waitFor(() => expect(title).toHaveValue('Imported trail'));
    fireEvent.change(title, { target: { value: 'Imported trail, edited' } });
    fireEvent.click(screen.getByRole('button', { name: 'Undo import' }));
    expect(title).toHaveValue(original);
    await settle();
  });
});

describe('<ListEditor>', () => {
  const limit = { min: 1, max: 6 };
  const renderList = (items, onAdd = () => {}) => (
    <ListEditor
      title="Stops"
      noun="stop"
      items={items}
      limit={limit}
      onAdd={onAdd}
      onRemove={() => {}}
      onMove={() => {}}
      itemTitle={(item) => item}
      renderItem={(item) => <span>{item}</span>}
    />
  );
  const rowOpacity = (container, index) => container.querySelector(`[data-item="${index}"]`).style.opacity;

  it('plays the entrance only on a row that was just added, not one restored by undo (regression)', () => {
    MotionGlobalConfig.skipAnimations = false;
    try {
      const { container, rerender } = render(renderList(['a', 'b', 'c']));
      rerender(renderList(['a', 'c']));
      rerender(renderList(['a', 'b', 'c'])); // undo brings row 3 back
      expect(rowOpacity(container, 2)).not.toBe('0');
      fireEvent.click(screen.getByRole('button', { name: 'Add stop' }));
      rerender(renderList(['a', 'b', 'c', 'd']));
      expect(rowOpacity(container, 3)).toBe('0');
    } finally {
      MotionGlobalConfig.skipAnimations = true;
    }
  });
});

describe('useAutosave', () => {
  function Saver({ draft }) {
    useAutosave('studio-draft', draft, { delay: 60_000 });
    return null;
  }

  it('flushes pending work when the tab is hidden (regression)', () => {
    const first = { doc: { id: 'b_1', title: 'One', pages: [{ id: 'p', type: 'cover' }] }, selectedId: 'p' };
    const second = { ...first, doc: { ...first.doc, title: 'Two' } };
    const { rerender } = render(<Saver draft={first} />);
    rerender(<Saver draft={second} />);
    expect(readDraft(DRAFT_KEY)).toBeNull();
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    try {
      fireEvent(document, new Event('visibilitychange'));
    } finally {
      visibility.mockRestore();
    }
    expect(readDraft(DRAFT_KEY)?.doc.title).toBe('Two');
  });
});

function PanelHarness({ doc, compact = false }) {
  const [state, dispatch] = useStudio(doc, doc.pages[0].id);
  return (
    <ToastProvider>
      <PagesPanel brochure={state.doc} selectedId={state.selectedId} dispatch={dispatch} onOpenPage={() => {}} compact={compact} />
    </ToastProvider>
  );
}

describe('<PagesPanel>', () => {
  const doc = createFromTemplate('food-crawl');
  const second = doc.pages[1];
  const heading = (page) => page.heading || page.title;

  it('keeps focus on the moved page, on the arrow that still works (regression)', async () => {
    render(<PanelHarness doc={doc} />);
    const up = screen.getByRole('button', { name: `Move “${heading(second)}” up` });
    act(() => up.focus());
    fireEvent.click(up);
    await waitFor(() => expect(screen.getByRole('button', { name: `Move “${heading(second)}” down` })).toHaveFocus());
    expect(screen.getByRole('button', { name: `Move “${heading(second)}” up` })).toBeDisabled();
  });

  it('moves focus to a neighbour after a delete and says how to undo (regression)', async () => {
    const fine = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: query === '(pointer: fine)', media: query, addEventListener() {}, removeEventListener() {} }));
    render(<PanelHarness doc={doc} />);
    fireEvent.click(screen.getByRole('button', { name: `Delete “${heading(second)}”` }));
    const neighbour = doc.pages[2];
    await waitFor(() => expect(document.activeElement).toHaveTextContent(heading(neighbour)));
    expect(document.activeElement.closest('[data-page-id]').dataset.pageId).toBe(neighbour.id);
    // The toast's announcer is what a screen reader hears.
    expect(screen.getByRole('status')).toHaveTextContent(/was removed\. Ctrl Z undoes it\./);
    fine.mockRestore();
  });

  it('keeps only the selected row’s actions in the Tab order when compact', () => {
    render(<PanelHarness doc={doc} compact />);
    const firstRow = screen.getByRole('button', { name: `Duplicate “${heading(doc.pages[0])}”` });
    const otherRow = screen.getByRole('button', { name: `Duplicate “${heading(second)}”` });
    expect(firstRow).not.toHaveAttribute('tabindex');
    expect(otherRow).toHaveAttribute('tabindex', '-1');
  });
});

describe('<NumberField>', () => {
  function Harness({ onCommit }) {
    const [value, setValue] = useState(47);
    return (
      <>
        <NumberField
          label="Number"
          value={value}
          onChange={(next) => {
            onCommit(next);
            setValue(next);
          }}
        />
        <button type="button" onClick={() => setValue(3776)}>
          Undo
        </button>
      </>
    );
  }

  it('keeps “0.0” while typing 0.05, and follows outside changes (regression)', () => {
    const commits = [];
    render(<Harness onCommit={(n) => commits.push(n)} />);
    const input = screen.getByLabelText('Number');
    for (const text of ['0', '0.0', '0.05']) fireEvent.change(input, { target: { value: text } });
    expect(input).toHaveValue(0.05);
    expect(input.value).toBe('0.05');
    expect(commits).toEqual([0, 0, 0.05]);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(input.value).toBe('3776');
    // Past the limit the field shows the clamped figure instead of piling up digits.
    fireEvent.change(input, { target: { value: '99999999999999999999' } });
    expect(input.value).toBe('1000000000000');
    expect(commits.at(-1)).toBe(1e12);
  });
});

describe('Studio popovers', () => {
  function Harness() {
    const [icon, setIcon] = useState('Landmark');
    const after = useRef(null);
    return (
      <>
        <IconPicker value={icon} onChange={setIcon} label="Highlight icon" />
        <input ref={after} aria-label="Title" />
      </>
    );
  }

  it('Tab past the end closes the picker and continues after its trigger (regression)', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /Highlight icon: .*Change/ }));
    const search = await screen.findByRole('searchbox', { name: 'Search icons' });
    fireEvent.change(search, { target: { value: 'temple' } });
    const option = screen.getAllByRole('option').find((el) => el.tabIndex === 0);
    act(() => option.focus());
    fireEvent.keyDown(option, { key: 'Tab' });
    expect(screen.getByLabelText('Title')).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Shift+Tab before the start returns to the trigger', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: /Highlight icon: .*Change/ });
    fireEvent.click(trigger);
    const search = await screen.findByRole('searchbox', { name: 'Search icons' });
    act(() => search.focus());
    fireEvent.keyDown(search, { key: 'Tab', shiftKey: true });
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
