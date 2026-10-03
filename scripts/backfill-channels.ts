// Explicit reviewed source IDs only. No model calls, date changes, deliveries or re-analysis.
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { sql, closeDb, type Tx } from "@aihot/backend/db";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { publishArticleTx } from "@aihot/backend/publication/publish";
import { audit, Conflict } from "@aihot/backend/audit";
import { isDomainKey } from "@aihot/industry/channels";
const { values } = parseArgs({ options: { sources: { type: "string" }, domain: { type: "string", default: "robotics" }, apply: { type: "boolean" }, rollback: { type: "string" }, out: { type: "string", default: ".data/channel-backfill.json" } } });
async function assertTimestamps(tx: Tx, id: string) {
  const [row] = await tx<{ aligned: boolean }[]>`SELECT (p.published_at, p.discovered_at, p.timeline_at) IS NOT DISTINCT FROM (a.published_at, a.discovered_at, a.timeline_at) AS aligned FROM publications p JOIN articles a ON a.id = p.article_id WHERE p.article_id = ${id}`;
  if (!row?.aligned) throw new Error(`Timestamp projection differs on ${id}; reconcile it separately before assigning a channel`);
}
interface Change { id: string; before: Record<string, unknown>; version: number; primaryChannel: string | null; relatedChannels: string[] }
try {
  if (values.rollback) {
    if (values.apply || values.sources) throw new Error("Rollback must be a separate command");
    const changes = JSON.parse(readFileSync(values.rollback, "utf8")) as Change[];
    await sql.begin(async tx => {
      for (const c of changes) {
        await tx`SELECT id FROM articles WHERE id = ${c.id} FOR UPDATE`;
        await assertTimestamps(tx, c.id);
        const [current] = await tx<{ fields: Record<string, unknown>; version: number }[]>`SELECT fields, version FROM editorial_overrides WHERE article_id = ${c.id} FOR UPDATE`;
        if (!current || current.version !== c.version) throw new Conflict(`Later human changes on ${c.id}; rollback cancelled`);
        await tx`UPDATE editorial_overrides SET fields = ${tx.json(c.before as never)}, version = version + 1, updated_by = 'channel-backfill-cli', updated_at = now() WHERE article_id = ${c.id}`;
        await tx`UPDATE publications SET primary_channel = ${c.primaryChannel ?? null}, related_channels = ${c.relatedChannels ?? []} WHERE article_id = ${c.id}`;
        await publishArticleTx(tx, c.id, { releasedAt: new Date() });
        await audit("channel-backfill-cli", "content.channel.rollback", `content:${c.id}`, "Restore reviewed historical channel assignment", current.fields, c.before, { db: tx });
      }
    });
    console.log(`Restored ${changes.length} assignments; dates and deliveries preserved`);
  } else {
    if (!isDomainKey(values.domain)) throw new Error("Unknown domain");
    const sources = [...new Set(values.sources?.split(",").map(s => s.trim()).filter(Boolean) ?? [])];
    if (!sources.length) throw new Error("Pass explicit --sources after reviewing their historical titles; default is dry-run");
    const rows = await sql<{ id: string; title: string; published_at: Date | null; source_id: string }[]>`
      SELECT p.article_id AS id, p.title, p.published_at, p.source_id FROM publications p
      WHERE p.source_id IN ${sql(sources)} AND p.primary_channel IS NULL
        AND NOT EXISTS (SELECT 1 FROM editorial_overrides o WHERE o.article_id = p.article_id AND o.fields ? 'primaryChannel')
      ORDER BY p.source_id, p.article_id`;
    console.log(JSON.stringify({ mode: values.apply ? "apply" : "dry-run", domain: values.domain, count: rows.length, rows }, null, 2));
    if (values.apply) {
      const changes = await sql.begin(async tx => {
        const out: Change[] = [];
        for (const row of rows) {
          await tx`SELECT id FROM articles WHERE id = ${row.id} FOR UPDATE`;
          await assertTimestamps(tx, row.id);
          const [old] = await tx<{ fields: Record<string, unknown>; version: number }[]>`SELECT fields, version FROM editorial_overrides WHERE article_id = ${row.id} FOR UPDATE`;
          // A concurrent administrator correction wins, even between preview and the lock.
          if (old?.fields.primaryChannel !== undefined) continue;
          const [projection] = await tx<{ primary_channel: string | null; related_channels: string[] }[]>`SELECT primary_channel, related_channels FROM publications WHERE article_id = ${row.id}`;
          const before = old?.fields ?? {};
          const fields = { ...before, primaryChannel: values.domain };
          const [saved] = await tx<{ version: number }[]>`INSERT INTO editorial_overrides (article_id, fields, reason, updated_by, version)
            VALUES (${row.id}, ${tx.json(fields)}, 'Reviewed historical channel assignment', 'channel-backfill-cli', 1)
            ON CONFLICT (article_id) DO UPDATE SET fields = EXCLUDED.fields, version = editorial_overrides.version + 1, updated_by = EXCLUDED.updated_by, updated_at = now() RETURNING version`;
          await publishArticleTx(tx, row.id, { releasedAt: new Date() });
          await audit("channel-backfill-cli", "content.channel.backfill", `content:${row.id}`, "Reviewed historical channel assignment", before, fields, { db: tx });
          out.push({ id: row.id, before, version: saved!.version, primaryChannel: projection!.primary_channel, relatedChannels: projection!.related_channels });
        }
        // Write undo material before commit; an unwritable output path aborts the transaction.
        writeFileSync(values.out!, JSON.stringify(out, null, 2) + "\n", { mode: 0o600 });
        return out;
      });
      console.log(`Assigned ${changes.length}; rollback file: ${values.out}`);
    }
  }
} finally { await stopBoss(); await closeDb(); }
