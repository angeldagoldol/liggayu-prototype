/**
 * Real, credited photographs of the places in the brochures.
 *
 *   import { getPhoto, creditsFor } from '../../data/photos/index.js';
 *   const photo = getPhoto('kyoto-senbon-torii');
 *   // → { id, alt, caption, place, focus, use, width, height, lqip, color,
 *   //     credit: { title, author, authorUrl, license, licenseUrl, sourceUrl },
 *   //     src(width), srcSet, available } — or null for an unknown id
 *
 * Sources: ./manifest/<brochure>.json (what each photo shows; docs/REAL_CONTENT.md)
 * and ./photos.generated.json (written by `npm run photos:fetch`). A photo listed
 * but not downloaded yet has `available: false`; <Photo> then shows its fallback.
 * Imported by the brochure renderer (a lazy chunk), never by the app entry.
 */
import generated from './photos.generated.json';
import { createPhotoRegistry } from './registry.js';

const manifests = import.meta.glob('./manifest/*.json', { eager: true, import: 'photos' });

const registry = createPhotoRegistry(manifests, generated);

export const { getPhoto, listPhotos, creditsFor } = registry;
export { PHOTO_WIDTHS, photoIdsIn, photoUrl, pickWidth } from './registry.js';
