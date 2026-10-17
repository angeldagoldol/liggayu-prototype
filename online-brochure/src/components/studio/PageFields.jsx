import { memo } from 'react';
import { Palette } from 'lucide-react';
import { ART_LABELS, ART_STYLES } from '../../data/schema.js';
import { Button, Field, Select, Switch } from '../ui/index.js';
import { CoverArt } from '../brochure/index.js';
import { Note } from './Note.jsx';
import { DiceButton } from './fields/DiceButton.jsx';
import { IconPicker } from './fields/IconPicker.jsx';
import { ListEditor } from './fields/ListEditor.jsx';
import { NumberField } from './fields/NumberField.jsx';
import { StringList } from './fields/StringList.jsx';
import { TextField } from './fields/TextField.jsx';
import { listLimit } from './pageLimits.js';
import styles from './PageFields.module.css';

/* `api` (from PageEditor) binds every control to the selected page:
   get(path) · set(path, value, typing) · add(path, index) · remove(path, index) · move(path, from, to) */

function Text({ api, path, ...props }) {
  return <TextField value={api.get(path)} onChange={(value) => api.set(path, value, true)} {...props} />;
}

function List({ api, path, pageType, renderItem, ...props }) {
  return (
    <ListEditor
      items={api.get(path)}
      limit={listLimit(pageType, path)}
      onAdd={() => api.add(path)}
      onRemove={(index) => api.remove(path, index)}
      onMove={(from, to) => api.move(path, from, to)}
      renderItem={(item, index) => renderItem(item, index, [...path, index])}
      {...props}
    />
  );
}

function Labelled({ label, children }) {
  return (
    <div className={styles.labelled}>
      <span className={styles.miniLabel} aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}

const ArtThumb = memo(function ArtThumb({ art, seed, theme }) {
  return (
    <span className={styles.thumb} aria-hidden="true">
      <CoverArt style={art} seed={seed} theme={theme} />
    </span>
  );
});

function CoverFields({ api, brochure, onEditDesign, onCover }) {
  const art = ART_LABELS[brochure.cover?.art] ?? ART_LABELS.hinomaru;
  return (
    <>
      <Text api={api} path={['eyebrow']} label="Eyebrow" max={48} hint="A small line above the title" />
      <Text api={api} path={['title']} label="Cover title" max={60} />
      <Text api={api} path={['titleJp']} label="Japanese title" lang="ja" max={8} hint="Set vertically — e.g. 京都" placeholder={brochure.titleJp || '旅'} />
      <Text api={api} path={['subtitle']} label="Subtitle" multiline rows={3} max={140} />
      <div className={styles.artCard}>
        <ArtThumb art={brochure.cover?.art} seed={brochure.cover?.seed} theme={brochure.theme} />
        <div className={styles.artMeta}>
          <span className={styles.miniLabel}>Cover artwork</span>
          <span className={styles.artName}>
            {art.label} <span lang="ja">{art.jp}</span>
          </span>
          <div className={styles.artActions}>
            <Button variant="secondary" size="sm" iconLeft={<Palette />} onClick={onEditDesign}>
              Change artwork
            </Button>
            <DiceButton label="Shuffle artwork" onRoll={(seed) => onCover({ seed })} />
          </div>
        </div>
      </div>
    </>
  );
}

function IntroFields({ api }) {
  return (
    <>
      <Text api={api} path={['kicker']} label="Kicker" max={32} />
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <Text api={api} path={['body']} label="Story" multiline rows={7} max={900} hint="A blank line starts a new paragraph" />
      <Text api={api} path={['pullQuote']} label="Pull quote" multiline rows={2} max={120} />
    </>
  );
}

function FeaturesFields({ api, page }) {
  return (
    <>
      <Text api={api} path={['kicker']} label="Kicker" max={32} />
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <List
        api={api}
        path={['items']}
        pageType={page.type}
        title="Highlights"
        noun="highlight"
        itemTitle={(item) => item?.title}
        renderItem={(item, index, path) => (
          <>
            <div className={styles.row}>
              <Labelled label="Icon">
                <IconPicker value={item?.icon} onChange={(icon) => api.set([...path, 'icon'], icon, false)} label={`Icon for highlight ${index + 1}`} />
              </Labelled>
              <Text api={api} path={[...path, 'title']} label="Title" max={40} />
            </div>
            <Text api={api} path={[...path, 'text']} label="Text" multiline rows={2} max={160} />
          </>
        )}
      />
    </>
  );
}

function GalleryFields({ api, page, brochure }) {
  return (
    <>
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <List
        api={api}
        path={['items']}
        pageType={page.type}
        title="Artworks"
        noun="artwork"
        itemTitle={(item) => item?.caption}
        renderItem={(item, index, path) => (
          <>
            <div className={styles.artRow}>
              <ArtThumb art={item?.art} seed={item?.seed} theme={brochure.theme} />
              <Field label="Motif">
                <Select value={ART_STYLES.includes(item?.art) ? item.art : 'hinomaru'} onChange={(e) => api.set([...path, 'art'], e.target.value, false)}>
                  {ART_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {`${ART_LABELS[style].label} · ${ART_LABELS[style].jp}`}
                    </option>
                  ))}
                </Select>
              </Field>
              <Labelled label="Shuffle">
                <DiceButton label={`Shuffle artwork ${index + 1}`} onRoll={(seed) => api.set([...path, 'seed'], seed, false)} />
              </Labelled>
            </div>
            <Text api={api} path={[...path, 'caption']} label="Caption" max={80} />
          </>
        )}
      />
    </>
  );
}

