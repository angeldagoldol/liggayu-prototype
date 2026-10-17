/**
 * The Studio's document state: a brochure draft, the selected page and an
 * undo/redo history. Pure — ids and timestamps arrive on the actions (see the
 * creators at the bottom), so every transition is deterministic and testable.
 *
 * History entries are { doc, selectedId } snapshots, so undo also brings the
 * editor back to the page where the change happened. Rapid typing into one
 * field (actions flagged `typing`) coalesces into a single undo step.
 */
import { PAGE_TYPES } from '../../data/schema.js';
import { listLimit } from './pageLimits.js';

export const HISTORY_LIMIT = 50;
/** Typing pauses longer than this start a new undo step. */
export const COALESCE_MS = 1000;

const DOC_FIELDS = new Set([
  'title',
  'titleJp',
  'subtitle',
  'organization',
  'summary',
  'category',
  'region',
  'seasons',
  'format',
  'tags',
]);
const THEME_FIELDS = new Set(['paper', 'ink', 'accent', 'accent2', 'muted', 'typeface']);
const LOCKED_PAGE_KEYS = new Set(['id', 'type']);

/** Fresh state for a document; history starts empty. */
export function createStudioState(doc, selectedId) {
  const pages = doc?.pages ?? [];
  const selected = pages.some((p) => p.id === selectedId) ? selectedId : (pages[0]?.id ?? null);
  return { doc, selectedId: selected, past: [], future: [], last: null };
}

/* --- Immutable path helpers --------------------------------------------- */

export function getIn(target, path) {
  return path.reduce((node, key) => (node == null ? undefined : node[key]), target);
}

/** Set `value` at `path`, copying only the containers along the way. */
export function setIn(target, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(target) ? [...target] : { ...(target ?? {}) };
  copy[head] = setIn(target?.[head], rest, value);
  return copy;
}

