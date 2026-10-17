import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { BrochureProvider } from '../../context/BrochureContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';
import Library from './Library.jsx';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
}

function renderLibrary(url = '/brochures') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ToastProvider>
        <BrochureProvider>
          <Routes>
            <Route path="/brochures" element={<Library />} />
          </Routes>
          <LocationProbe />
        </BrochureProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

const cards = () => screen.getAllByRole('article');

describe('<Library>', () => {
  it('lists every built-in brochure as one named link per card', () => {
    renderLibrary();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Every brochure, unfolded.');
    expect(cards()).toHaveLength(10);
    expect(screen.getByRole('link', { name: 'Kyoto: A Thousand Gates' })).toHaveAttribute('href', '/brochures/kyoto-thousand-gates');
  });

  it('keeps the favourite button outside the card link', () => {
    renderLibrary();
    for (const card of cards()) {
      const button = within(card).getByRole('button', { name: /to favourites/ });
      expect(button.closest('a')).toBeNull();
    }
  });

  it('applies filters from the URL and announces the count', () => {
    renderLibrary('/brochures?category=food');
    expect(cards()).toHaveLength(1);
    const live = document.querySelector('[aria-live="polite"][aria-atomic="true"]');
    expect(live).toHaveTextContent('1 brochure of 10');
    expect(screen.getByRole('button', { name: /Remove category filter: Food & Drink/ })).toBeInTheDocument();
  });

  it('shows the empty state with a way out', async () => {
    const user = userEvent.setup();
    renderLibrary('/brochures?q=zzzz');
    expect(screen.getByRole('heading', { name: 'No brochures match' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByTestId('location')).toHaveTextContent(/^$/);
    expect(cards()).toHaveLength(10);
  });

  it('toggles seasons and the favourites-only filter through the URL', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await user.click(screen.getByRole('button', { name: /^Winter,/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('?season=winter');
    await user.click(within(cards()[0]).getByRole('button', { name: /to favourites/ }));
    await user.click(screen.getByRole('button', { name: /^Saved only/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('?season=winter&fav=1');
    // Cards that no longer match animate out before they unmount.
    await waitFor(() => expect(cards()).toHaveLength(1));
  });
});
