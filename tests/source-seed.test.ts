import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { disableObsoleteSources, seedSources, type SeedSource } from "@aihot/backend/sources/seed";

const T = tag();
const source = (label: string): SeedSource => ({ id: `seed-${T}-${label}`, name: label, kind: "rss", config: { feedUrl: `https://example.com/${label}.xml` }, enabled: false });
after(async () => { await sql`DELETE FROM articles WHERE source_id LIKE ${`seed-${T}-%`}`; await sql`DELETE FROM sources WHERE id LIKE ${`seed-${T}-%`}`; await closeDb(); });

test("re-seeding adds new configured sources and preserves administrator settings and imported content", async () => {
  const first = source("first");
  assert.equal(await seedSources([first]), 1);
  const articleId = `seed-material-${T}`;
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at) VALUES (${articleId}, ${first.id}, ${articleId}, 'https://example.com/material', 'Imported material', now(), now())`;
  await sql`UPDATE sources SET name = 'Admin title', config = '{"feedUrl":"https://example.com/admin.xml"}', interval_minutes = 240, enabled = true WHERE id = ${first.id}`;
  const before = (await sql`SELECT * FROM sources WHERE id = ${first.id}`)[0];
  const second = source("second");
  assert.equal(await seedSources([{ ...first, name: "New pack title" }, second]), 1);
  assert.deepEqual((await sql`SELECT * FROM sources WHERE id = ${first.id}`)[0], before);
  assert.equal(await seedSources([first, second]), 0);
  assert.equal((await sql`SELECT enabled FROM sources WHERE id = ${second.id}`)[0]!.enabled, false);
  assert.equal((await sql`SELECT title FROM articles WHERE id = ${articleId}`)[0]!.title, "Imported material");
});

test("obsolete-source cleanup disables only explicitly named IDs, records it and remains idempotent", async () => {
  const obsolete = source("obsolete"), custom = source("custom"), current = source("current");
  await seedSources([obsolete, custom, current].map((s) => ({ ...s, enabled: true })));
  assert.equal(await disableObsoleteSources([obsolete.id], [current.id]), 1);
  assert.equal(await disableObsoleteSources([obsolete.id], [current.id]), 0);
  const rows = await sql<{ id: string; enabled: boolean }[]>`SELECT id, enabled FROM sources WHERE id IN ${sql([obsolete.id, custom.id, current.id])}`;
  assert.equal(rows.find((s) => s.id === obsolete.id)!.enabled, false);
  assert.equal(rows.find((s) => s.id === custom.id)!.enabled, true);
  assert.equal(rows.find((s) => s.id === current.id)!.enabled, true);
  assert.equal((await sql`SELECT count(*)::int AS n FROM audit_log WHERE action = 'source.disable' AND subject = ${`source:${obsolete.id}`}`)[0]!.n, 1);
});

test("typos or current-pack IDs abort an explicit obsolete cleanup before disabling anything", async () => {
  const keep = source("keep");
  await seedSources([{ ...keep, enabled: true }]);
  await assert.rejects(disableObsoleteSources([keep.id], [keep.id]), /current pack/);
  await assert.rejects(disableObsoleteSources([keep.id, `missing-${T}`], []), /Unknown/);
  assert.equal((await sql`SELECT enabled FROM sources WHERE id = ${keep.id}`)[0]!.enabled, true);
});
