import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { newsTimeStatus, NEWS_WINDOW_MS } from "@aihot/backend/content/news-time";
import { runSelectionScores, type AnalyzeInputArticle } from "@aihot/backend/editorial/analyze";
import { publishArticle } from "@aihot/backend/publication/publish";
import { loadTimeline } from "@aihot/backend/publication/timeline";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { buildApp } from "../apps/api/src/app.ts";

const T = tag();
const SOURCE = `news-time-${T}`;
const app = await buildApp();
before(async () => {
  await sql`INSERT INTO sources (id,name,kind,tier,participation_mode) VALUES (${SOURCE},'Time fixture','rss','T1','editorial')`;
});
after(async () => {
  await app.close();
  await stopBoss();
  await closeDb();
});

test("freshness uses original dates across years, including the 48 hour and 7 day boundaries", () => {
  const now = new Date("2027-01-01T00:00:00Z");
  const date = (ago: number) => new Date(now.getTime() - ago);
  const a = { published_at: date(24 * 3600_000), discovered_at: now, backfill: true };
  assert.equal(newsTimeStatus(a, now), "current", "yesterday in the previous year is still news");
  assert.equal(newsTimeStatus({ ...a, published_at: date(48 * 3600_000) }, now), "current");
  assert.equal(newsTimeStatus({ ...a, published_at: date(48 * 3600_000 + 1), backfill: false }, now), "historical");
  assert.equal(newsTimeStatus({ ...a, published_at: null }, now), "historical");
  assert.equal(newsTimeStatus({ ...a, published_at: date(NEWS_WINDOW_MS), discovered_at: date(NEWS_WINDOW_MS) }, now), "expired");
  assert.equal(newsTimeStatus({ ...a, published_at: new Date(now.getTime() + 3600_001) }, now), "future");
});

test("history and delayed analysis never issue selected-score requests", async () => {
  const now = new Date();
  const input: AnalyzeInputArticle = {
    id: T, revision: 1, title: "ROS 2 Kilted Kaiju Released", url: "https://example.org/kilted", author: null,
    publishedAt: new Date("2025-05-23T19:00:00Z"), discoveredAt: now, backfill: true,
    bodyText: "Official release announcement", excerpt: null, xPost: null, media: [],
    source: { name: "ROS", kind: "rss", tier: "T1", firstParty: true },
  };
  assert.equal(await runSelectionScores(input), null);
  const old = new Date(now.getTime() - NEWS_WINDOW_MS - 1);
  assert.equal(await runSelectionScores({ ...input, publishedAt: old, discoveredAt: old, backfill: false }), null);
});

async function material(published: Date, discovered: Date, backfill?: string) {
  const { articleId } = await upsertMaterial({ sourceId: SOURCE, url: `https://example.org/${T}-${published.getTime()}`,
    title: "ROS release", bodyText: "Original release notes", via: "fetch", publishedAt: published, discoveredAt: discovered, backfill });
  await sql`INSERT INTO analyses (article_id,input_revision,origin,relevance,title_zh,summary_zh,score,selected)
    VALUES (${articleId},1,'rule','pass',${`公告-${T}`},'发布摘要',100,true)`;
  return articleId;
}

test("old high scores and manual selection cannot publish as current news; legacy projections stay out of every current feed", async () => {
  const now = new Date();
  const id = await material(new Date("2025-05-23T19:00:00Z"), now);
  await sql`INSERT INTO editorial_overrides (article_id, fields) VALUES (${id}, ${sql.json({ selected: true })})`;
  await publishArticle(id, { now, releasedAt: now });
  const [p] = await sql`SELECT selected, score FROM publications WHERE article_id = ${id}`;
  assert.equal(p!.selected, false);
  assert.equal(Number(p!.score), 100, "original score remains evidence");
  // Read protection also covers a previous release's stored selected=true projection.
  await sql`UPDATE publications SET selected=true,visible_after=${now},tags=${[T]} WHERE article_id=${id}`;
  assert.deepEqual((await loadTimeline({ channel: "all", category: null, tag: T, topic: null, now })).cards, []);
  for (const url of ["/feed.xml", "/feed/full.xml", "/api/v1/items?mode=selected&window=7d"]) {
    const res = await app.inject({ method: "GET", url });
    assert.equal(res.statusCode, 200, url);
    assert.ok(!res.body.includes(id), url);
  }
  const detail = await app.inject({ method: "GET", url: `/api/site/items/${id}` });
  assert.equal(detail.statusCode, 200);
  assert.equal(detail.json().historical, true);
  assert.equal(detail.json().publishedAt, "2025-05-23T19:00:00.000Z");
  const archive = await app.inject({ method: "GET", url: `/api/site/pool?tag=${T}` });
  assert.equal(archive.statusCode, 200);
  assert.ok(archive.body.includes(id), "archive remains searchable");
});

test("a fresh first import is selectable but a queued publication and a warm timeline expire by source time", async (t) => {
  const now = Math.floor(Date.now() / 1000) * 1000;
  const at = new Date(now - NEWS_WINDOW_MS + 1000);
  const id = await material(at, at, "initial-import");
  await publishArticle(id, { now: at, releasedAt: at });
  await sql`UPDATE publications SET tags=${[`${T}-expiry`]} WHERE article_id=${id}`;
  const query = { channel: "all" as const, category: null, tag: `${T}-expiry`, topic: null };
  t.mock.timers.enable({ apis: ["Date"], now });
  const before = await loadTimeline(query);
  assert.deepEqual(before.cards.map(c => c.item.id), [id]);
  assert.equal(before.refreshAt, new Date(now + 1000).toISOString());
  t.mock.timers.setTime(now + 1000);
  assert.deepEqual((await loadTimeline(query)).cards, [], "warm cache expires at the exact boundary");
  await publishArticle(id, { now: new Date(now + 1000), releasedAt: new Date(now + 1000) });
  const [p] = await sql`SELECT selected FROM publications WHERE article_id=${id}`;
  assert.equal(p!.selected, false, "publication also rechecks delayed processing");
});
