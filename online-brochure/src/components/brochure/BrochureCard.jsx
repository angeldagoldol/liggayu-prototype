import { Link } from 'react-router-dom';
import { CoverArt } from './CoverArt.jsx';

// PLACEHOLDER — replaced by the library build step. Keep this API:
// <BrochureCard brochure={b} index={i} variant="grid" | "list" | "feature" />
export function BrochureCard({ brochure }) {
  return (
    <Link to={`/brochures/${brochure.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
      <CoverArt style={brochure.cover.art} seed={brochure.cover.seed} theme={brochure.theme} />
      <h3>{brochure.title}</h3>
    </Link>
  );
}
