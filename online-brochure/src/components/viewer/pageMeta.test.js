import { describe, expect, it } from 'vitest';
import { PAGE_TYPE_IDS } from '../../data/schema.js';
import { SECTION_JP } from '../brochure/blocks/pageUtils.js';
import { pageMeta, sealText } from './pageMeta.js';
import { BLANK } from './spreads.js';

describe('pageMeta', () => {
  it.each(PAGE_TYPE_IDS)('names a "%s" page in Japanese as the page itself does (regression)', (type) => {
    const meta = pageMeta({ id: 'p', type });
    expect(meta.jp).toBeTruthy();
    // The reader's overview, the Studio and the page's own margin label agree.
    expect(meta.jp).toBe(SECTION_JP[type]);
  });

  it('names the endpaper and unknown pages', () => {
    expect(pageMeta(undefined, BLANK)).toEqual({ label: 'Endpaper', jp: '見返し' });
    expect(pageMeta({ type: 'constructor' })).toEqual({ label: 'Page', jp: '頁' });
  });
});

describe('sealText', () => {
  it('takes up to two characters of the Japanese title, or 旅', () => {
    expect(sealText({ titleJp: '京都' })).toBe('京都');
    expect(sealText({ titleJp: '広島・宮島' })).toBe('広島');
    expect(sealText({ titleJp: '  ' })).toBe('旅');
    expect(sealText(null)).toBe('旅');
  });
});
