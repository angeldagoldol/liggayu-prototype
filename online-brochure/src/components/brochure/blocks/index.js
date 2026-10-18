import { AgendaBlock } from './AgendaBlock.jsx';
import { BackBlock } from './BackBlock.jsx';
import { ContactBlock } from './ContactBlock.jsx';
import { CoverBlock } from './CoverBlock.jsx';
import { FallbackBlock } from './FallbackBlock.jsx';
import { FeaturesBlock } from './FeaturesBlock.jsx';
import { GalleryBlock } from './GalleryBlock.jsx';
import { IntroBlock } from './IntroBlock.jsx';
import { MapBlock } from './MapBlock.jsx';
import { PlaceBlock } from './PlaceBlock.jsx';
import { PhotoBlock } from './PhotoBlock.jsx';
import { PhrasesBlock } from './PhrasesBlock.jsx';
import { PricingBlock } from './PricingBlock.jsx';
import { QuoteBlock } from './QuoteBlock.jsx';
import { StatsBlock } from './StatsBlock.jsx';
import { dict } from '../../../data/lookup.js';

/** Page type → block component (types from data/schema.js PAGE_TYPES). No prototype, so
 *  a stored type like "constructor" falls back instead of finding Object. */
export const BLOCKS = dict({
  cover: CoverBlock,
  intro: IntroBlock,
  features: FeaturesBlock,
  gallery: GalleryBlock,
  place: PlaceBlock,
  map: MapBlock,
  stats: StatsBlock,
  agenda: AgendaBlock,
  pricing: PricingBlock,
  phrases: PhrasesBlock,
  quote: QuoteBlock,
  contact: ContactBlock,
  photo: PhotoBlock,
  back: BackBlock,
});

/** Full-bleed page types draw their own layout instead of the running head and folio. */
export const FULL_BLEED = new Set(['cover', 'photo', 'back']);

export { FallbackBlock };
