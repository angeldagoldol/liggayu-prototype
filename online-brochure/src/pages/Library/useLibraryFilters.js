import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseFilters, toSearchParams } from './libraryParams.js';

/**
 * Library filters, stored in the URL so they are shareable and the back
 * button steps through them.
 *   const [filters, update] = useLibraryFilters();
 *   update({ category: 'food' });                 // pushes a history entry
 *   update({ q: 'kyo' }, { replace: true });      // replaces it (typing)
 */
export function useLibraryFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = useCallback(
    (patch, { replace = false } = {}) => {
      setParams((current) => toSearchParams({ ...parseFilters(current), ...patch }), { replace, preventScrollReset: true });
    },
    [setParams],
  );

  return [filters, update];
}
