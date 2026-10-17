#!/usr/bin/env node
/**
 * Downloads the brochure photos listed in src/data/photos/manifest/*.json from
 * Wikimedia Commons, checks their licence and size, and writes
 *   public/photos/<id>-<480|960|1600>.webp   (resized from Commons' 1920px thumbnail, never upscaled)
 *   src/data/photos/photos.generated.json    (size, LQIP, colour, credit, licence)
 *
 *   npm run photos:fetch                        # everything not fetched yet
 *   npm run photos:fetch -- --only kyoto-thousand-gates --only tokyo-shibuya-crossing
 *   npm run photos:fetch -- --force             # re-fetch even when cached
 *   npm run photos:fetch -- --dry-run           # check candidates, write nothing
 *   npm run photos:fetch -- --list-candidates   # print Commons links for curation (offline)
 *
 * Per photo: its "file" if set, else each of its "candidates" in order; the
 * first that is a free licence (CC0, public domain, CC BY, CC BY-SA) and at
 * least 1600 px on the long edge wins. Rejections are reported with reasons.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { candidateTitles, commonsPageUrl, DOWNLOAD_WIDTH, evaluateCandidate, matchesOnly, outputName, parseArgs, buildRecord } from './lib.mjs';
import { GENERATED_FILE, PUBLIC_DIR, ROOT, loadGenerated, loadManifests, networkHint, politeFetch, pool, queryImageInfo, saveGenerated } from './io.mjs';
import { processImage, removeOutputs } from './process.mjs';

let opts;
try {
  opts = parseArgs(process.argv.slice(2), { boolean: ['force', 'dry-run', 'list-candidates', 'prune', 'help'], string: ['only'] });
} catch (error) {
  console.error(`${error.message} (try --help)`);
  process.exit(1);
}
if (opts.help) {
  console.log(
    'Usage: npm run photos:fetch -- [--only <manifest|brochure|photo-id>]… [--force] [--dry-run] [--list-candidates] [--prune]\n' +
      '  --prune  also delete generated records and files of ids no manifest lists any more',
  );
  process.exit(0);
}
const only = opts.only ? [].concat(opts.only) : [];

const manifests = await loadManifests();
for (const m of manifests) for (const problem of m.problems) console.warn(`! ${problem}`);
const slots = manifests.flatMap((m) => m.photos.map((photo) => ({ manifest: m.name, brochure: m.brochure, photo })));
const selected = slots.filter((s) => matchesOnly(only, { manifest: s.manifest, brochure: s.brochure, id: s.photo.id }));

if (slots.length === 0) {
  console.log(`No photos listed yet: add manifests to ${path.relative(ROOT, path.dirname(GENERATED_FILE))}/manifest/ (see docs/REAL_CONTENT.md).`);
  process.exit(0);
}
if (selected.length === 0) {
  console.error(`Nothing matches --only ${only.join(', ')}`);
  process.exit(1);
}

if (opts.listCandidates) {
  for (const s of selected) {
    const titles = candidateTitles(s.photo);
    console.log(`\n${s.photo.id}  (${s.manifest}${s.photo.use ? ` · ${s.photo.use}` : ''})${s.photo.file ? '  chosen' : ''}`);
    if (s.photo.place) console.log(`  ${s.photo.place}`);
    titles.forEach((t, i) => console.log(`  ${i + 1}. ${commonsPageUrl(t)}`));
  }
  process.exit(0);
}

let generated;
try {
  generated = await loadGenerated();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const duplicateIds = slots.map((s) => s.photo.id).filter((id, i, all) => all.indexOf(id) !== i);
if (duplicateIds.length) console.warn(`! Duplicate photo ids across manifests: ${[...new Set(duplicateIds)].join(', ')}`);

/** Cached when the record exists, came from one of this photo's titles (its chosen file, if set) and its files are on disk. */
function isCached({ photo }) {
  const record = generated[photo.id];
  if (!record || opts.force) return false;
  const titles = candidateTitles(photo);
  if (!titles.includes(record.file) && !(record.file ?? '').startsWith('local:')) return false;
  return (record.widths ?? []).every((w) => existsSync(path.join(PUBLIC_DIR, outputName(photo.id, w))));
}

