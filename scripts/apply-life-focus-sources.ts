// Apply the operator's two-channel source scope through the ordinary admin audit/version path.
import { parseArgs } from "node:util";
const { values } = parseArgs({ options: { apply: { type: "boolean", default: false } } });
process.env.MODEL_CALLS_ENABLED = "false";
process.env.COLLECT_ENABLED = "false";
const [{ sql, closeDb }, { updateSource }, { stopBoss }] = await Promise.all([
  import("@aihot/backend/db"), import("@aihot/backend/admin/sources"), import("@aihot/backend/jobs/queue"),
]);
const paused = new Set(["rss-sociology-pew", "rss-sociology-owid", "rss-sociological-science", "rss-sociology-socopen", "rss-interaction-nng", "rss-play-godot", "rss-play-factorio"]);
try {
  const sources = await sql<{ id: string; enabled: boolean; channel_hints: string[]; updated_at: Date }[]>`
    SELECT id, enabled, channel_hints, updated_at FROM sources
    WHERE channel_hints && ${['sociology','play']}::text[] OR id IN ${sql([...paused])} ORDER BY id`;
  let changed = 0;
  for (const source of sources) {
    const hints = source.channel_hints.filter(key => key !== "sociology" && key !== "play");
    const patch: Record<string, unknown> = {};
    if (JSON.stringify(hints) !== JSON.stringify(source.channel_hints)) patch.channel_hints = hints;
    const retiredOnly = source.channel_hints.length > 0 && source.channel_hints.every(key => key === "sociology" || key === "play");
    if ((paused.has(source.id) || retiredOnly) && source.enabled) patch.enabled = false;
    if (!Object.keys(patch).length) continue;
    console.log(JSON.stringify({ sourceId: source.id, before: { enabled: source.enabled, channel_hints: source.channel_hints }, patch, mode: values.apply ? "apply" : "dry-run" }));
    if (values.apply) await updateSource(source.id, { patch, version: source.updated_at.toISOString(), reason: "运营者撤下社会学和游戏角色；生物学转向动物、行为、人类学与古生物，暂停一般网站UX来源" }, "life-focus-cli");
    changed++;
  }
  console.log(JSON.stringify({ mode: values.apply ? "apply" : "dry-run", changed }));
} finally { await stopBoss(); await closeDb(); }
