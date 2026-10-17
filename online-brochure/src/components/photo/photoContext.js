import { createContext, useContext } from 'react';
import { resolvePhoto } from '../../data/photos/index.js';

/**
 * The brochure whose photos a <Photo> resolves: "user:<key>" ids read its
 * `userPhotos` (the Studio's uploads). <BrochurePage> provides it for every
 * block; outside a page, pass `brochure` to <Photo> instead.
 */
export const PhotoContext = createContext(null);

/**
 * The photo record for `id` — a registry photo or, for "user:<key>", the
 * brochure's own upload — or null. Uses `brochure` when given, else the
 * surrounding <PhotoContext>. Blocks use it to decide what to draw around a
 * photo (a credit line, a caption) before the picture itself renders.
 */
export function usePhotoRecord(id, brochure) {
  const fromContext = useContext(PhotoContext);
  return resolvePhoto(id, brochure ?? fromContext);
}
