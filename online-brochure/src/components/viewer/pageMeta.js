import { PAGE_TYPES } from '../../data/schema.js';
import { BLANK } from './spreads.js';

/** Japanese section names for the reader's captions (見出し). */
const SECTION_JP = {
  cover: '表紙',
  intro: '序',
  features: '見どころ',
  gallery: '写真',
  stats: '数字',
  agenda: '旅程',
  pricing: '料金',
  phrases: '会話',
  quote: '声',
  contact: '連絡',
  back: '裏表紙',
};

/** { label, jp } for a page (or the blank endpaper). */
export function pageMeta(page, face) {
  if (face === BLANK) return { label: 'Endpaper', jp: '見返し' };
  const type = page?.type;
  return { label: PAGE_TYPES[type]?.label ?? 'Page', jp: SECTION_JP[type] ?? '頁' };
}

/** "Introduction · Features" for the pages of a spread. */
export function spreadCaption(spread, pages) {
  return (spread?.pages ?? []).map((i) => pageMeta(pages?.[i]).label).join(' · ');
}

/** Seal characters for a brochure: up to two characters of its Japanese title. */
export function sealText(brochure) {
  const jp = String(brochure?.titleJp ?? '').replace(/[・\s]/g, '');
  return Array.from(jp || '旅').slice(0, 2).join('');
}

/** Book colours come from the brochure, so stacks, ears and endpapers match its paper. */
export function paperVars(theme) {
  return {
    '--b-paper': theme?.paper || 'var(--page-paper)',
    '--b-ink': theme?.ink || 'var(--wa-sumi)',
    '--b-accent': theme?.accent || 'var(--wa-shu)',
  };
}