function moveIndex(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* --- Commit with history ------------------------------------------------- */

function commit(state, doc, { selectedId = state.selectedId, key = null, at = 0 } = {}) {
  if (doc === state.doc) return selectedId === state.selectedId ? state : { ...state, selectedId };
  const coalesce = key !== null && state.last?.key === key && at - state.last.at <= COALESCE_MS;
  const past = coalesce
    ? state.past
    : [...state.past, { doc: state.doc, selectedId: state.selectedId }].slice(-HISTORY_LIMIT);
  return { doc, selectedId, past, future: [], last: key === null ? null : { key, at } };
}

function withPages(state, pages) {
  return { ...state.doc, pages };
}

function pageIndex(state, id) {
  return state.doc.pages.findIndex((p) => p.id === id);
}

/** Where a new page goes: after the selection, but never after a closing back cover. */
function insertionIndex(pages, selectedId) {
  const selected = pages.findIndex((p) => p.id === selectedId);
  let index = selected === -1 ? pages.length : selected + 1;
  if (index === pages.length && pages[pages.length - 1]?.type === 'back') index -= 1;
  return Math.max(0, index);
}

function updatePageAt(state, id, updater) {
  const index = pageIndex(state, id);
  if (index === -1) return null;
  const page = state.doc.pages[index];
  const nextPage = updater(page);
  if (!nextPage || nextPage === page) return null;
  const pages = [...state.doc.pages];
  pages[index] = nextPage;
  return withPages(state, pages);
}

/* --- Reducer -------------------------------------------------------------- */

export function studioReducer(state, action) {
  const at = action.at ?? 0;
  switch (action.type) {
    case 'load':
      return createStudioState(action.doc, action.selectedId);

    case 'select':
      return state.doc.pages.some((p) => p.id === action.id) ? { ...state, selectedId: action.id, last: null } : state;

    case 'setField': {
      if (!DOC_FIELDS.has(action.field) || Object.is(state.doc[action.field], action.value)) return state;
      const key = action.typing ? `field:${action.field}` : null;
      return commit(state, { ...state.doc, [action.field]: action.value }, { key, at });
    }

    case 'setTheme': {
      if (!THEME_FIELDS.has(action.field) || state.doc.theme?.[action.field] === action.value) return state;
      const key = action.typing ? `theme:${action.field}` : null;
      return commit(state, { ...state.doc, theme: { ...state.doc.theme, [action.field]: action.value } }, { key, at });
    }

    case 'applyPalette': {
      const theme = { ...state.doc.theme, ...action.theme };
      const same = Object.keys(theme).every((k) => theme[k] === state.doc.theme?.[k]);
      return same ? state : commit(state, { ...state.doc, theme }, { at });
    }

    case 'setCover': {
      const cover = { ...state.doc.cover };
      if (action.art !== undefined) cover.art = action.art;
      if (action.seed !== undefined) cover.seed = action.seed;
      if (cover.art === state.doc.cover?.art && cover.seed === state.doc.cover?.seed) return state;
      return commit(state, { ...state.doc, cover }, { at });
    }

    case 'addPage': {
      if (!action.page?.id || !PAGE_TYPES[action.page.type]) return state;
      if (pageIndex(state, action.page.id) !== -1) return state;
      const pages = [...state.doc.pages];
      const index = Number.isInteger(action.index)
        ? clamp(action.index, 0, pages.length)
        : insertionIndex(pages, state.selectedId);
      pages.splice(index, 0, action.page);
      return commit(state, withPages(state, pages), { selectedId: action.page.id, at });
    }

    case 'duplicatePage': {
      const index = pageIndex(state, action.id);
      if (index === -1 || !action.newId || pageIndex(state, action.newId) !== -1) return state;
      const copy = { ...structuredClone(state.doc.pages[index]), id: action.newId };
      const pages = [...state.doc.pages];
      pages.splice(index + 1, 0, copy);
      return commit(state, withPages(state, pages), { selectedId: copy.id, at });
    }

    case 'removePage': {
      const index = pageIndex(state, action.id);
      if (index === -1 || state.doc.pages.length <= 1) return state;
      const pages = state.doc.pages.filter((p) => p.id !== action.id);
      const selectedId =
        state.selectedId === action.id ? pages[Math.min(index, pages.length - 1)].id : state.selectedId;
      return commit(state, withPages(state, pages), { selectedId, at });
    }

    case 'movePage': {
      const from = pageIndex(state, action.id);
      if (from === -1) return state;
      const to = clamp(action.to, 0, state.doc.pages.length - 1);
      if (to === from) return state;
      return commit(state, withPages(state, moveIndex(state.doc.pages, from, to)), { at });
    }

    case 'reorderPages': {
      const { pages } = state.doc;
      const ids = action.ids ?? [];
      const byId = new Map(pages.map((p) => [p.id, p]));
      const valid = ids.length === pages.length && new Set(ids).size === ids.length && ids.every((id) => byId.has(id));
      if (!valid || ids.every((id, i) => pages[i].id === id)) return state;
      return commit(state, withPages(state, ids.map((id) => byId.get(id))), { at });
    }

    case 'updatePage': {
      const path = action.path ?? [];
      if (path.length === 0 || LOCKED_PAGE_KEYS.has(path[0])) return state;
      const doc = updatePageAt(state, action.id, (page) =>
        Object.is(getIn(page, path), action.value) ? page : setIn(page, path, action.value),
      );
      if (!doc) return state;
      const key = action.typing ? `page:${action.id}:${path.join('.')}` : null;
      return commit(state, doc, { selectedId: action.id, key, at });
    }

    case 'addItem': {
      const doc = updatePageAt(state, action.id, (page) => {
        const list = getIn(page, action.path);
        const items = Array.isArray(list) ? list : [];
        if (items.length >= listLimit(page.type, action.path).max) return page;
        const index = Number.isInteger(action.index) ? clamp(action.index, 0, items.length) : items.length;
        const next = [...items];
        next.splice(index, 0, action.item);
        return setIn(page, action.path, next);
      });
      return doc ? commit(state, doc, { selectedId: action.id, at }) : state;
    }

    case 'removeItem': {
      const doc = updatePageAt(state, action.id, (page) => {
        const list = getIn(page, action.path);
        if (!Array.isArray(list) || action.index < 0 || action.index >= list.length) return page;
        if (list.length <= listLimit(page.type, action.path).min) return page;
        return setIn(page, action.path, list.filter((_, i) => i !== action.index));
      });
      return doc ? commit(state, doc, { selectedId: action.id, at }) : state;
    }

    case 'moveItem': {
      const doc = updatePageAt(state, action.id, (page) => {
        const list = getIn(page, action.path);
        if (!Array.isArray(list) || action.from < 0 || action.from >= list.length) return page;
        const to = clamp(action.to, 0, list.length - 1);
        return to === action.from ? page : setIn(page, action.path, moveIndex(list, action.from, to));
      });
      return doc ? commit(state, doc, { selectedId: action.id, at }) : state;
    }

    case 'replaceDoc': {
      if (!action.doc || !Array.isArray(action.doc.pages)) return state;
      const { pages } = action.doc;
      const keep = pages.some((p) => p.id === (action.selectedId ?? state.selectedId));
      const selectedId = keep ? (action.selectedId ?? state.selectedId) : (pages[0]?.id ?? null);
      return commit(state, action.doc, { selectedId, at });
    }

    case 'undo': {
      if (state.past.length === 0) return state;
      const entry = state.past[state.past.length - 1];
      return {
        doc: entry.doc,
        selectedId: entry.selectedId,
        past: state.past.slice(0, -1),
        future: [{ doc: state.doc, selectedId: state.selectedId }, ...state.future].slice(0, HISTORY_LIMIT),
        last: null,
      };
    }

    case 'redo': {
      if (state.future.length === 0) return state;
      const [entry, ...future] = state.future;
      return {
        doc: entry.doc,
        selectedId: entry.selectedId,
        past: [...state.past, { doc: state.doc, selectedId: state.selectedId }].slice(-HISTORY_LIMIT),
        future,
        last: null,
      };
    }

    default:
      return state;
  }
}

/* --- Action creators -------------------------------------------------------
 * The UI dispatches these through a wrapper that stamps `at: Date.now()`.  */

export const studioActions = {
  load: (doc, selectedId) => ({ type: 'load', doc, selectedId }),
  select: (id) => ({ type: 'select', id }),
  setField: (field, value, typing = false) => ({ type: 'setField', field, value, typing }),
  setTheme: (field, value, typing = false) => ({ type: 'setTheme', field, value, typing }),
  applyPalette: (theme) => ({ type: 'applyPalette', theme }),
  setCover: (cover) => ({ type: 'setCover', ...cover }),
  addPage: (page, index) => ({ type: 'addPage', page, index }),
  duplicatePage: (id, newId) => ({ type: 'duplicatePage', id, newId }),
  removePage: (id) => ({ type: 'removePage', id }),
  movePage: (id, to) => ({ type: 'movePage', id, to }),
  reorderPages: (ids) => ({ type: 'reorderPages', ids }),
  updatePage: (id, path, value, typing = false) => ({ type: 'updatePage', id, path, value, typing }),
  addItem: (id, path, item, index) => ({ type: 'addItem', id, path, item, index }),
  removeItem: (id, path, index) => ({ type: 'removeItem', id, path, index }),
  moveItem: (id, path, from, to) => ({ type: 'moveItem', id, path, from, to }),
  replaceDoc: (doc, selectedId) => ({ type: 'replaceDoc', doc, selectedId }),
  undo: () => ({ type: 'undo' }),
  redo: () => ({ type: 'redo' }),
};
