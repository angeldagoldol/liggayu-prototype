import { CATEGORIES } from '../../data/categories.js';
import { REGIONS } from '../../data/regions.js';
import { FORMATS } from '../../data/schema.js';
import { Field, Select } from '../ui/index.js';
import { SeasonPicker } from './fields/SeasonPicker.jsx';
import { TextField } from './fields/TextField.jsx';
import { TokenInput } from './fields/TokenInput.jsx';
import { PanelSection } from './PanelSection.jsx';
import { SegmentedControl } from './SegmentedControl.jsx';
import { studioActions as A } from './studioReducer.js';
import styles from './Panels.module.css';

const FORMAT_JP = { booklet: '冊子', bifold: '二つ折り', trifold: '三つ折り' };
const FORMAT_OPTIONS = FORMATS.map((f) => ({ value: f.id, label: f.label, sub: FORMAT_JP[f.id], lang: 'ja' }));

/**
 * Brochure-level details: titles, publisher, summary, where and when,
 * format and tags. Everything shows up on library cards and in search.
 *   <DetailsPanel brochure={doc} dispatch={dispatch} />
 */
export function DetailsPanel({ brochure, dispatch }) {
  const set = (field, typing = false) => (value) => dispatch(A.setField(field, value, typing));

  return (
    <div className={styles.panel}>
      <PanelSection title="Names" jp="題名">
        <TextField label="Title" required value={brochure.title} onChange={set('title', true)} max={80} placeholder="Untitled brochure" />
        <TextField
          label="Japanese title"
          lang="ja"
          value={brochure.titleJp}
          onChange={set('titleJp', true)}
          max={8}
          hint="Set in vertical type on cards — e.g. 京都, 温泉"
        />
        <TextField label="Subtitle" multiline rows={2} value={brochure.subtitle} onChange={set('subtitle', true)} max={140} />
        <TextField
          label="Publisher"
          value={brochure.organization}
          onChange={set('organization', true)}
          max={60}
          hint="A studio, inn or tour company — keep it fictional"
        />
        <TextField
          label="Summary"
          multiline
          rows={4}
          value={brochure.summary}
          onChange={set('summary', true)}
          max={240}
          hint="Shown on cards and in search"
        />
      </PanelSection>

      <PanelSection title="Where & when" jp="場所と季節">
        <Field label="Category">
          <Select value={brochure.category ?? ''} onChange={(e) => set('category')(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{`${c.label} · ${c.jp}`}</option>
            ))}
          </Select>
        </Field>
        <Field label="Region">
          <Select value={brochure.region ?? ''} onChange={(e) => set('region')(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{`${r.label} · ${r.jp}`}</option>
            ))}
          </Select>
        </Field>
        <SeasonPicker value={brochure.seasons} onChange={set('seasons')} />
      </PanelSection>

      <PanelSection title="Format & tags" jp="判型">
        <SegmentedControl label="Format" hideLabel={false} value={brochure.format ?? 'booklet'} onChange={set('format')} options={FORMAT_OPTIONS} size="lg" />
        <TokenInput label="Tags" value={brochure.tags} onChange={set('tags')} max={12} />
      </PanelSection>
    </div>
  );
}
