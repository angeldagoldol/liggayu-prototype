import { useCallback, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { clampPage } from '../../components/viewer/spreads.js';
import { withHashParam } from './hashParams.js';

/**
 * The reader's page index, mirrored to `?p=` for deep links and sharing.
 *
 * Turning a page writes the URL "shallowly" (history.replaceState, keeping
 * the router's own history state) instead of navigating: a navigation
 * re-renders the whole app shell on every turn, which costs frames while
 * the page is in flight. Navigations the router does see (links,
 * back/forward, a new ?p= from elsewhere) still win: each new location
 * re-reads the page from the URL. Page 0 drops the parameter.
 * Returns [page, setPage].
 */
export function usePageParam(count) {
  const location = useLocation();
  const [params] = useSearchParams();
  const fromUrl = clampPage(params.get('p') ?? 0, count);
  // Entries the router did not create (typed URLs) all share the key "default", so the search counts too.
  const marker = `${location.key}|${location.search}`;
  const [state, setState] = useState({ marker, page: fromUrl });

  // A real navigation happened: adopt its page (React's "adjust state while rendering").
  if (state.marker !== marker) setState({ marker, page: fromUrl });
  const page = state.marker === marker ? state.page : fromUrl;

  const setPage = useCallback(
    (next) => {
      const value = clampPage(next, count);
      setState((prev) => (prev.page === value ? prev : { ...prev, page: value }));
      const url = withHashParam(window.location.hash, 'p', value === 0 ? null : String(value));
      if (url !== window.location.hash) window.history.replaceState(window.history.state, '', url);
    },
    [count],
  );

  return [page, setPage];
}
