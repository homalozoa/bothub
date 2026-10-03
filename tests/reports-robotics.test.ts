// Synthetic program regressions, not evidence of real-world editorial quality.
import { stub, tag } from "./setup.ts";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import { closeDb, sql } from "@aihot/backend/db";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { candidates, composeDaily } from "@aihot/backend/reports/compose";
import { withBrand } from "@aihot/industry/site";
import { loadReport, reportHeadline } from "@aihot/backend/publication/reports";

const T = tag();
const SOURCE = `robotics-reports-${T}`;
let prompt = "";
let leadParagraph = "本期新增机器人工程资产，使用条件仍需检查。";
const provider = await stub((_hit, request) => {
  prompt = JSON.parse(request.body).messages.at(-1).content;
  return { choices: [{ message: { content: JSON.stringify({ title: "机器人新增进展", leadParagraph, highlights: [1, 1, 2, 3, 999] }) } }] };
});
process.env.DEEPSEEK_BASE_URL = `${provider.url}/v1`;
process.env.DEEPSEEK_API_KEY = "test-key";
before(async () => { await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${SOURCE}, 'Robot test source', 'rss', 'T1')`; });
beforeEach(async () => {
  await sql`DELETE FROM reports WHERE kind = 'daily' AND key BETWEEN '2096-01-01' AND '2096-01-31'`;
  await sql`DELETE FROM articles WHERE source_id = ${SOURCE}`;
  await sql`DELETE FROM facts WHERE story_id IN (SELECT id FROM stories WHERE title = ${`robotics-story-${T}`})`;
  await sql`DELETE FROM stories WHERE title = ${`robotics-story-${T}`}`;
  prompt = "";
  leadParagraph = "本期新增机器人工程资产，使用条件仍需检查。";
});
after(async () => {
  await sql`DELETE FROM reports WHERE kind = 'daily' AND key BETWEEN '2096-01-01' AND '2096-01-31'`;
  await sql`DELETE FROM articles WHERE source_id = ${SOURCE}`;
  await sql`DELETE FROM sources WHERE id = ${SOURCE}`;
  await sql`DELETE FROM facts WHERE story_id IN (SELECT id FROM stories WHERE title = ${`robotics-story-${T}`})`;
  await sql`DELETE FROM stories WHERE title = ${`robotics-story-${T}`}`;
  await provider.close(); await stopBoss(); await closeDb();
});

async function item(label: string, opts: { score?: number; publishedAt?: string | null; factId?: number; backfill?: boolean; category?: string } = {}) {
  const id = `robotics-${T}-${label}`;
  const at = new Date("2096-01-15T12:00:00Z");
  const published = opts.publishedAt ? new Date(opts.publishedAt) : null;
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at, published_at, backfill)
    VALUES (${id}, ${SOURCE}, ${id}, ${`https://example.com/${id}`}, ${label}, ${at}, ${at}, ${published}, ${opts.backfill ?? false})`;
  await sql`INSERT INTO publications (article_id, title, summary, source_id, channel, url, discovered_at, timeline_at, sort_at, published_at, eligible, selected, visible_after, visibility, score, category, fact_id, backfill)
    VALUES (${id}, ${label}, ${`新增事实：${label}；仅代码发布，权重与许可未核验。`}, ${SOURCE}, 'news', ${`https://example.com/${id}`}, ${at}, ${at}, ${at}, ${published}, true, true, ${at}, 'public', ${opts.score ?? 90}, ${opts.category ?? CATEGORIES[0]!.key}, ${opts.factId ?? null}, ${opts.backfill ?? false})`;
  return id;
}
const report = async () => (await sql`SELECT content, revision FROM reports WHERE kind = 'daily' AND key = '2096-01-16'`)[0]!;
const ids = (content: Record<string, any>): string[] => content.sections.flatMap((section: any) => section.items.map((entry: any) => entry.itemId));

test("daily capacity is three by default, omits extra flashes and leaves the full candidate flow intact", async () => {
  const made: string[] = [];
  for (let i = 0; i < 8; i++) made.push(await item(`code-release-${i}`, { score: 99 - i, category: CATEGORIES[i % CATEGORIES.length]!.key }));
  assert.equal((await candidates(new Date("2096-01-15T00:00:00Z"), new Date("2096-01-16T00:00:00Z"))).length, 8);
  assert.deepEqual(await composeDaily("2096-01-16"), { key: "2096-01-16", entries: 3 });
  const content = (await report()).content;
  assert.deepEqual(new Set(ids(content)), new Set(made.slice(0, 3)));
  assert.deepEqual(content.flashes, []);
  assert.equal(content.generator.omittedByCapacity, 5);
  assert.equal(content.highlights.length, 3, "nonexistent model refs cannot create additional entries");
  const calls = provider.hits();
  await composeDaily("2096-01-16");
  assert.equal(provider.hits(), calls);
  assert.equal((await report()).revision, 1);
});

