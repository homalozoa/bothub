import { ChannelGrid, DomainNav, type ChannelOverview } from "../features/channels/Channels";
import { Link } from "react-router";
import { data as withHeaders, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import type { TimelineResponse } from "@aihot/contracts/site";
import { isCategoryKey, isChannelKey } from "@aihot/contracts/taxonomy";
import { loadOr404, queryString, releaseBoundCache } from "../lib/api.server";
import { listPath, websiteLd, pageMeta } from "../lib/seo";
import { Timeline } from "../features/feed/Timeline";
import { CategoryTabs, SearchField } from "../features/feed/Filters";
import { SignalHero } from "../components/SignalHero";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  // Search lives on /all; keep the parameters so old links still land on results.
  if (q && q.trim()) throw redirect(`/all${url.search}`);
  const channelParam = url.searchParams.get("channel") ?? "all";
  const categoryParam = url.searchParams.get("category");
  const channel = isChannelKey(channelParam) ? channelParam : "all";
  const category = categoryParam && isCategoryKey(categoryParam) ? categoryParam : null;
  const tag = url.searchParams.get("tag")?.trim() || null;
  const upstream = new Headers();
  const [overview, data] = await Promise.all([
    loadOr404<ChannelOverview>("/api/site/channels", { signal: request.signal }),
    loadOr404<TimelineResponse>(`/api/site/timeline${queryString({ channel: channel === "all" ? null : channel, category, tag })}`, { responseHeaders: upstream, signal: request.signal }),
  ]);
  const refreshAt = [data.refreshAt, overview.refreshAt].filter((d): d is string => !!d).sort()[0] ?? null;
  return withHeaders({ data, overview, filters: { channel, category, tag, topic: null } }, { headers: releaseBoundCache(refreshAt, 60, Date.now(), upstream) });
}

export function meta({ loaderData }: Route.MetaArgs) {
  const f = loaderData?.filters;
  const path = listPath("/", { channel: f && f.channel !== "all" ? f.channel : null, category: f?.category, tag: f?.tag });
  return pageMeta({ path, jsonLd: path === "/" ? websiteLd() : undefined });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export default function Home() {
  const { data, overview, filters } = useLoaderData<typeof loader>();
  const title = filters.tag ? `#${filters.tag}` : "精选";
  return (
    <div className="pb-6">
      <DomainNav />
      <SignalHero />
      <div className="radar-section-heading"><div><p className="radar-eyebrow">FOLLOW A THREAD</p><h2>七个频道，一整个世界</h2></div><Link to="/channels">频道精选 ↗</Link></div>
      <ChannelGrid channels={overview.channels} compact />
      <div className="radar-section-heading feed-heading"><div><p className="radar-eyebrow">THE LATEST SELECTION</p><h2>{title === "精选" ? "最新精选" : title}</h2></div><a href="/feed/channels/all.xml" className="rss-link">综合 RSS ↗</a></div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><CategoryTabs base="/" category={filters.category} channel={filters.channel} layoutId="home-cat" className="min-w-0" /><SearchField variant="track" keep={{ category: filters.category }} /></div>
      <p className="reader-note">先在各频道内筛选，再沿原始来源阅读。模型评分用于编辑选择，来源数量不代表真实性。</p>
      <Timeline initial={data} filters={data.filters} />
    </div>
  );
}
