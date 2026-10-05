import { SITE_DOMAIN_LABELS as DOMAIN_LABELS, isSiteDomainKey, readingDomain } from "@aihot/industry/channels";
import { ChannelGrid, DomainNav, TopicLinks, type ChannelOverview } from "../features/channels/Channels";
import { Link } from "react-router";
import { data as withHeaders, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import type { TimelineResponse } from "@aihot/contracts/site";
import { isCategoryKey, isChannelKey } from "@aihot/contracts/taxonomy";
import { loadOr404, queryString, releaseBoundCache } from "../lib/api.server";
import { listPath, websiteLd, pageMeta } from "../lib/seo";
import { Timeline } from "../features/feed/Timeline";
import { ContentTabs, SearchField } from "../features/feed/Filters";
import { SignalHero } from "../components/SignalHero";
import { hiddenTopic } from "@aihot/industry/topic-navigation";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  // Search lives on /all; keep the parameters so old links still land on results.
  if (q && q.trim()) throw redirect(`/all${url.search}`);
  const domainParam = url.searchParams.get("domain");
  if (["sociology", "play"].includes(domainParam ?? "") || hiddenTopic(url.searchParams.get("topic"))) {
    if (["sociology", "play"].includes(domainParam ?? "")) url.searchParams.delete("domain");
    url.searchParams.delete("topic"); url.searchParams.delete("page");
    throw redirect(`/${url.search}`);
  }
  const domain = isSiteDomainKey(domainParam) ? readingDomain(domainParam) : "all";
  const channelParam = url.searchParams.get("channel") ?? "all";
  const categoryParam = url.searchParams.get("category");
  const channel = isChannelKey(channelParam) ? channelParam : "all";
  const category = categoryParam && isCategoryKey(categoryParam) ? categoryParam : null;
  const tag = url.searchParams.get("tag")?.trim() || null;
  const topic = url.searchParams.get("topic")?.trim() || null;
  const upstream = new Headers();
  const [overview, data] = await Promise.all([
    loadOr404<ChannelOverview>("/api/site/channels", { signal: request.signal }),
    loadOr404<TimelineResponse>(`/api/site/timeline${queryString({ domain, channel: channel === "all" ? null : channel, category, tag, topic })}`, { responseHeaders: upstream, signal: request.signal }),
  ]);
  const refreshAt = [data.refreshAt, overview.refreshAt].filter((d): d is string => !!d).sort()[0] ?? null;
  return withHeaders({ data, overview, filters: data.filters }, { headers: releaseBoundCache(refreshAt, 60, Date.now(), upstream) });
}

export function meta({ loaderData }: Route.MetaArgs) {
  const f = loaderData?.filters;
  const path = listPath("/", { domain: f?.domain && f.domain !== "all" ? f.domain : null, channel: f && f.channel !== "all" ? f.channel : null, category: f?.category, tag: f?.tag });
  return pageMeta({ path, jsonLd: path === "/" ? websiteLd() : undefined });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export default function Home() {
  const { data, overview, filters } = useLoaderData<typeof loader>();
  const domainTitle = filters.domain && filters.domain !== "all" ? `${DOMAIN_LABELS[filters.domain]}精选` : "综合精选";
  const title = filters.tag ? `${domainTitle} · #${filters.tag}` : domainTitle;
  const comprehensive = !filters.domain || filters.domain === "all";
  return (
    <div className="pb-6">
      <DomainNav base="/" active={filters.domain ?? "all"} />
      {comprehensive && <>
      <SignalHero />
      <div className="radar-section-heading"><div><p className="radar-eyebrow">FOLLOW A THREAD</p><h2>两个领域的精选</h2></div><Link to="/channels">频道精选 ↗</Link></div>
      <ChannelGrid channels={overview.channels} selectedOverview />
      <TopicLinks />
      </>}
      <div className="radar-section-heading feed-heading"><div><p className="radar-eyebrow">THE LATEST SELECTION</p><h1 className="text-[22px] font-bold text-ink">{title}</h1></div><a href="/feed/channels/all.xml" className="rss-link">综合 RSS ↗</a></div>
      <div className="feed-filter-bar"><ContentTabs base="/" domain={filters.domain ?? "all"} topic={filters.topic} tag={filters.tag} category={filters.category} channel={filters.channel} layoutId="home-cat" className="min-w-0" /><SearchField variant="track" keep={{ domain: filters.domain === "all" ? null : filters.domain ?? null, topic: filters.topic ?? null, channel: filters.channel === "all" ? null : filters.channel, category: filters.category, tag: filters.tag }} /></div>
      <p className="reader-note">{comprehensive ? "综合精选" : domainTitle}按原始时间排列，可按研究方向、内容形态和来源继续阅读。模型评分用于编辑选择，来源数量不代表真实性。</p>
      <Timeline initial={data} filters={data.filters} />
    </div>
  );
}
