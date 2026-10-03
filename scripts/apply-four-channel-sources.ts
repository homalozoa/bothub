// Explicit four-channel source policy. Does not alter articles, budgets, licences or administrator settings.
import { parseArgs } from "node:util";
const { values } = parseArgs({ options: { apply: { type: "boolean", default: false } } });
process.env.MODEL_CALLS_ENABLED = "false";
process.env.COLLECT_ENABLED = "false";
const [{ sql, closeDb }, { updateSource }, { stopBoss }] = await Promise.all([
  import("@aihot/backend/db"), import("@aihot/backend/admin/sources"), import("@aihot/backend/jobs/queue"),
]);
const paused = new Set(["rss-play-godot", "rss-play-factorio", "rss-sociology-socopen"]);
try {
  const sources = await sql<{ id: string; enabled: boolean; channel_hints: string[]; updated_at: Date }[]>`SELECT id, enabled, channel_hints, updated_at FROM sources WHERE channel_hints && ${['natural-history','interaction','play']}::text[] OR id IN ${sql([...paused])} ORDER BY id`;
  let changed = 0;
  for (const source of sources) {
    const hints = [...new Set(source.channel_hints.flatMap(key => key === "natural-history" ? ["biology"] : key === "interaction" ? ["agents"] : key === "play" ? [] : [key]))];
    const patch: Record<string, unknown> = {};
    if (JSON.stringify(hints) !== JSON.stringify(source.channel_hints)) patch.channel_hints = hints;
    if (paused.has(source.id) && source.enabled) patch.enabled = false;
    if (!Object.keys(patch).length) continue;
    console.log(JSON.stringify({ sourceId: source.id, before: { enabled: source.enabled, channel_hints: source.channel_hints }, patch, mode: values.apply ? "apply" : "dry-run" }));
    if (values.apply) await updateSource(source.id, { patch, version: source.updated_at.toISOString(), reason: "运营者确认四主频道；自然史并入生物，交互改主题，暂停泛游戏开发与运营博客" }, "four-channel-cli");
    changed++;
  }
  console.log(JSON.stringify({ mode: values.apply ? "apply" : "dry-run", changed }));
} finally { await stopBoss(); await closeDb(); }
