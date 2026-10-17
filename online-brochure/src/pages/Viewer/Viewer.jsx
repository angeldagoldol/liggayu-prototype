import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { InquiryDrawer, PrintPages } from '../../components/viewer/index.js';
import { Button } from '../../components/ui/index.js';
import { useBrochures } from '../../context/BrochureContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { AboutBrochure } from './AboutBrochure.jsx';
import { MoreLikeThis } from './MoreLikeThis.jsx';
import { Reader } from './Reader.jsx';
import { ViewerNotFound } from './ViewerNotFound.jsx';
import styles from './Viewer.module.css';

/**
 * One brochure: the reader, its story, related reading and the inquiry
 * drawer. Memoised: turning a page changes the URL, and only the reader
 * (which reads ?p= itself) needs to re-render for it.
 */
const BrochureViewer = memo(function BrochureViewer({ brochure }) {
  const [planOpen, setPlanOpen] = useState(false);
  const readerRef = useRef(null);
  const openPlan = useCallback(() => setPlanOpen(true), []);
  const closePlan = useCallback(() => setPlanOpen(false), []);

  return (
    <div className={styles.viewer}>
      <div ref={readerRef}>
        <Reader brochure={brochure} onPlan={openPlan} planOpen={planOpen} />
      </div>
      <div data-print="hide">
        <AboutBrochure brochure={brochure} onPlan={openPlan} />
        <MoreLikeThis brochure={brochure} />
        <div className={styles.end}>
          <span lang="ja" className={styles.endMark} aria-hidden="true">
            終
          </span>
          <Button
            variant="ghost"
            iconLeft={<ArrowUp />}
            onClick={() => readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Back to the book
          </Button>
        </div>
      </div>
      <InquiryDrawer open={planOpen} onClose={closePlan} brochure={brochure} />
      <PrintPages brochure={brochure} />
    </div>
  );
});

/**
 * Route #/brochures/:slug — reads a brochure in the flipbook (page in ?p=).
 * Marks it as recently viewed; unknown slugs get a friendly not-found page.
 */
export default function Viewer() {
  const { slug = '' } = useParams();
  const { getBySlug, markViewed } = useBrochures();
  const brochure = getBySlug(slug);
  const id = brochure?.id;
  useDocumentTitle(brochure ? brochure.title || 'Untitled brochure' : 'Brochure not found');

  useEffect(() => {
    if (id) markViewed(id);
  }, [id, markViewed]);

  if (!brochure) return <ViewerNotFound slug={slug} />;
  return <BrochureViewer key={brochure.id} brochure={brochure} />;
}