test("a fact covered 13 days ago is suppressed while a later weight release stays a distinct reportable fact", async () => {
  const [story] = await sql`INSERT INTO stories (public_id, title) VALUES (${randomUUID()}, ${`robotics-story-${T}`}) RETURNING id`;
  const [prior] = await sql`INSERT INTO facts (public_id, story_id, title) VALUES (${`robotics-old-${T}`}, ${story!.id}, '项目发布') RETURNING id, public_id`;
  const [later] = await sql`INSERT INTO facts (public_id, story_id, title) VALUES (${`robotics-new-${T}`}, ${story!.id}, '项目后续开放权重') RETURNING id`;
  const old = await item("same-release-report", { factId: prior!.id, score: 99 });
  const newRelease = await item("weights-release", { factId: later!.id });
  const history = { lead: { title: "历史项目发布", leadParagraph: "不要盲目迁移，先检查部署条件。" }, sections: [{ label: "历史", items: [{ itemId: "old-original", factId: prior!.public_id }] }] };
  await sql`INSERT INTO reports (kind, key, window_start, window_end, content, generated_at) VALUES ('daily', '2096-01-03', now(), now(), ${sql.json(history)}, now())`;
  assert.deepEqual(await composeDaily("2096-01-16"), { key: "2096-01-16", entries: 1 });
  const content = (await report()).content;
  assert.deepEqual(ids(content), [newRelease]);
  assert.equal(ids(content).includes(old), false);
  assert.equal(content.generator.repeatsSuppressed, 1);
  assert.match(prompt, /近14天已刊导语/);
  assert.match(prompt, /不要盲目迁移/);
  assert.match(prompt, /本期新增事实/);
});

test("a repeated engineering lead falls back to current summaries without another model request", async () => {
  const id = await item("new-bsp-release");
  leadParagraph = "不要盲目迁移，先检查部署条件。";
  const history = { lead: { title: "历史", leadParagraph }, sections: [] };
  await sql`INSERT INTO reports (kind, key, window_start, window_end, content, generated_at) VALUES ('daily', '2096-01-02', now(), now(), ${sql.json(history)}, now())`;
  const calls = provider.hits();
  await composeDaily("2096-01-16");
  assert.equal(provider.hits(), calls + 1);
  assert.match((await report()).content.lead.leadParagraph, /新增事实：new-bsp-release/);
  assert.deepEqual(ids((await report()).content), [id]);
});

test("report citations keep original dates unknown and exclude historical backfills", async (t) => {
  const dated = await item("dated", { publishedAt: "2096-01-15T10:00:00Z" });
  const unknown = await item("unknown-date");
  const old = await item("old-recollected", { publishedAt: "2095-01-01T00:00:00Z", backfill: true, score: 99 });
  const picked = await candidates(new Date("2096-01-15T00:00:00Z"), new Date("2096-01-16T00:00:00Z"));
  assert.equal(picked.find((entry) => entry.itemId === dated)!.publishedAt, "2096-01-15T10:00:00.000Z");
  assert.equal(picked.find((entry) => entry.itemId === unknown)!.publishedAt, null);
  assert.equal(picked.find((entry) => entry.itemId === unknown)!.discoveredAt, "2096-01-15T12:00:00.000Z");
  assert.equal(picked.some((entry) => entry.itemId === old), false);
  await composeDaily("2096-01-16");
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2096-01-16T00:01:00Z") });
  const edition = await loadReport("daily", "2096-01-16");
  assert.equal(edition!.stories.find((entry) => entry.itemId === unknown)!.publishedAt, null);
  assert.equal(edition!.stories.find((entry) => entry.itemId === dated)!.publishedAt, "2096-01-15T10:00:00.000Z");
});

// A compact branded issue name must not masquerade as a news headline after a withdrawal.
test("branded issue names preserve public headline fallback and withdrawal filtering", () => {
  const themes = [{ storyRefs: [{ itemId: "gone", title: "已撤回的事实" }, { itemId: "safe", title: "仍公开的机器人进展" }] }];
  for (const title of ["机器人热点 周报 · 2026-W39", `${withBrand("周报")} · 2026-W39`, `${withBrand("月报")} · 2026-09`]) {
    assert.equal(reportHeadline({ title, themes }, "periodic", new Set(["gone"])), "仍公开的机器人进展");
    assert.equal(reportHeadline({ title, themes }, "periodic", new Set(["gone", "safe"])), null);
  }
});
