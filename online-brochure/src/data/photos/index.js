/**
 * Real, credited photographs of the places in the brochures.
 *
 *   import { getPhoto, creditsFor } from '../../data/photos/index.js';
 *   const photo = getPhoto('kyoto-senbon-torii');
 *   // → { id, alt, caption, place, focus, use, width, height, lqip, color,
 *   //     credit: { title, author, authorUrl, license, licenseUrl, sourceUrl },
 *   //     src(width), srcSet, available, live? } — or null for an unknown id
 *   resolvePhoto('user:abc', brochure)  // the brochure's own upload (brochure.userPhotos.abc), same shape
 *
 * Sources, in order of preference for each slot:
 *   1. ./photos.generated.json — bundled with the site by `npm run photos:fetch`;
 *   2. live from Wikimedia Commons — looked up by the visitor's browser
 *      (live.js) from the slot's manifest candidates or search query;
 *   3. nothing yet: `available: false`, and <Photo> shows its fallback art.
 * Lookups are synchronous; a live photo appears once it has been resolved, so
 * components that draw from these functions subscribe through
 * useLivePhotos() (components/photo/useLivePhotos.js), which also asks for the ids.
 * ./manifest/<brochure>.json says what each photo shows (docs/REAL_CONTENT.md).
 * Imported by the brochure renderer (a lazy chunk), never by the app entry.
 */
import generated from './photos.generated.json';
import { createLivePhotos, liveSlots } from './live.js';
import { livePhotosEnabled, subscribeLivePhotosSetting } from './liveSetting.js';
import { createPhotoRegistry } from './registry.js';

const manifests = import.meta.glob('./manifest/*.json', { eager: true, import: 'photos' });

const bundled = (id) => Array.isArray(generated?.[id]?.widths) && generated[id].widths.length > 0;

/**
 * The browser's Commons resolver (live.js). Vitest never reaches Wikimedia:
 * suites that exercise live photos build their own with a fake fetch.
 */
export const livePhotos = createLivePhotos({
  slots: liveSlots(manifests, { skip: bundled }),
  enabled: livePhotosEnabled,
  subscribeEnabled: subscribeLivePhotosSetting,
  ...(import.meta.env?.MODE === 'test' ? { fetch: null, storage: null } : {}),
});

const registry = createPhotoRegistry(manifests, generated, { live: livePhotos });

export const { getPhoto, listPhotos, creditsFor, resolvePhoto } = registry;
export { PHOTO_WIDTHS, USER_PHOTO_PREFIX, isUserPhotoId, photoIdsIn, photoUrl, pickWidth, safeImageSrc } from './registry.js';
