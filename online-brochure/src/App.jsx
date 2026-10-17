import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';

// Route-level code splitting: each page ships as its own chunk.
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const Library = lazy(() => import('./pages/Library/Library.jsx'));
const Viewer = lazy(() => import('./pages/Viewer/Viewer.jsx'));
const Studio = lazy(() => import('./pages/Studio/Studio.jsx'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound.jsx'));

/**
 * Hash routing (#/brochures/kyoto-thousand-gates) so the built site works on
 * any static host with zero server rewrites.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="brochures" element={<Library />} />
          <Route path="brochures/:slug" element={<Viewer />} />
          <Route path="studio" element={<Studio />} />
          <Route path="studio/:id" element={<Studio />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
