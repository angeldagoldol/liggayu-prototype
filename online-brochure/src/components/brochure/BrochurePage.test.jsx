import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BROCHURES } from '../../data/brochures.js';
import { PAGE_TYPE_IDS } from '../../data/schema.js';
import { BrochurePage } from './BrochurePage.jsx';
import { CoverArt } from './CoverArt.jsx';

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
const kyoto = BROCHURES.find((b) => b.slug === 'kyoto-thousand-gates');

describe('<BrochurePage>', () => {
  it.each(BROCHURES.map((b) => [b.slug, b]))('renders every page of %s, live and static', (_slug, brochure) => {
    brochure.pages.forEach((page, i) => {
      const total = brochure.pages.length;
      const { container, unmount } = render(<BrochurePage brochure={brochure} page={page} index={i} total={total} active={i === 0} onCta={() => {}} />);
      const article = container.querySelector('article');
      expect(article).toHaveAttribute('aria-label', expect.stringMatching(new RegExp(`^Page ${i + 1} of ${total}: .+`)));
      expect(article).toHaveAttribute('data-type', page.type);
      expect(container.querySelector('h2')).not.toBeNull();
      unmount();

      const still = render(<BrochurePage brochure={brochure} page={page} index={i} total={total} isStatic />);
      expect(still.container.querySelectorAll(FOCUSABLE)).toHaveLength(0);
      still.unmount();
    });
  });

  it.each(PAGE_TYPE_IDS)('survives a "%s" page with empty fields', (type) => {
    expect(() => render(<BrochurePage brochure={{}} page={{ id: 'x', type }} index={0} total={1} active />)).not.toThrow();
    expect(() => render(<BrochurePage brochure={{ theme: { paper: 'nope' } }} page={{ id: 'y', type, items: [null, {}], plans: 'x', details: [{}] }} isStatic />)).not.toThrow();
  });

  it('renders a quiet fallback for unknown page types and missing pages', () => {
    render(<BrochurePage brochure={kyoto} page={{ id: 'z', type: 'hologram', heading: 'Future page' }} index={2} total={3} />);
    expect(screen.getByRole('article', { name: 'Page 3 of 3: Future page' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Future page' })).toBeInTheDocument();
    expect(() => render(<BrochurePage brochure={null} page={undefined} />)).not.toThrow();
  });

  it('applies the brochure theme as CSS variables', () => {
    const { container } = render(<BrochurePage brochure={kyoto} page={kyoto.pages[1]} index={1} total={11} isStatic />);
    const article = container.querySelector('article');
    expect(article.style.getPropertyValue('--b-paper')).toBe(kyoto.theme.paper);
    expect(article.style.getPropertyValue('--b-font')).toBe('var(--font-display)');
  });

  it('calls onCta from the contact page button', async () => {
    const onCta = vi.fn();
    const contact = kyoto.pages.find((p) => p.type === 'contact');
    render(<BrochurePage brochure={kyoto} page={contact} index={9} total={11} active onCta={onCta} />);
    await userEvent.click(screen.getByRole('button', { name: /request an itinerary/i }));
    expect(onCta).toHaveBeenCalledTimes(1);
  });

  it('marks Japanese text with lang="ja" and lists phrases as a list', () => {
    const phrases = kyoto.pages.find((p) => p.type === 'phrases');
    const { container } = render(<BrochurePage brochure={kyoto} page={phrases} index={6} total={11} isStatic />);
    expect(screen.getAllByRole('listitem')).toHaveLength(phrases.items.length);
    expect(container.querySelector('li p[lang="ja"]')).toHaveTextContent(phrases.items[0].jp);
  });

  it('shows final figures on static stats pages, with the prefix as a small affix', () => {
    const stats = kyoto.pages.find((p) => p.type === 'stats');
    render(<BrochurePage brochure={kyoto} page={stats} index={5} total={11} isStatic />);
    expect(screen.getByText('1,074')).toBeInTheDocument();
    const figure = screen.getByText('1,600');
    expect(figure).toHaveTextContent('~1,600');
    expect(screen.getByText('~').parentElement).toBe(figure);
  });

  it('keeps the whole figure, prefix included, in the text of a live counter', () => {
    const stats = kyoto.pages.find((p) => p.type === 'stats');
    const { container } = render(<BrochurePage brochure={kyoto} page={stats} index={5} total={11} active />);
    expect(container.textContent).toContain('~1,600');
  });

  it('builds a valid definition list on the contact page and hangs the 〒 off the ticket', () => {
    const contact = kyoto.pages.find((p) => p.type === 'contact');
    const { container } = render(<BrochurePage brochure={kyoto} page={contact} index={9} total={11} isStatic />);
    const groups = container.querySelectorAll('dl > div');
    expect(groups).toHaveLength(contact.details.length);
    for (const group of groups) expect([...group.children].map((el) => el.tagName)).toEqual(['DT', 'DD']);
    const postmark = [...container.querySelectorAll('[aria-hidden="true"]')].find((el) => el.textContent === '〒');
    expect(postmark.parentElement.querySelector('dl')).not.toBeNull();
  });

  it('survives Object.prototype names as page types and icon names (regression)', () => {
    const features = { id: 'f', type: 'features', heading: 'Hi', items: [{ icon: 'constructor', title: 'A' }, { icon: '__proto__', title: 'B' }] };
    expect(() => render(<BrochurePage brochure={kyoto} page={features} index={2} total={3} active />)).not.toThrow();
    render(<BrochurePage brochure={kyoto} page={{ id: 'c', type: 'constructor', heading: 'Odd page' }} index={1} total={3} />);
    expect(screen.getByRole('heading', { name: 'Odd page' })).toBeInTheDocument();
  });
});

describe('<CoverArt>', () => {
  it('is decorative by default and an image when titled', () => {
    const { container, rerender } = render(<CoverArt style="seigaiha" seed={7} theme={kyoto.theme} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(<CoverArt style="seigaiha" seed={7} theme={kyoto.theme} title="Waves at dawn" />);
    expect(screen.getByRole('img', { name: 'Waves at dawn' })).toBeInTheDocument();
  });

  it('draws identical art for identical props and namespaces ids per instance', () => {
    const { container } = render(
      <>
        <CoverArt style="fuji" seed={3} theme={kyoto.theme} />
        <CoverArt style="fuji" seed={3} theme={kyoto.theme} />
      </>,
    );
    const [a, b] = container.querySelectorAll('svg');
    const strip = (svg) => svg.innerHTML.replace(/art[^"#)\s]*?-/g, 'ID-');
    expect(strip(a)).toBe(strip(b));
    const ids = [...container.querySelectorAll('[id]')].map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