function StatsFields({ api, page }) {
  return (
    <>
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <Text api={api} path={['body']} label="Intro line" multiline rows={2} max={160} />
      <List
        api={api}
        path={['items']}
        pageType={page.type}
        title="Figures"
        noun="figure"
        itemTitle={(item) => `${item?.prefix ?? ''}${item?.value ?? ''}${item?.suffix ?? ''} ${item?.label ?? ''}`}
        renderItem={(item, index, path) => (
          <>
            <div className={styles.statRow}>
              <Text api={api} path={[...path, 'prefix']} label="Before" max={4} placeholder="~" />
              <NumberField label="Number" value={item?.value ?? ''} onChange={(value) => api.set([...path, 'value'], value, true)} />
              <Text api={api} path={[...path, 'suffix']} label="After" max={6} placeholder="%" />
            </div>
            <Text api={api} path={[...path, 'label']} label="Label" max={48} />
          </>
        )}
      />
    </>
  );
}

function AgendaFields({ api, page }) {
  return (
    <>
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <List
        api={api}
        path={['items']}
        pageType={page.type}
        title="Stops"
        noun="stop"
        itemTitle={(item) => [item?.time, item?.title].filter(Boolean).join(' · ')}
        renderItem={(item, index, path) => (
          <>
            <div className={styles.timeRow}>
              <Text api={api} path={[...path, 'time']} label="When" max={12} placeholder="09:00" />
              <Text api={api} path={[...path, 'title']} label="What" max={48} />
            </div>
            <Text api={api} path={[...path, 'text']} label="Details" multiline rows={2} max={120} />
          </>
        )}
      />
    </>
  );
}

function PricingFields({ api, page }) {
  return (
    <>
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <Text api={api} path={['note']} label="Small print" multiline rows={2} max={200} />
      <List
        api={api}
        path={['plans']}
        pageType={page.type}
        title="Plans"
        noun="plan"
        itemTitle={(item) => [item?.name, item?.price].filter(Boolean).join(' · ')}
        renderItem={(item, index, path) => {
          const featuresPath = [...path, 'features'];
          return (
            <>
              <Text api={api} path={[...path, 'name']} label="Name" max={32} />
              <div className={styles.priceRow}>
                <Text api={api} path={[...path, 'price']} label="Price" max={16} placeholder="¥48,000" />
                <Text api={api} path={[...path, 'period']} label="Per" max={32} placeholder="per person" />
              </div>
              <StringList
                label="Included"
                items={item?.features}
                limit={listLimit(page.type, featuresPath)}
                onChange={(i, value) => api.set([...featuresPath, i], value, true)}
                onAdd={(i) => api.add(featuresPath, i)}
                onRemove={(i) => api.remove(featuresPath, i)}
                onMove={(from, to) => api.move(featuresPath, from, to)}
              />
              <Switch checked={Boolean(item?.highlight)} onChange={(on) => api.set([...path, 'highlight'], on, false)} label="Highlight this plan" />
            </>
          );
        }}
      />
    </>
  );
}

