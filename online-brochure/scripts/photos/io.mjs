/**
 * File and network plumbing for the photo scripts: project paths, manifests,
 * the generated registry, and a polite Commons client (descriptive
 * User-Agent, maxlag, Retry-After, small concurrency).
 */
import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiError, chunk, DOWNLOAD_WIDTH, imageInfoUrl, mergeQueryResponses, parseImageInfoResponse, readManifest, retryDelay, sortRecords } from './lib.mjs';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
/** PHOTOS_MANIFEST_DIR points the scripts at another manifest folder (for trying things out). */
export const MANIFEST_DIR = process.env.PHOTOS_MANIFEST_DIR ? path.resolve(process.env.PHOTOS_MANIFEST_DIR) : path.join(ROOT, 'src/data/photos/manifest');
export const GENERATED_FILE = path.join(ROOT, 'src/data/photos/photos.generated.json');
export const PUBLIC_DIR = path.join(ROOT, 'public/photos');
export const CANDIDATE_DIR = path.join(ROOT, '.cache/photo-candidates');

/**
 * Wikimedia asks API clients for a descriptive User-Agent with a way to reach
 * the operator: set PHOTOS_CONTACT (a URL or e-mail address) when you run the scripts.
 */
export function userAgent() {
  const contact = process.env.PHOTOS_CONTACT?.trim();
  return `TabiBrochures-PhotoFetch/1.0 (static travel-brochure site; downloads freely licensed photos once at build time${contact ? `; ${contact}` : ''}) node/${process.versions.node}`;
}

/** Every manifest: [{ name, file, brochure, photos, problems }], sorted by name. */
export async function loadManifests() {
  let names = [];
  try {
    names = (await readdir(MANIFEST_DIR)).filter((n) => n.endsWith('.json')).sort();
  } catch {
    return [];
  }
  const out = [];
  for (const file of names) {
    const name = file.replace(/\.json$/, '');
    let json = null;
    let problems = [];
    try {
      json = JSON.parse(await readFile(path.join(MANIFEST_DIR, file), 'utf8'));
    } catch (error) {
      problems = [`${file}: ${error.message}`];
    }
    const parsed = json ? readManifest(json, file) : { brochure: null, photos: [], problems: [] };
    out.push({ name, file, brochure: parsed.brochure, photos: parsed.photos, problems: [...problems, ...parsed.problems] });
  }
  return out;
}

/**
 * The generated registry ({} when the file does not exist yet). A file that
 * exists but cannot be read is an error, not an empty registry: carrying on
 * would overwrite every record (local imports included) on the next save.
 */
export async function loadGenerated(file = GENERATED_FILE) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`${path.relative(ROOT, file)} is not valid JSON (${error.message}); fix or restore it before fetching.`);
  }
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error(`${path.relative(ROOT, file)} should hold an object of photo records.`);
  return json;
}

/** Write the registry atomically (temp file + rename), so an interrupted run never leaves half a file. */
export async function saveGenerated(records, file = GENERATED_FILE) {
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(sortRecords(records), null, 2)}\n`);
  await rename(temp, file);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** GET with retries on 429/5xx/maxlag, honouring Retry-After. Returns the Response (ok) or throws. */
export async function politeFetch(url, { retries = 4, accept = '*/*' } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { 'User-Agent': userAgent(), 'Api-User-Agent': userAgent(), Accept: accept } });
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await sleep(retryDelay(attempt));
      continue;
    }
    if (response.ok) return response;
    // Release the connection: an unread body keeps the socket busy.
    await response.body?.cancel().catch(() => {});
    lastError = new Error(`HTTP ${response.status} for ${url}`);
    lastError.status = response.status;
    if (response.status !== 429 && response.status < 500) throw lastError;
    if (attempt < retries) await sleep(retryDelay(attempt, response.headers.get('retry-after')));
  }
  throw lastError;
}

/** One API request, repeated while Commons answers maxlag/ratelimited. → parsed JSON */
async function apiGet(url, fetchImpl) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetchImpl(url, { accept: 'application/json' });
    const json = await response.json();
    const error = apiError(json);
    if (error && (error.code === 'maxlag' || error.code === 'ratelimited')) {
      await sleep(retryDelay(attempt, response.headers.get('retry-after') ?? (error.code === 'maxlag' ? 5 : undefined)));
      continue;
    }
    if (error) throw new Error(`Commons API error ${error.code}: ${error.info}`);
    return json;
  }
  throw new Error('Commons kept answering "maxlag"; try again later');
}

/**
 * imageinfo for many titles → Map(title → result). Batches of 50, one request
 * at a time (Wikimedia's API etiquette), maxlag-aware, following `continue`
 * until each batch is complete. `fetchImpl` is for tests.
 */
export async function queryImageInfo(titles, { thumbWidth = DOWNLOAD_WIDTH, fetchImpl = politeFetch, maxRounds = 20 } = {}) {
  const results = new Map();
  for (const batch of chunk([...new Set(titles)])) {
    const rounds = [];
    let cont;
    do {
      const json = await apiGet(imageInfoUrl(batch, { thumbWidth, cont }), fetchImpl);
      rounds.push(json);
      cont = json?.continue && typeof json.continue === 'object' ? json.continue : undefined;
    } while (cont && rounds.length < maxRounds);
    if (cont) throw new Error(`Commons kept sending "continue" for ${batch.length} titles; try fewer at once (--only)`);
    for (const [title, result] of parseImageInfoResponse(mergeQueryResponses(rounds), batch)) results.set(title, result);
  }
  return results;
}

/** Run `fn` over `items` with at most `limit` in flight. */
export async function pool(items, limit, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift());
  });
  await Promise.all(workers);
}

/** A friendly explanation for a network failure. */
export function networkHint(error) {
  const cause = error?.cause?.code || error?.cause?.message || error?.code || error?.status || error?.message;
  const lines = [`Could not reach Wikimedia Commons (${cause}).`];
  if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
    lines.push('HTTPS_PROXY is set: Node’s fetch only uses it with NODE_USE_ENV_PROXY=1 (Node ≥ 22.21), e.g.', '  NODE_USE_ENV_PROXY=1 npm run photos:fetch');
  }
  lines.push(
    'If commons.wikimedia.org / upload.wikimedia.org are blocked on this network, the app keeps showing each',
    'brochure’s generative art. You can still add a photo you own or licensed with `npm run photos:import`.',
  );
  return lines.join('\n');
}
