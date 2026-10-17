/**
 * Normalising brochures that come back from storage (localStorage written by
 * an older version, another tab, or a hand-edited value). Renderers and the
 * Studio may then rely on the shapes in schema.js: pages are objects with a
 * string id and a known type, text fields are strings, enums are known ids.
 *
 * A record that is already valid comes back with the same values in the same
 * key order (so content signatures and "unsaved changes" checks still match).
 * Missing optional fields stay missing; renderers already handle those.
 */
import { CATEGORY_MAP } from './categories.js';
import { hasKey } from './lookup.js';
import { REGION_MAP } from './regions.js';
import { ART_STYLES, FORMATS, PAGE_TYPES } from './schema.js';
import { SEASON_MAP } from './seasons.js';

const TEXT_FIELDS = ['title', 'titleJp', 'subtitle', 'summary', 'organization', 'updatedAt'];
const DEFAULT_CATEGORY = 'heritage';
const DEFAULT_REGION = 'kansai';
const DEFAULT_FORMAT = 'booklet';
const DEFAULT_COVER = { art: 'hinomaru', seed: 1 };

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Pages a renderer and the Studio can work with: objects with a non-empty
 * string id (first one wins when ids repeat) and a type from PAGE_TYPES.
 */
export function sanitizePages(pages) {
  if (!Array.isArray(pages)) return [];
  const seen = new Set();
  return pages.filter((page) => {
    if (!isRecord(page) || typeof page.id !== 'string' || !page.id || !hasKey(PAGE_TYPES, page.type)) return false;
    if (seen.has(page.id)) return false;
    seen.add(page.id);
    return true;
  });
}

function sanitizeCover(cover) {
  if (!isRecord(cover)) return { ...DEFAULT_COVER };
  const art = ART_STYLES.includes(cover.art) ? cover.art : DEFAULT_COVER.art;
  const seed = Number.isFinite(cover.seed) ? cover.seed : DEFAULT_COVER.seed;
  return art === cover.art && seed === cover.seed ? cover : { ...cover, art, seed };
}

/**
 * A brochure with safe field types, or null when it is not an object or has
 * no readable pages. Fields that are present with the wrong type are reset:
 * text to '', unknown category/region/format to a default, seasons and tags
 * to their valid string entries, a non-object theme to {}.
 */
export function normalizeBrochure(value) {
  if (!isRecord(value)) return null;
  const pages = sanitizePages(value.pages);
  if (pages.length === 0) return null;

  const out = { ...value, pages };
  for (const key of TEXT_FIELDS) {
    if (key in out && typeof out[key] !== 'string') out[key] = '';
  }
  if ('category' in out && !hasKey(CATEGORY_MAP, out.category)) out.category = DEFAULT_CATEGORY;
  if ('region' in out && !hasKey(REGION_MAP, out.region)) out.region = DEFAULT_REGION;
  if ('format' in out && !FORMATS.some((f) => f.id === out.format)) out.format = DEFAULT_FORMAT;
  if ('seasons' in out) {
    const seasons = Array.isArray(out.seasons) ? out.seasons.filter((id) => hasKey(SEASON_MAP, id)) : [];
    out.seasons = [...new Set(seasons)];
  }
  if ('tags' in out) out.tags = Array.isArray(out.tags) ? out.tags.filter((tag) => typeof tag === 'string') : [];
  if ('theme' in out && !isRecord(out.theme)) out.theme = {};
  if ('cover' in out) out.cover = sanitizeCover(out.cover);
  if ('readMinutes' in out && !(Number.isFinite(out.readMinutes) && out.readMinutes > 0)) out.readMinutes = 1;
  if ('featured' in out && typeof out.featured !== 'boolean') out.featured = false;
  return out;
}

/** A stored user brochure: needs a string id and slug on top of normalizeBrochure. */
export function sanitizeStoredBrochure(value) {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id || typeof value.slug !== 'string' || !value.slug) return null;
  return normalizeBrochure(value);
}
