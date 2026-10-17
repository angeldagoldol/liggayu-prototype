// PLACEHOLDER — replaced by the brochure-kit build step. Keep this API:
// <BrochurePage brochure={b} page={b.pages[i]} index={i} total={b.pages.length} />
export function BrochurePage({ brochure, page, index = 0, total = 1, className }) {
  const theme = brochure?.theme ?? {};
  return (
    <article
      className={className}
      style={{ aspectRatio: '1 / 1.414', background: theme.paper, color: theme.ink, padding: '8%', overflow: 'hidden' }}
      aria-label={`Page ${index + 1} of ${total}`}
    >
      <p className="eyebrow">{page.type}</p>
      <h3>{page.title || page.heading || page.quote}</h3>
    </article>
  );
}
