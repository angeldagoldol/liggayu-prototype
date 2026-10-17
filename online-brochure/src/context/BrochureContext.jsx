import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { BROCHURES } from '../data/brochures.js';
import { readStorage, writeStorage } from '../lib/storage.js';
import { createId, uniqueSlug } from '../lib/id.js';
import { estimateReadMinutes } from '../lib/format.js';

const BrochureContext = createContext(null);
const RECENT_LIMIT = 8;

/** Drop anything from storage that does not look like a brochure. */
function sanitizeUserBrochures(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (b) => b && typeof b === 'object' && typeof b.id === 'string' && typeof b.slug === 'string' && Array.isArray(b.pages),
  );
}

/**
 * The brochure library: built-in brochures (src/data/brochures.js) plus the
 * ones a visitor makes in the Studio (persisted to localStorage), favourites
 * and recently-viewed history.
 */
export function BrochureProvider({ children }) {
  const [userBrochures, setUserBrochures] = useState(() => sanitizeUserBrochures(readStorage('brochures', [])));
  const [favoriteIds, setFavoriteIds] = useState(() => readStorage('favorites', []));
  const [recentIds, setRecentIds] = useState(() => readStorage('recent', []));

  const brochures = useMemo(() => [...userBrochures, ...BROCHURES], [userBrochures]);

  const persistUser = useCallback((updater) => {
    setUserBrochures((list) => {
      const next = updater(list);
      writeStorage('brochures', next);
      return next;
    });
  }, []);

  const getBySlug = useCallback((slug) => brochures.find((b) => b.slug === slug) ?? null, [brochures]);
  const getById = useCallback((id) => brochures.find((b) => b.id === id) ?? null, [brochures]);

  /** Create or update a user brochure. Returns the saved copy (with final id/slug). */
  const saveBrochure = useCallback(
    (draft) => {
      const existing = userBrochures.find((b) => b.id === draft.id);
      const taken = new Set(brochures.filter((b) => b.id !== draft.id).map((b) => b.slug));
      const saved = {
        ...draft,
        id: existing ? draft.id : draft.id && !getById(draft.id) ? draft.id : createId('b'),
        slug: uniqueSlug(draft.slug || draft.title, taken),
        source: 'user',
        updatedAt: new Date().toISOString(),
        readMinutes: estimateReadMinutes(draft),
      };
      persistUser((list) => (existing ? list.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...list]));
      return saved;
    },
    [brochures, userBrochures, getById, persistUser],
  );

  const deleteBrochure = useCallback(
    (id) => {
      persistUser((list) => list.filter((b) => b.id !== id));
      setFavoriteIds((ids) => {
        const next = ids.filter((x) => x !== id);
        writeStorage('favorites', next);
        return next;
      });
    },
    [persistUser],
  );

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((ids) => {
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
      writeStorage('favorites', next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id) => favoriteIds.includes(id), [favoriteIds]);

  const markViewed = useCallback((id) => {
    setRecentIds((ids) => {
      if (ids[0] === id) return ids;
      const next = [id, ...ids.filter((x) => x !== id)].slice(0, RECENT_LIMIT);
      writeStorage('recent', next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      brochures,
      builtins: BROCHURES,
      userBrochures,
      favoriteIds,
      recentIds,
      getBySlug,
      getById,
      saveBrochure,
      deleteBrochure,
      toggleFavorite,
      isFavorite,
      markViewed,
    }),
    [
      brochures,
      userBrochures,
      favoriteIds,
      recentIds,
      getBySlug,
      getById,
      saveBrochure,
      deleteBrochure,
      toggleFavorite,
      isFavorite,
      markViewed,
    ],
  );

  return <BrochureContext.Provider value={value}>{children}</BrochureContext.Provider>;
}

export function useBrochures() {
  const ctx = useContext(BrochureContext);
  if (!ctx) throw new Error('useBrochures must be used inside <BrochureProvider>');
  return ctx;
}
