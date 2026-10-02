// Runs collection for given sources now (development / operations helper).
// COLLECT_ENABLED=true node --env-file=.env scripts/collect.ts rss-robot-report rss-lerobot-releases
import { closeDb } from "@aihot/backend/db";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { collectSource } from "@aihot/backend/sources/collect";

const ids = process.argv.slice(2);
if (process.env.COLLECT_ENABLED !== "true" || ids.length === 0 || ids.length > 3) {
  throw new Error("真实试抓需显式 COLLECT_ENABLED=true 并指定1–3个信源ID；模型调用可保持关闭。来源验证请用 check-sources.ts --live。");
}
for (const id of ids) {
  const started = Date.now();
  const r = await collectSource(id, { force: true });
  console.log(JSON.stringify({ ...r, ms: Date.now() - started }));
}
await stopBoss();
await closeDb();
