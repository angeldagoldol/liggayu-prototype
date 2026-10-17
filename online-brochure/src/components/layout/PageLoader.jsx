/** Suspense fallback while a route chunk loads. */
export function PageLoader() {
  return (
    <div role="status" aria-live="polite" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <span className="eyebrow">Loading…</span>
    </div>
  );
}
