import { DOMAIN_KEYS, type DomainKey } from "@aihot/industry/channels";
// Pack imports add new source IDs; existing administrator settings are deliberately preserved.
import { audit } from "../audit.ts";
import { sql } from "../db.ts";
import { assertSupportedConfig } from "./config-keys.ts";

export interface SeedSource {
  id: string;
  name: string;
  kind: "rss" | "web_list" | "json_list" | "x_search" | "mp_account" | "external";
  config: Record<string, unknown>;
  tier?: string;
  first_party?: boolean;
  owner_entity_id?: string | null;
  participation_mode?: string;
  interval_minutes?: number;
  tags?: string[];
  channel_hints?: DomainKey[];
  site_fulltext?: boolean;
  syndicate_fulltext?: boolean;
  enabled?: boolean;
}

export async function seedSources(sources: SeedSource[]): Promise<number> {
  for (const s of sources) {
    assertSupportedConfig(s.kind, s.config);
    if (s.channel_hints?.some(d => !DOMAIN_KEYS.includes(d))) throw new Error(`Invalid channel hint on ${s.id}`);
  }
  return sql.begin(async (tx) => {
    let added = 0;
    for (const s of sources) {
      const inserted = await tx`
        INSERT INTO sources (id, name, kind, config, tier, first_party, owner_entity_id, participation_mode, interval_minutes, tags, channel_hints, site_fulltext, syndicate_fulltext, enabled, next_fetch_at)
        VALUES (${s.id}, ${s.name}, ${s.kind}, ${tx.json(s.config as never)}, ${s.tier ?? "T2"}, ${s.first_party ?? false}, ${s.owner_entity_id ?? null},
                ${s.participation_mode ?? "editorial"}, ${s.interval_minutes ?? 60}, ${s.tags ?? []}, ${s.channel_hints ?? []}, ${s.site_fulltext ?? false}, ${s.syndicate_fulltext ?? false},
                ${s.enabled ?? true}, now())
        ON CONFLICT (id) DO NOTHING RETURNING id`;
      added += inserted.length;
    }
    return added;
  });
}

/** Explicit IDs only: never infer that every source absent from the pack is obsolete. */
export async function disableObsoleteSources(ids: string[], currentPackIds: string[]): Promise<number> {
  const requested = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (!requested.length) throw new Error("--disable-obsolete requires comma-separated source IDs");
  const current = new Set(currentPackIds);
  const included = requested.filter((id) => current.has(id));
  if (included.length) throw new Error(`Cannot disable current pack sources as obsolete: ${included.join(", ")}`);
  return sql.begin(async (tx) => {
    const rows = await tx<{ id: string; enabled: boolean }[]>`SELECT id, enabled FROM sources WHERE id IN ${tx(requested)} FOR UPDATE`;
    const known = new Set(rows.map((row) => row.id));
    const unknown = requested.filter((id) => !known.has(id));
    if (unknown.length) throw new Error(`Unknown obsolete source IDs: ${unknown.join(", ")}`);
    const active = rows.filter((row) => row.enabled);
    for (const row of active) {
      await tx`UPDATE sources SET enabled = false, updated_at = now() WHERE id = ${row.id}`;
      await audit("seed-cli", "source.disable", `source:${row.id}`, "Explicit obsolete-source cleanup", { enabled: true }, { enabled: false }, { db: tx });
    }
    return active.length;
  });
}
