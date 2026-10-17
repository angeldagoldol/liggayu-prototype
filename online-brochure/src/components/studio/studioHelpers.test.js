import { describe, expect, it } from 'vitest';
import { gridIndex, isEditableTarget, nextIndex, tabPanelProps } from './a11y.js';
import { humanizeIcon, searchIcons } from './iconSearch.js';
import { DRAFT_KEY, clearDraft, contentSignature, editDraftKey, readDraft, writeDraft } from './draftStore.js';
import { LIST_LIMITS, listLimit, newListItem, randomSeed } from './pageLimits.js';
import { buildSpreads, charCount, normalizeTag, relativeSaved, spreadOf } from './studioFormat.js';

describe('pageLimits', () => {
  it('resolves limits from the last key of a path', () => {
    expect(listLimit('features', ['items'])).toEqual({ min: 2, max: 6 });
    expect(listLimit('pricing', ['plans', 1, 'features'])).toEqual(LIST_LIMITS.pricing.features);
    expect(listLimit('intro', ['items'])).toEqual({ min: 0, max: Infinity });
  });

  it('creates blank items for every list', () => {
    expect(newListItem('features', ['items'])).toHaveProperty('icon');
    expect(newListItem('gallery', ['items'], () => 0).seed).toBe(1);
    expect(newListItem('pricing', ['plans', 0, 'features'])).toBe('Another inclusion');
    expect(newListItem('phrases', ['items']).jp).toMatch(/よろしく/);
    expect(newListItem('quote', ['x'])).toEqual({});
  });

  it('draws seeds in range', () => {
    expect(randomSeed(() => 0)).toBe(1);
    expect(randomSeed(() => 0.99999)).toBeLessThan(10000);
  });
});

describe('draftStore', () => {
  const doc = { id: 'b_1', title: 'Draft', pages: [{ id: 'p', type: 'cover' }] };

  it('writes, reads and clears a draft', () => {
    expect(readDraft(DRAFT_KEY)).toBeNull();
    expect(writeDraft(DRAFT_KEY, { doc, selectedId: 'p' }, 123)).toBe(true);
    expect(readDraft(DRAFT_KEY)).toEqual({ doc, selectedId: 'p', savedAt: 123 });
    clearDraft(DRAFT_KEY);
    expect(readDraft(DRAFT_KEY)).toBeNull();
  });

  it('rejects malformed drafts', () => {
    window.localStorage.setItem('tabi:studio-draft', JSON.stringify({ doc: { id: 1 } }));
    expect(readDraft(DRAFT_KEY)).toBeNull();
    window.localStorage.setItem('tabi:studio-draft', '{broken');
    expect(readDraft(DRAFT_KEY)).toBeNull();
  });

  it('keys edit drafts per brochure', () => {
    expect(editDraftKey('b_9')).toBe('studio-edit:b_9');
  });

  it('ignores bookkeeping fields in content signatures', () => {
    const a = { ...doc, updatedAt: '2026-01-01', readMinutes: 3, slug: 'a', source: 'user' };
    const b = { ...doc, updatedAt: '2026-02-02', readMinutes: 5, slug: 'b', source: 'builtin' };
    expect(contentSignature(a)).toBe(contentSignature(b));
    expect(contentSignature({ ...a, title: 'Other' })).not.toBe(contentSignature(a));
    expect(contentSignature(null)).toBe('');
  });
});

