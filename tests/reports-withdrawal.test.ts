// A generated report's prose may quote any input, so removal must reach every public report exit.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { MCP_TOOL_NAMES } from "@aihot/contracts/mcp";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import { setVisibility } from "@aihot/backend/admin/content";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { closeDb, sql } from "@aihot/backend/db";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { dailyAnswer } from "@aihot/backend/publication/agent";
import { publishArticle } from "@aihot/backend/publication/publish";
import { v1Daily } from "@aihot/backend/publication/reports";
import { buildApp } from "../apps/api/src/app.ts";

const T = tag();
const SOURCE = `report-withdrawal-${T}`;
const CLAIM = `RETRACTED_CLAIM_${T}`;
const SAFE = `REMAINING_FACT_${T}`;
const DAILY = "2094-12-29", WEEKLY = "2094-W52", MONTHLY = "2094-12";
const app = await buildApp();
const address = await app.listen({ host: "127.0.0.1", port: 0 });
const client = new Client({ name: "report-withdrawal-test", version: "1" });
await client.connect(new StreamableHTTPClientTransport(new URL(`${address}/api/mcp`)));
let removed: string;

async function article(title: string) {
  const at = new Date(Date.now() - 3600000);
  const { articleId } = await upsertMaterial({ sourceId: SOURCE, url: `https://example.com/${T}/${title}`, title, bodyText: `${title} 原始材料`, bodyStatus: "ok", publishedAt: at, discoveredAt: at, via: "fetch" });
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, score, selected)
    VALUES (${articleId}, 1, 'rule', 'pass', ${CATEGORIES[0]!.key}, ${title}, ${`${title} 摘要`}, 90, true)`;
  await publishArticle(articleId, { releasedAt: at });
  return { itemId: articleId, title, summary: `${title} 摘要`, sourceName: "Synthetic report source", sourceUrl: `https://example.com/${T}/${title}` };
}

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${SOURCE}, 'Synthetic report source', 'rss', 'T1')`;
  const bad = await article(CLAIM), safe = await article(SAFE);
  removed = bad.itemId;
  const base = { lead: { title: `${CLAIM} 导语标题`, leadParagraph: `${CLAIM} 导语核心事实` }, sections: [{ label: "硬件与系统工程", items: [bad, safe] }], flashes: [], highlights: [bad.itemId, safe.itemId], generator: { timeZone: "America/New_York", dailyTime: "09:35" } };
  for (const [kind, key] of [["daily", DAILY], ["weekly", WEEKLY], ["monthly", MONTHLY]]) {
    const content = kind === "daily" ? base : { headline: `${CLAIM} 标题`, title: `${CLAIM} 历史标题`, overview: `${CLAIM} 总述`, themes: [{ heading: `${CLAIM} 主题`, summary: `${CLAIM} 主题摘要`, storyRefs: [bad, safe] }] };
    await sql`INSERT INTO reports (kind, key, window_start, window_end, content, generated_at) VALUES (${kind!}, ${key!}, now() - interval '1 day', now(), ${sql.json(content)}, now())`;
  }
});
after(async () => {
  try {
    await sql`DELETE FROM reports WHERE (kind = 'daily' AND key = ${DAILY}) OR (kind = 'weekly' AND key = ${WEEKLY}) OR (kind = 'monthly' AND key = ${MONTHLY})`;
    await sql`DELETE FROM articles WHERE source_id = ${SOURCE}`;
    await sql`DELETE FROM sources WHERE id = ${SOURCE}`;
  } finally { await client.close(); await app.close(); await stopBoss(); await closeDb(); }
});

test("daily agent answers describe the stored publication calendar rather than a visitor location", async () => {
  const result = (await v1Daily(DAILY))!.report;
  assert.equal(result.timeZone, "America/New_York");
  assert.equal(result.dailyTime, "09:35");
  const answer = dailyAnswer(result, "mcp");
  assert.match(answer, /刊期时区 America\/New_York/);
  assert.match(answer, /每天 09:35/);
  assert.doesNotMatch(answer, /每天 08:00|收录北京时间/);
});

test("withdrawal suppresses derived prose in warm website/API/RSS/MCP report reads while keeping other facts", async () => {
  const paths = [
    `/api/site/reports/daily/${DAILY}`, `/api/v1/dailies/${DAILY}`, "/api/v1/dailies", "/feed/daily.xml", `/api/v1/agent/daily/${DAILY}`,
    `/api/site/reports/weekly/${WEEKLY}`, `/api/v1/weeklies/${WEEKLY}`, "/api/v1/weeklies",
    `/api/site/reports/monthly/${MONTHLY}`, `/api/v1/monthlies/${MONTHLY}`, "/api/v1/monthlies",
  ];
  for (const path of paths) {
    const response = await app.inject({ method: "GET", url: path });
    assert.equal(response.statusCode, 200, path);
    assert.ok(response.body.includes(CLAIM), `${path} contained the claim before withdrawal`);
  }
  assert.ok(JSON.stringify(await client.callTool({ name: MCP_TOOL_NAMES.daily, arguments: { date: DAILY } })).includes(CLAIM));
  await setVisibility(removed, { visibility: "withdrawn", reason: "Synthetic regression removal", version: 0 }, "test");
  for (const path of paths) {
    const response = await app.inject({ method: "GET", url: path });
    assert.equal(response.statusCode, 200, path);
    assert.ok(!response.body.includes(CLAIM), `${path} retained withdrawn derived prose`);
    assert.ok(response.body.includes(SAFE), `${path} still exposes the other fact`);
  }
  const mcp = JSON.stringify(await client.callTool({ name: MCP_TOOL_NAMES.daily, arguments: { date: DAILY } }));
  assert.ok(!mcp.includes(CLAIM), "warm MCP no longer quotes withdrawn report prose");
  assert.ok(mcp.includes(SAFE));
});
