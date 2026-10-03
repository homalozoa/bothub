import { sql } from "../db.ts";
import { listedCondition } from "./scope.ts";
import { domainCondition } from "./items.ts";
// A small, bounded overview from the same published timeline as each channel page.
import { DOMAINS } from "@aihot/industry/channels";
import { loadTimeline } from "./timeline.ts";

export async function channelOverview() {
  const now = new Date();
  const rows = await Promise.all(DOMAINS.map(async domain => {
    const result = await loadTimeline({ domain: domain.key, channel: "all", category: null, tag: null, limit: 3 });
    const [count] = await sql<{ total: number }[]>`SELECT count(*)::int AS total FROM publications p WHERE ${listedCondition(now)} ${domainCondition(domain.key)}`;
    return { domain, total: count!.total, cards: result.cards, refreshAt: result.refreshAt };
  }));
  // The same canonical story/fact appears once in the overview, even with related domains.
  const seen = new Set<string>();
  const channels = rows.map(({ domain, total, cards }) => {
    const card = cards.find(c => !seen.has(c.key)) ?? null;
    if (card) seen.add(card.key);
    return { ...domain, total, hasSelected: cards.length > 0, featured: card };
  });
  const deadlines = rows.map(r => r.refreshAt).filter((d): d is string => d !== null).sort();
  return { channels, refreshAt: deadlines[0] ?? null };
}