describe('studioFormat', () => {
  const t0 = new Date('2026-10-01T12:00:00Z').getTime();

  it('describes save times', () => {
    expect(relativeSaved(0, t0)).toBe('');
    expect(relativeSaved(t0 - 10_000, t0)).toBe('just now');
    expect(relativeSaved(t0 - 60_000, t0)).toBe('1 min ago');
    expect(relativeSaved(t0 - 25 * 60_000, t0)).toBe('25 min ago');
    expect(relativeSaved(t0 - 3 * 3_600_000, t0)).toMatch(/^at \d{2}:\d{2}$/);
    expect(relativeSaved(t0 - 5 * 86_400_000, t0)).toBe('on Sep 26');
  });

  it('groups pages into booklet spreads', () => {
    expect(buildSpreads(0)).toEqual([]);
    expect(buildSpreads(1)).toEqual([[0]]);
    expect(buildSpreads(6)).toEqual([[0], [1, 2], [3, 4], [5]]);
    expect(buildSpreads(5)).toEqual([[0], [1, 2], [3, 4]]);
  });

  it('finds the spread holding a page', () => {
    expect([0, 1, 2, 3, 4, 5].map((i) => spreadOf(i, 6))).toEqual([0, 1, 1, 2, 2, 3]);
    expect(spreadOf(99, 5)).toBe(2);
    expect(spreadOf(3, 0)).toBe(0);
  });

  it('counts characters, including Japanese', () => {
    expect(charCount('京都の秋', 10)).toEqual({ count: 4, over: false, near: false });
    expect(charCount('x'.repeat(9), 10)).toMatchObject({ near: true, over: false });
    expect(charCount('x'.repeat(11), 10).over).toBe(true);
  });

  it('normalises tags', () => {
    expect(normalizeTag('  #Hot   Springs ')).toBe('hot springs');
    expect(normalizeTag('x'.repeat(40))).toHaveLength(32);
  });
});

describe('a11y helpers', () => {
  it('moves through a list with wrapping', () => {
    expect(nextIndex('ArrowRight', 2, 3)).toBe(0);
    expect(nextIndex('ArrowUp', 0, 3)).toBe(2);
    expect(nextIndex('Home', 2, 3)).toBe(0);
    expect(nextIndex('End', 0, 3)).toBe(2);
    expect(nextIndex('a', 0, 3)).toBe(-1);
    expect(nextIndex('ArrowRight', 0, 0)).toBe(-1);
  });

  it('moves through a grid without wrapping', () => {
    expect(gridIndex('ArrowDown', 1, 10, 4)).toBe(5);
    expect(gridIndex('ArrowDown', 8, 10, 4)).toBe(8);
    expect(gridIndex('ArrowLeft', 0, 10, 4)).toBe(0);
    expect(gridIndex('End', 0, 10, 4)).toBe(9);
    expect(gridIndex('x', 0, 10, 4)).toBe(-1);
  });

  it('recognises text-editing targets', () => {
    const make = (tag, type) => Object.assign(document.createElement(tag), type ? { type } : {});
    expect(isEditableTarget(make('input', 'text'))).toBe(true);
    expect(isEditableTarget(make('input', 'search'))).toBe(true);
    expect(isEditableTarget(make('textarea'))).toBe(true);
    expect(isEditableTarget(make('input', 'color'))).toBe(false);
    expect(isEditableTarget(make('button'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });

  it('links tab panels to their tabs', () => {
    expect(tabPanelProps('s', 'pages')).toEqual({ role: 'tabpanel', id: 's-panel-pages', 'aria-labelledby': 's-tab-pages', tabIndex: 0 });
  });
});

describe('icon search', () => {
  const names = ['Landmark', 'Bath', 'TrainFront', 'TramFront', 'Soup', 'Flower2', 'Star'];

  it('humanises icon names', () => {
    expect(humanizeIcon('TrainFront')).toBe('train front');
    expect(humanizeIcon('Flower2')).toBe('flower 2');
  });

  it('finds icons by name and by travel keyword', () => {
    expect(searchIcons(names, '')).toEqual(names);
    expect(searchIcons(names, 'temple')).toEqual(['Landmark']);
    expect(searchIcons(names, 'onsen')).toEqual(['Bath']);
    expect(searchIcons(names, 'RAMEN')).toEqual(['Soup']);
    expect(searchIcons(names, 'sakura')).toEqual(['Flower2']);
    expect(searchIcons(names, 'zzz')).toEqual([]);
  });

  it('ranks name matches before keyword matches', () => {
    expect(searchIcons(names, 'tra')).toEqual(['TrainFront', 'TramFront']);
    expect(searchIcons(names, 'train front')[0]).toBe('TrainFront');
  });
});
