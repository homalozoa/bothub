import { monthDayTime } from "../../lib/format";
import { Link, useLocation, useSearchParams } from "react-router";
import { DISPLAY_DOMAINS as DOMAINS, readingDomain, type DomainKey, type SiteDomainKey } from "@aihot/industry/channels";
import { topicShortcuts, topicsForDomain } from "@aihot/industry/topic-navigation";
import type { TimelineCard } from "@aihot/contracts/site";
import { useEffect, useRef } from "react";

export interface ChannelOverview { channels: Array<(typeof DOMAINS)[number] & { featured: TimelineCard | null; total?: number; hasSelected?: boolean }>; refreshAt: string | null }

const paths: Record<DomainKey, string> = {
  robotics: "M9 9h22v19H9z M15 9V5m10 4V5M5 14v9m30-9v9M15 17h.1m10 0h.1M15 23h10M13 28v7m14-7v7",
  agents: "m14 12-8 8 8 8m12-16 8 8-8 8M23 7l-6 26",
  interaction: "M7 7h24v19H20l-9 7v-7H7zM13 14h12m-12 5h7",
  play: "M13 12h14c5 0 8 16 5 19-3 2-6-5-9-5h-6c-3 0-6 7-9 5-3-3 0-19 5-19zM10 19h8m-4-4v8M26 18h.1m3 4h.1",
  biology: "M20 34V18M20 24C9 25 6 16 7 7c10 0 16 8 13 17zM20 29c0-13 7-19 14-19 0 12-5 20-14 19z",
  "natural-history": "M29 31C8 35 4 13 17 7c10-5 21 4 17 14-3 9-17 9-17 0 0-6 9-7 10-1M13 32l-3 4m11-5 1 5M8 21l-5 1",
  sociology: "M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM32 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 31v-6c0-9 16-9 16 0v6M20 31v-6c0-9 16-9 16 0v6",
};
export function ChannelIcon({ domain, className = "" }: { domain: SiteDomainKey; className?: string }) {
  return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><path d={paths[domain === "ai-robotics" ? "robotics" : domain]} /></svg>;
}
export function DomainNav({ active = "all", base }: { active?: SiteDomainKey | "all"; base?: "/" | "/all" }) {
  const selectedDomain = active === "all" ? "all" : readingDomain(active);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const scroller = ref.current;
    const selected = scroller?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!scroller || !selected) return;
    const reveal = () => {
      if (scroller.scrollWidth <= scroller.clientWidth) return;
      const bounds = scroller.getBoundingClientRect();
      const item = selected.getBoundingClientRect();
      if (item.left < bounds.left) scroller.scrollLeft -= bounds.left - item.left;
      else if (item.right > bounds.right) scroller.scrollLeft += item.right - bounds.right;
    };
    reveal();
    const resize = new ResizeObserver(reveal);
    resize.observe(scroller);
    return () => resize.disconnect();
  }, [active]);
  const { search } = useLocation();
  const keep = new URLSearchParams(search);
  keep.delete("page"); keep.delete("domain"); keep.delete("q"); keep.delete("since"); keep.delete("tag");
  const target = (key: SiteDomainKey | "all") => {
    if (!base) {
      const sp = new URLSearchParams(keep);
      if (key === "all" || !topicsForDomain(key).some(t => t.slug === sp.get("topic"))) sp.delete("topic");
      return key === "all" ? "/" : `/channels/${key}${sp.toString() ? `?${sp}` : ""}`;
    }
    const sp = new URLSearchParams(search); sp.delete("page"); sp.delete("cursor"); sp.delete("category"); sp.delete("topic"); sp.delete("tag");
    if (key === "all") sp.delete("domain"); else sp.set("domain", key);
    return base + (sp.toString() ? `?${sp}` : "");
  };
  return <nav ref={ref} className="domain-nav" aria-label="领域频道">
    <Link to={target("all")} aria-current={selectedDomain === "all" ? "page" : undefined} className={selectedDomain === "all" ? "active" : ""}>综合</Link>
    {DOMAINS.map(d => <Link key={d.key} to={target(d.key)} aria-current={selectedDomain === d.key ? "page" : undefined} className={selectedDomain === d.key ? "active" : ""}>{d.label}</Link>)}
  </nav>;
}
export function ChannelGrid({ channels, compact = false, selectedOverview = false }: { channels: ChannelOverview["channels"]; compact?: boolean; selectedOverview?: boolean }) {
  return <div className={`channel-grid ${compact ? "compact" : ""} ${selectedOverview ? "selected-overview" : ""}`}>
    {channels.map((d, i) => <article key={d.key} className={`channel-tile domain-${d.key}`}>
      <Link to={`/channels/${d.key}`} className="channel-tile-heading"><ChannelIcon domain={d.key} /><span className="channel-index">0{i + 1}</span><h2>{d.label}</h2><span className="channel-arrow" aria-hidden="true">↗</span></Link>
      {!compact && <p className="channel-description">{d.description}</p>}
      {!compact && (d.featured ? <Link className="channel-preview" to={`/items/${d.featured.item.id}`}><span>频道精选 · {d.featured.item.source.name} · {monthDayTime(d.featured.item.publishedAt ?? d.featured.item.timelineAt)}</span>{d.featured.item.title}</Link> : <div className="channel-empty"><p>{typeof d.total === "number" ? d.hasSelected ? "本频道精选已在其他领域展示" : `已收录 ${d.total} 条，暂无当前精选` : "暂无当前精选"}</p><Link to={`/channels/${d.key}${d.hasSelected ? "" : "?view=latest"}`} className="mt-2 inline-block text-accent">{d.hasSelected ? "查看本频道精选" : "查看最新"} →</Link></div>)}
    </article>)}
  </div>;
}

export function TopicLinks({ domain }: { domain?: SiteDomainKey }) {
  const [params] = useSearchParams();
  const topics = topicShortcuts(domain);
  return <div className="topic-shortcuts"><span>按主题看</span>{topics.map(t => {
    const sp = new URLSearchParams(params); sp.delete("page"); sp.delete("cursor"); sp.set("topic", t.slug);
    return <Link key={t.slug} aria-current={domain && params.get("topic") === t.slug ? "page" : undefined} to={domain ? `/channels/${domain}?${sp}` : `/topics/${t.slug}?view=all`}>{t.name} <span aria-hidden="true">↗</span></Link>;
  })}<Link to={domain ? `/topics#topics-${readingDomain(domain)}` : "/topics"}>全部主题 ↗</Link></div>;
}
