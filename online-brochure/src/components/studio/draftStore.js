/**
 * Where the Studio keeps work in progress (localStorage via lib/storage):
 *  - 'studio-draft'       the new, unpublished brochure being made
 *  - 'studio-edit:<id>'   unsaved changes to a brochure already in the library
 * A draft record is { doc, selectedId, savedAt }.
 */
import { normalizeBrochure } from '../../data/sanitize.js';
import { readStorage, removeStorage, writeStorage } from '../../lib/storage.js';

export const DRAFT_KEY = 'studio-draft';

export function editDraftKey(id) {
  return `studio-edit:${id}`;
}

/**
 * A stored draft, or null when missing or malformed. The doc is normalised
 * like a stored brochure (data/sanitize.js): unreadable pages are skipped and
 * fields of the wrong type reset, so the editor never meets a null page.
 */
export function readDraft(key) {
  const value = readStorage(key, null);
  if (!value || typeof value !== 'object') return null;
  const { selectedId, savedAt } = value;
  if (!value.doc || typeof value.doc !== 'object' || typeof value.doc.id !== 'string' || !Array.isArray(value.doc.pages)) return null;
  const doc = normalizeBrochure(value.doc);
  if (!doc) return null;
  return { doc, selectedId: typeof selectedId === 'string' ? selectedId : null, savedAt: Number(savedAt) || 0 };
}

/** Persist a draft; returns false when storage is unavailable or full. */
export function writeDraft(key, { doc, selectedId }, savedAt = Date.now()) {
  return writeStorage(key, { doc, selectedId, savedAt });
}

export function clearDraft(key) {
  removeStorage(key);
}

/** Content fingerprint that ignores bookkeeping fields, for "unsaved changes" checks. */
export function contentSignature(doc) {
  if (!doc) return '';
  const { updatedAt: _u, readMinutes: _r, slug: _s, source: _src, featured: _f, ...content } = doc;
  return JSON.stringify(content);
}
