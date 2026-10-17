import { AgendaBlock } from './AgendaBlock.jsx';
import { BackBlock } from './BackBlock.jsx';
import { ContactBlock } from './ContactBlock.jsx';
import { CoverBlock } from './CoverBlock.jsx';
import { FallbackBlock } from './FallbackBlock.jsx';
import { FeaturesBlock } from './FeaturesBlock.jsx';
import { GalleryBlock } from './GalleryBlock.jsx';
import { IntroBlock } from './IntroBlock.jsx';
import { PhrasesBlock } from './PhrasesBlock.jsx';
import { PricingBlock } from './PricingBlock.jsx';
import { QuoteBlock } from './QuoteBlock.jsx';
import { StatsBlock } from './StatsBlock.jsx';

/** Page type → block component (types from data/schema.js PAGE_TYPES). */
export const BLOCKS = {
  cover: CoverBlock,
  intro: IntroBlock,
  features: FeaturesBlock,
  gallery: GalleryBlock,
  stats: StatsBlock,
  agenda: AgendaBlock,
  pricing: PricingBlock,
  phrases: PhrasesBlock,
  quote: QuoteBlock,
  contact: ContactBlock,
  back: BackBlock,
};

/** Full-bleed page types draw their own layout instead of the running head and folio. */
export const FULL_BLEED = new Set(['cover', 'back']);

export { FallbackBlock };
