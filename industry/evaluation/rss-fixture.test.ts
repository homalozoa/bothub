import assert from "node:assert/strict";
import http from "node:http";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fetchRss } from "../../packages/backend/src/sources/rss.ts";
import { config } from "../../packages/backend/src/config.ts";
import type { SourceRow } from "../../packages/backend/src/sources/types.ts";

test("production RSS parser reads observed robotics RSS/Atom metadata offline and preserves missing bodies/bad dates", async () => {
  const previous = config.allowPrivateNetworkFetch;
  const files = new Map([['/rss', readFileSync(new URL('./fixtures/qbit-robotics.rss', import.meta.url))], ['/atom', readFileSync(new URL('./fixtures/ros2-release.atom', import.meta.url))]]);
  const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'application/xml; charset=utf-8' }); res.end(files.get(req.url ?? '') ?? ''); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  config.allowPrivateNetworkFetch = true; // Only this local response fixture; no external request.
  try {
    const root = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const source = (route: string) => ({ id: 'offline-robotics-fixture', name: 'Offline fixture', kind: 'rss', tier: 'T1', first_party: true, enabled: true, interval_minutes: 120, fail_count: 0, config: { feedUrl: root + route }, participation_mode: 'editorial', cursor: null }) satisfies SourceRow;
    const rss = (await fetchRss(source('/rss'))).candidates;
    assert.equal(rss.length, 2);
    assert.equal(rss[0]?.url, 'https://www.qbitai.com/2026/09/499493.html');
    assert.equal(rss[0]?.publishedAt?.toISOString(), '2026-09-30T07:54:54.000Z');
    assert.equal(rss[0]?.bodyStatus, 'pending');
    assert.equal(rss[1]?.publishedAt, null);
    const atom = (await fetchRss(source('/atom'))).candidates;
    assert.equal(atom.length, 1);
    assert.equal(atom[0]?.url, 'https://github.com/ros2/ros2/releases/tag/release-humble-20260914');
    assert.equal(atom[0]?.publishedAt?.toISOString(), '2026-09-14T18:34:12.000Z');
    assert.equal(atom[0]?.bodyStatus, 'pending');
  } finally {
    config.allowPrivateNetworkFetch = previous;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