function PhrasesFields({ api, page }) {
  return (
    <>
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <List
        api={api}
        path={['items']}
        pageType={page.type}
        title="Phrases"
        noun="phrase"
        itemTitle={(item) => item?.romaji || item?.jp}
        renderItem={(item, index, path) => (
          <>
            <Text api={api} path={[...path, 'jp']} label="Japanese" lang="ja" max={40} placeholder="ありがとう" />
            <Text api={api} path={[...path, 'romaji']} label="Rōmaji" max={60} hint="Use macrons for long vowels: ā ī ū ē ō" />
            <Text api={api} path={[...path, 'meaning']} label="Meaning" max={80} />
          </>
        )}
      />
    </>
  );
}

function QuoteFields({ api }) {
  return (
    <>
      <Text api={api} path={['quote']} label="Quote" multiline rows={5} max={280} />
      <Text api={api} path={['author']} label="Who said it" max={48} />
      <Text api={api} path={['role']} label="Role or date" max={60} />
    </>
  );
}

function ContactFields({ api, page }) {
  return (
    <>
      <Text api={api} path={['heading']} label="Heading" max={70} />
      <Text api={api} path={['body']} label="Message" multiline rows={3} max={240} />
      <Text api={api} path={['cta']} label="Button label" max={32} />
      <List
        api={api}
        path={['details']}
        pageType={page.type}
        title="Details"
        noun="detail"
        itemTitle={(item) => [item?.label, item?.value].filter(Boolean).join(' · ')}
        renderItem={(item, index, path) => (
          <>
            <div className={styles.row}>
              <Labelled label="Icon">
                <IconPicker value={item?.icon} onChange={(icon) => api.set([...path, 'icon'], icon, false)} label={`Icon for detail ${index + 1}`} />
              </Labelled>
              <Text api={api} path={[...path, 'label']} label="Label" max={24} />
            </div>
            <Text api={api} path={[...path, 'value']} label="Value" max={60} hint="Use a fictional .example address" />
          </>
        )}
      />
    </>
  );
}

function BackFields({ api }) {
  return (
    <>
      <Text api={api} path={['title']} label="Closing line" max={70} />
      <Text api={api} path={['body']} label="About you" multiline rows={3} max={240} />
      <Text api={api} path={['tagline']} label="Tagline or web address" max={60} />
    </>
  );
}

const EDITORS = {
  cover: CoverFields,
  intro: IntroFields,
  features: FeaturesFields,
  gallery: GalleryFields,
  stats: StatsFields,
  agenda: AgendaFields,
  pricing: PricingFields,
  phrases: PhrasesFields,
  quote: QuoteFields,
  contact: ContactFields,
  back: BackFields,
};

/**
 * The form for one page, generated from its type.
 *   <PageFields page={page} api={api} brochure={doc} onEditDesign={…} onCover={…} />
 * Unknown types (e.g. from an old import) get a gentle explanation instead.
 */
export function PageFields({ page, api, brochure, onEditDesign, onCover }) {
  const Editor = EDITORS[page.type];
  if (!Editor) {
    return <Note>This page type can’t be edited here. You can still move or delete it.</Note>;
  }
  return (
    <div className={styles.fields}>
      <Editor page={page} api={api} brochure={brochure} onEditDesign={onEditDesign} onCover={onCover} />
    </div>
  );
}
