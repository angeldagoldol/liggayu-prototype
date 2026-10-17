// @vitest-environment node
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadGenerated, queryImageInfo, saveGenerated, userAgent } from './io.mjs';

/** A stand-in for politeFetch: answers from a list of JSON bodies and records the URLs asked for. */
function fakeApi(bodies) {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(new URL(url));
    const body = bodies[urls.length - 1];
    if (!body) throw new Error(`unexpected request ${urls.length}`);
    return { json: async () => body, headers: new Headers() };
  };
  return { urls, fetchImpl };
}

const imageinfo = (name) => [
  { width: 3000, height: 2000, mime: 'image/jpeg', url: `https://upload.wikimedia.org/wikipedia/commons/a/ab/${name}`, extmetadata: { LicenseShortName: { value: 'CC BY 4.0' }, Artist: { value: 'A' } } },
];

describe('queryImageInfo', () => {
  it('follows "continue" until the batch is complete, then answers every title', async () => {
    const { urls, fetchImpl } = fakeApi([
      {
        continue: { iicontinue: 'B.jpg|20200101000000', continue: '||' },
        query: { pages: [{ title: 'File:A.jpg', imageinfo: imageinfo('A.jpg') }, { title: 'File:B.jpg' }] },
      },
      { batchcomplete: true, query: { pages: [{ title: 'File:A.jpg' }, { title: 'File:B.jpg', imageinfo: imageinfo('B.jpg') }] } },
    ]);
    const results = await queryImageInfo(['File:A.jpg', 'File:B.jpg', 'File:A.jpg'], { fetchImpl });
    expect(urls).toHaveLength(2);
    expect(urls[1].searchParams.get('iicontinue')).toBe('B.jpg|20200101000000');
    expect(urls[1].searchParams.get('titles')).toBe('File:A.jpg|File:B.jpg');
    expect(results.get('File:A.jpg').info.url).toMatch(/A\.jpg$/);
    expect(results.get('File:B.jpg').info.url).toMatch(/B\.jpg$/);
  });

  it('asks in batches of 50, one request at a time', async () => {
    const titles = Array.from({ length: 120 }, (_, i) => `File:P${i}.jpg`);
    const bodies = [0, 1, 2].map(() => ({ batchcomplete: true, query: { pages: [] } }));
    let inFlight = 0;
    let most = 0;
    const { urls, fetchImpl } = fakeApi(bodies);
    const slow = async (url) => {
      inFlight += 1;
      most = Math.max(most, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return fetchImpl(url);
    };
    const results = await queryImageInfo(titles, { fetchImpl: slow });
    expect(urls.map((u) => u.searchParams.get('titles').split('|').length)).toEqual([50, 50, 20]);
    expect(most).toBe(1);
    expect(results.get('File:P7.jpg')).toMatchObject({ missing: true });
  });

  it('gives up on endless continuation and reports API errors', async () => {
    const loop = { continue: { iicontinue: 'x', continue: '||' }, query: { pages: [] } };
    await expect(queryImageInfo(['File:A.jpg'], { fetchImpl: fakeApi([loop, loop, loop]).fetchImpl, maxRounds: 3 })).rejects.toThrow(/continue/);
    await expect(queryImageInfo(['File:A.jpg'], { fetchImpl: fakeApi([{ error: { code: 'badvalue', info: 'nope' } }]).fetchImpl })).rejects.toThrow(/badvalue: nope/);
  });

  it('identifies itself the way Wikimedia asks', () => {
    expect(userAgent()).toMatch(/^TabiBrochures-PhotoFetch\/1\.0 \(.+\) node\//);
  });
});

describe('the generated registry file', () => {
  let dir;
  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'tabi-registry-'));
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('starts empty when missing, and round-trips sorted records without leaving temp files', async () => {
    const file = path.join(dir, 'photos.generated.json');
    expect(await loadGenerated(file)).toEqual({});
    await saveGenerated({ 'b-photo': { id: 'b-photo' }, 'a-photo': { id: 'a-photo' } }, file);
    expect(Object.keys(JSON.parse(await readFile(file, 'utf8')))).toEqual(['a-photo', 'b-photo']);
    expect(await loadGenerated(file)).toEqual({ 'a-photo': { id: 'a-photo' }, 'b-photo': { id: 'b-photo' } });
    expect(await readdir(dir)).toEqual(['photos.generated.json']);
  });

  it('refuses a damaged file instead of treating it as empty (which would wipe every record on save)', async () => {
    const file = path.join(dir, 'broken.json');
    await writeFile(file, '{ "a-photo": { "id": "a-ph');
    await expect(loadGenerated(file)).rejects.toThrow(/not valid JSON/);
    await writeFile(file, '[]');
    await expect(loadGenerated(file)).rejects.toThrow(/object of photo records/);
  });
});
