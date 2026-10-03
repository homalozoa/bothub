import { DOMAIN_WINDOWS, isDomainKey } from "@aihot/industry/channels";
import { FUTURE_TOLERANCE_MS } from "./materials.ts";

/** Current news expires by source time, never by a new crawl or model run. */
export const NEWS_WINDOW_MS = 7 * 86400_000;

export interface NewsTime {
  published_at: Date | null;
  discovered_at: Date;
  backfill?: boolean;
  primary_channel?: string | null;
}

export function newsTimeStatus(a: NewsTime, now = new Date()): "current" | "historical" | "expired" | "future" {
  const policy = DOMAIN_WINDOWS[isDomainKey(a.primary_channel) ? a.primary_channel : "robotics"];
  if ((!a.published_at && a.backfill) || (a.published_at && a.discovered_at.getTime() - a.published_at.getTime() > policy.discoveryDays * 86400_000)) return "historical";
  // A live undated source retains its first-seen time; an undated backfill never becomes news.
  const at = (a.published_at ?? a.discovered_at).getTime();
  if (!Number.isFinite(at) || at > now.getTime() + FUTURE_TOLERANCE_MS) return "future";
  return now.getTime() - at >= policy.newsDays * 86400_000 ? "expired" : "current";
}
