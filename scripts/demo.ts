// Offline fixture demonstration through the real parser, editorial and publication code.
// Only accepts a dedicated demo test database. The only provider is this local HTTP stub.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawnSync } from "node:child_process";

const database = new URL(process.env.DATABASE_URL ?? "postgres://unset/unset").pathname.slice(1);
if (!/^bothot_demo.*_(test|ci)$/.test(database) || process.env.NODE_ENV === "production") {
  throw new Error("演示只允许开发环境的独立 bothot_demo*_test 或 bothot_demo*_ci 数据库，先运行迁移；禁止生产库。");
}
const topics = spawnSync(process.execPath, ["scripts/seed.ts", "--topics-only"], { stdio: "inherit" });
if (topics.status !== 0) throw new Error("演示主题初始化失败，请先确认数据库迁移。");
for (const key of Object.keys(process.env)) {
  if (key.endsWith("_API_KEY") || key.endsWith("_MODEL") || key.endsWith("_BASE_URL")) delete process.env[key];
}
Object.assign(process.env, {
  MODEL_CALLS_ENABLED: "true", COLLECT_ENABLED: "false", FEISHU_CONTENT_PUSH_ENABLED: "false", FEISHU_INTERNAL_ENABLED: "false",
  INDEXNOW_SUBMIT_ENABLED: "false", AIHOT_CREDENTIALS_DIR: "/nonexistent-demo-credentials", LOG_LEVEL: "error",
});
const summaries: Record<string, { title: string; summary: string; category: string; type: string; tag: string; themes?: string[]; domain?: string; related?: string[] }> = {
  DEMO_CODE: { title: "【离线演示】操作策略项目发布训练代码", summary: "这是一条合成演示材料：示例项目发布了操作策略训练代码及运行配置，用于展示原文、摘要和事件归组。演示材料没有模型权重或数据集，不能称为完整开源，也不能据此判断真实机器人领域筛选效果。", category: "research", type: "tool_or_prompt", tag: "开源/仓库" },
  DEMO_WEIGHTS: { title: "【离线演示】同一操作策略项目后续开放权重", summary: "这是一条合成后续进展：示例项目在代码发布之后开放权重，用于展示同一事件中的新增事实。材料只描述仿真测试，没有真机或跨环境验证，数据和硬件设计许可仍为未知。", category: "research", type: "model_release", tag: "模型发布" },
  DEMO_SENSOR: { title: "【离线演示】传感器同步方案提供测量日志", summary: "这是一条合成硬件材料：示例传感器同步方案提供测量日志与接线说明，用于展示硬件与系统分类。延迟数据仅代表示例条件，不是独立测试或厂商真实指标，温度范围、可靠性和采购价格尚未验证。", category: "hardware", type: "product_launch", tag: "产品更新" },
};
if (process.env.MULTICHANNEL_DEMO === "true") Object.assign(summaries, {
  DEMO_AGENT: { domain: "agents", title: "【离线演示】长任务 Agent 的权限与失败恢复", summary: "合成材料展示一个长任务系统如何请求工具权限、保存中断位置并恢复任务。示例未提供真实任务成功率或成本，固定本地响应只验证领域路由与页面。", category: "research", type: "tool_or_prompt", tag: "开源/仓库" },
  DEMO_INTERACTION: { domain: "agents", themes: ["人机交互"], title: "【离线演示】AI助手交互研究记录使用者的退出原因", summary: "合成研究材料展示一项AI助手交互观察如何同时记录使用、喜欢与退出，保留参与者与持续时间的解释边界。它不代表真实研究结果，也不宣称改善了生活。", category: "research", type: "research_paper", tag: "论文/研究" },
  DEMO_PLAY: { domain: "sociology", themes: ["游戏与角色"], title: "【离线演示】玩家社群中的角色关系访谈", summary: "合成社会学材料描述玩家社群的共同活动和角色关系，保留参与者、观察时段与群体背景。访谈个案不能推及所有玩家，示例不代表真实研究或商业数据。", category: "industry", type: "opinion_analysis", tag: "观点/分析" },
  DEMO_BIOLOGY: { domain: "biology", themes: ["游戏与角色"], title: "【离线演示】动物游戏行为的观察与替代解释", summary: "合成生物学材料展示如何描述一个物种的游戏行为、观察条件和替代解释。材料不涉及机器人或商业应用，也不能将单物种观察推广到所有动物。关联游戏频道仍使用同一个详情地址。", category: "research", type: "research_paper", tag: "论文/研究" },
  DEMO_NATURAL: { domain: "biology", themes: ["自然史"], title: "【离线演示】一组标本修订了物种演化的解释", summary: "合成自然史材料展示标本背景、地层、测年和分类依据。未知条件保持未知，原始发表时间不因被收录而更新。这是页面和程序样例，没有真实发现结论。", category: "research", type: "research_paper", tag: "论文/研究" },
  DEMO_SOCIAL: { domain: "sociology", title: "【离线演示】照护与工作如何进入家庭的日常", summary: "合成社会学材料展示一个地区的家庭照护田野访谈，讨论受访者经验、时间与生活背景。小样本不等同于低质量，也不将相关性写成普遍因果。", category: "research", type: "opinion_analysis", tag: "观点/分析" },
});
let calls = 0;
let feed = "";
const server = createServer(async (req, res) => {
  if (req.url === "/feed.xml") { res.writeHead(200, { "content-type": "application/rss+xml" }); res.end(feed); return; }
  if (req.url !== "/v1/chat/completions") { res.writeHead(404); res.end(); return; }
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const request = JSON.parse(Buffer.concat(chunks).toString());
  const system = String(request.messages.find((m: { role: string }) => m.role === "system")?.content ?? "");
  const user = String(request.messages.at(-1)?.content ?? "");
  const marker = Object.keys(summaries).find((m) => user.includes(m)) ?? "DEMO_CODE";
  const item = summaries[marker]!;
  let content: unknown;
  if (system.includes("四频道宽召回预筛")) content = { label: "PASS", reason: "离线演示固定响应", primaryChannel: item.domain ?? "robotics", relatedChannels: item.related ?? [] };
  else if (system.includes("事件注意力评分器")) content = { attentionScore: 82 };
  else if (system.includes("内容理解编辑")) content = { itemType: item.type, authorRole: "unknown", tags: [item.tag, ...(item.themes ?? [])], editorialJudgment: "离线演示：固定分数仅测试流程，不是编辑评测。", titleZh: item.title, summaryZh: item.summary };
  else if (system.includes("资料结构化助手")) content = { primaryChannel: item.domain ?? "robotics", relatedChannels: item.related ?? [], category: item.category, tags: [item.tag, ...(item.themes ?? [])], subjects: [], fact: { title: item.title, subject: "演示项目", action: marker === "DEMO_WEIGHTS" ? "开放权重" : "发布代码", object: marker === "DEMO_SENSOR" ? "传感器" : "操作策略", occurredAt: null } };
  else if (user.includes("【候选")) content = { query: "演示项目发布", decisions: [...user.matchAll(/【候选 (C\d+)】/g)].map((m) => ({ id: m[1], relation: item.domain ? "UNRELATED" : user.includes("后续开放权重") ? "SAME_STORY" : "SAME_OCCURRENCE", confidence: 0.95, note: "离线固定关系" })) };
  else if (user.includes("报道 A")) content = { a: "发布", b: "发布", relation: item.domain ? "UNRELATED" : user.includes("后续开放权重") ? "SAME_STORY" : "SAME_OCCURRENCE", difference: "离线演示", confidence: 0.95 };
  else if (system.includes("日报主编")) content = { title: "【离线演示】机器人资讯流程试读", leadParagraph: "本页使用合成材料和本地固定响应，展示采集、摘要、归组和日报页面。没有访问外部模型，没有真实筛选质量结论。", highlights: [1, 2, 3] };
  else { res.writeHead(400); res.end(JSON.stringify({ error: { message: "unhandled demo request" } })); return; }
  calls++;
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ id: `demo-${calls}`, choices: [{ message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } }));
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
assert.ok(address && typeof address !== "string");
const base = `http://127.0.0.1:${address.port}`;
Object.assign(process.env, { LLM_BASE_URL: `${base}/v1`, LLM_API_KEY: "local-fixture-only", LLM_MODEL: "offline-demo", LLM_EXTRA_JSON: "{}" });
const { config } = await import("@aihot/backend/config");
config.allowPrivateNetworkFetch = true;
config.selectedVisibleAfterSeconds = 0;
const { sql, closeDb } = await import("@aihot/backend/db");
const { stopBoss } = await import("@aihot/backend/jobs/queue");
try {
  const { fetchRss } = await import("@aihot/backend/sources/rss");
  const { upsertMaterial } = await import("@aihot/backend/content/materials");
  const { analyzeArticle } = await import("@aihot/backend/editorial/analyze");
  const { groupArticle } = await import("@aihot/backend/events/group");
  const { publishArticle } = await import("@aihot/backend/publication/publish");
  const { composeDaily, dueDaily } = await import("@aihot/backend/reports/compose");
  const at = new Date();
  // Fixed URLs make repeated runs idempotent. Different editions do not pretend to be new facts.
  feed = `<?xml version="1.0"?><rss version="2.0"><channel><title>离线演示</title>${Object.entries(summaries).map(([marker, item]) => `<item><title>${marker} ${item.title}</title><link>https://example.org/bothot-demo/${marker}</link><pubDate>${at.toUTCString()}</pubDate><description><![CDATA[<p>${marker} ${item.summary.repeat(8)}</p>]]></description></item>`).join("")}</channel></rss>`;
  const source = { id: "bothot-offline-demo", name: "合成演示信源（非真实新闻）", kind: "rss" as const, config: { feedUrl: `${base}/feed.xml`, summaryIsBody: true }, tier: "T1", first_party: false, participation_mode: "editorial" as const, interval_minutes: 60, enabled: true, cursor: null, fail_count: 0 };
  await sql`INSERT INTO sources (id,name,kind,config,tier,participation_mode,first_party,site_fulltext,syndicate_fulltext,enabled,next_fetch_at) VALUES (${source.id},${source.name},'rss',${sql.json({})},'T1','editorial',false,false,false,false,'2100-01-01') ON CONFLICT (id) DO NOTHING`;
  const { candidates } = await fetchRss(source);
  assert.equal(candidates.length, Object.keys(summaries).length);
  let created = 0;
  for (const candidate of candidates) {
    const material = await upsertMaterial({ ...candidate, sourceId: source.id, via: "import" });
    if (material.created) created++;
    await analyzeArticle(material.articleId);
    await publishArticle(material.articleId);
    await groupArticle(material.articleId);
    await publishArticle(material.articleId);
  }
  // Compose the window containing these newly arrived fixtures (next local cutoff).
  const key = dueDaily(new Date(Date.now() + 86400000));
  const report = await composeDaily(key);
  const rows = await sql`SELECT article_id, title, selected, fact_id, story_id FROM publications WHERE source_id=${source.id}`;
  assert.equal(rows.length, Object.keys(summaries).length);
  assert.ok(rows.every((row) => String(row.title).includes("离线演示") && row.selected && row.fact_id));
  console.log(JSON.stringify({ mode: "offline-fixture", database, parsed: candidates.length, created, published: rows.length, report, localStubCalls: calls, externalModelCalls: 0, qualityEvaluation: "NOT_RUN" }, null, 2));
} finally {
  await stopBoss();
  await closeDb();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}
