import { NavLink } from 'react-router-dom';

// PLACEHOLDER — replaced by the shell build step.
export function Navbar() {
  return (
    <header style={{ height: 'var(--nav-h)', display: 'flex', alignItems: 'center' }}>
      <nav className="container" aria-label="Main" style={{ display: 'flex', gap: '1.5rem' }}>
        <NavLink to="/">Tabi 旅</NavLink>
        <NavLink to="/brochures">Brochures</NavLink>
        <NavLink to="/studio">Studio</NavLink>
      </nav>
    </header>
  );
}