const todo = selected.filter((s) => !isCached(s));
const cached = selected.length - todo.length;
console.log(`${selected.length} photo slot(s) selected · ${cached} already fetched · ${todo.length} to check${opts.dryRun ? ' (dry run)' : ''}`);

const report = { ok: [], failed: [], cached };
// Saves run one at a time (downloads run two at a time), after each photo, so an interrupted run keeps its progress.
let saving = Promise.resolve();
const save = () => (saving = saving.then(() => saveGenerated(generated)));
if (todo.length) {
  let info;
  try {
    info = await queryImageInfo(
      todo.flatMap((s) => candidateTitles(s.photo)),
      { thumbWidth: DOWNLOAD_WIDTH },
    );
  } catch (error) {
    console.error(`\n${networkHint(error)}`);
    process.exit(2);
  }

  await pool(todo, 2, async (slot) => {
    const { photo } = slot;
    const tried = [];
    for (const title of candidateTitles(photo)) {
      const verdict = evaluateCandidate(info.get(title));
      if (!verdict.ok) {
        tried.push(`${title}: ${verdict.reason}`);
        continue;
      }
      if (opts.dryRun) {
        report.ok.push({ id: photo.id, title, note: `${verdict.credit.license} · ${verdict.credit.author}` });
        return;
      }
      try {
        const image = await download(info.get(title).info);
        const out = await processImage(image, photo.id, { outDir: PUBLIC_DIR });
        generated[photo.id] = buildRecord({ id: photo.id, file: title, ...out, credit: verdict.credit, fetchedAt: new Date().toISOString() });
        await save();
        const kb = out.files.reduce((n, f) => n + f.bytes, 0) / 1024;
        report.ok.push({ id: photo.id, title, note: `${out.widths.join('/')}w · ${kb.toFixed(0)} KB · ${verdict.credit.license} · ${verdict.credit.author}` });
        if (verdict.credit.restrictions) console.warn(`! ${photo.id}: Commons lists restrictions: ${verdict.credit.restrictions}`);
        return;
      } catch (error) {
        tried.push(`${title}: download/processing failed (${error.status ?? error.message})`);
      }
    }
    report.failed.push({ id: photo.id, manifest: slot.manifest, tried });
  });
}

if (opts.prune && !opts.dryRun && only.length === 0) {
  const listed = new Set(slots.map((s) => s.photo.id));
  for (const id of Object.keys(generated)) {
    if (listed.has(id)) continue;
    delete generated[id];
    await removeOutputs(PUBLIC_DIR, id);
    console.log(`- pruned ${id}`);
  }
  await saveGenerated(generated);
}

console.log('');
report.ok.sort((a, b) => a.id.localeCompare(b.id));
report.failed.sort((a, b) => a.id.localeCompare(b.id));
for (const r of report.ok) console.log(`✓ ${r.id}  ← ${r.title}\n    ${r.note}`);
for (const r of report.failed) {
  console.log(`✗ ${r.id}  (${r.manifest})`);
  for (const t of r.tried) console.log(`    ${t}`);
  if (r.tried.length === 0) console.log('    no candidates');
}
console.log(`\n${report.ok.length} ${opts.dryRun ? 'usable' : 'fetched'} · ${report.cached} cached · ${report.failed.length} failed`);
if (report.failed.length) {
  console.log('Failed photos keep showing the brochure art. Add better candidates (or set "file"), then run again;');
  console.log('`npm run photos:candidates -- <manifest>` builds contact sheets to choose from.');
}
process.exit(report.failed.length ? 1 : 0);

/** The 1920px thumbnail (a standard step; the original when that is smaller), else the original if it is not huge. */
async function download(info) {
  const urls = [info.thumburl, Number(info.size) < 40e6 ? info.url : null].filter(Boolean);
  let lastError;
  for (const url of [...new Set(urls)]) {
    try {
      const response = await politeFetch(url, { accept: 'image/*' });
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('no download URL');
}
