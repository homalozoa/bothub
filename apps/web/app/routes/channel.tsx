import { Form, Link, data as withHeaders, useLoaderData, useSearchParams } from "react-router";
import { domainInfo, isDomainKey } from "@aihot/industry/channels";
import { isCategoryKey, isChannelKey } from "@aihot/contracts/taxonomy";
import type { PoolResponse, TimelineResponse } from "@aihot/contracts/site";
import type { Route } from "./+types/channel";
import { loadOr404, queryString, releaseBoundCache } from "../lib/api.server";
import { pageMeta } from "../lib/seo";
import { Timeline } from "../features/feed/Timeline";
import { DayList, Pagination } from "../features/feed/DayList";
import { EmptyState } from "../components/ui/Page";
import { DomainNav, ChannelIcon } from "../features/channels/Channels";
import { SearchField, hrefWith } from "../features/feed/Filters";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (!isDomainKey(params.domain)) throw new Response("Unknown channel", { status: 404 });
  const domain = domainInfo(params.domain);
  const url = new URL(request.url);
  const sp = url.searchParams;
  const q = sp.get("q")?.trim().slice(0, 200) || null;
  const mode = q || sp.get("view") === "latest" ? "latest" : "selected";
  const channel = isChannelKey(sp.get("channel")) ? sp.get("channel")! : "all";
  const category = isCategoryKey(sp.get("category")) ? sp.get("category") : null;
  const tag = sp.get("tag")?.trim().slice(0, 60) || null;
  const rawSince = sp.get("since");
  const since = rawSince && /^\d{4}-\d{2}-\d{2}$/.test(rawSince) && Number.isFinite(Date.parse(rawSince)) && new Date(rawSince).toISOString().slice(0, 10) === rawSince ? rawSince : null;
  const page = Math.min(Math.max(Number.parseInt(sp.get("page") ?? "1", 10) || 1, 1), 50);
  const upstream = new Headers();
  const filters = { domain: domain.key, channel, category, tag, since };
  const endpoint = mode === "latest" ? "/api/site/pool" : "/api/site/timeline";
  const result = await loadOr404<TimelineResponse | PoolResponse>(`${endpoint}${queryString({ ...filters, channel: channel === "all" ? null : channel, q, page: page > 1 ? page : null, tab: sp.get("tab") })}`, { signal: request.signal, responseHeaders: upstream });
  return withHeaders({ domain, mode, result, q, since }, { headers: releaseBoundCache("refreshAt" in result ? result.refreshAt : null, 60, Date.now(), upstream) });
}
export function headers({ loaderHeaders }: Route.HeadersArgs) { return loaderHeaders; }
export function meta({ loaderData, location }: Route.MetaArgs) {
  if (!loaderData) return pageMeta({ title: "频道", path: "/channels", noindex: true });
  return [...pageMeta({ title: `${loaderData.domain.label}${loaderData.q ? ` · 搜索 ${loaderData.q}` : ""}`, description: loaderData.domain.description, path: `${location.pathname}${location.search}`, noindex: !!loaderData.q }),
    { tagName: "link", rel: "alternate", type: "application/rss+xml", title: `${loaderData.domain.label}精选`, href: `/feed/channels/${loaderData.domain.key}.xml` }];
}
const types = ["论文/研究", "开源/仓库", "观点/分析", "教程/实践", "产品更新"];
export default function Channel() {
  const { domain, mode, result, q, since } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const base = `/channels/${domain.key}`;
  const f = result.filters;
  const keep = { view: "latest", tag: f.tag, category: f.category, channel: f.channel === "all" ? null : f.channel, since };
  return <div className="radar-page">
    <DomainNav active={domain.key} />
    <header className={`channel-header domain-${domain.key}`}>
      <div><p className="radar-eyebrow">ZOORADAR / {domain.english.toUpperCase()}</p><h1>{domain.label}<span className="title-dot">.</span></h1><p>{domain.description}</p></div>
      <ChannelIcon domain={domain.key} className="channel-header-icon" />
    </header>
    <div className="reader-toolbar">
      <nav aria-label="阅读方式" className="reading-switch">
        <Link aria-current={mode === "selected" ? "page" : undefined} to={hrefWith(base, params, { view: null, q: null, tab: null })}>精选</Link>
        <Link aria-current={mode === "latest" ? "page" : undefined} to={hrefWith(base, params, { view: "latest", q: null, tab: null })}>最新</Link>
      </nav>
      <a className="rss-link" href={`/feed/channels/${domain.key}${mode === "latest" ? "/latest" : ""}.xml`}>订阅{mode === "latest" ? "最新" : "精选"} RSS <span aria-hidden="true">↗</span></a>
    </div>
    <div className="channel-controls">
      <SearchField action={base} defaultValue={q ?? ""} keep={keep} variant="bar" />
      <Form method="get" action={base} className="channel-filter-form">
        <input type="hidden" name="view" value={mode} />{q && <input type="hidden" name="q" value={q} />}
        <label>内容形态<select name="tag" defaultValue={f.tag ?? ""} key={`tag-${f.tag}`}><option value="">全部形态</option>{types.map(t => <option key={t}>{t}</option>)}</select></label>
        <label>来源<select name="channel" defaultValue={f.channel} key={`source-${f.channel}`}><option value="all">全部来源</option><option value="firstParty">一手来源</option><option value="news">资讯</option><option value="x">X</option></select></label>
        <label>起始日期<input type="date" name="since" defaultValue={since ?? ""} key={`since-${since}`} /></label>
        <button type="submit">筛选</button>
      </Form>
    </div>
    <p className="reader-note">{q ? `在${domain.label}中搜索“${q}”` : mode === "selected" ? "本频道的近期精选 · 保留原始发表日期" : "按原始日期阅读，包括明确标记的历史资料"} · <Link to={`/all${q ? `?q=${encodeURIComponent(q)}` : ""}`}>浏览全站 ↗</Link></p>
    {"cards" in result ? <Timeline initial={result} filters={result.filters} /> : result.items.length ? <><DayList items={result.items} todayCount={null} showTags /><Pagination page={result.page} pageCount={result.pageCount} href={page => { const sp = new URLSearchParams(params); sp.set("page", String(page)); return `${base}?${sp}`; }} /></> : <div className="channel-empty-panel"><ChannelIcon domain={domain.key} /><EmptyState title={q ? "没有找到相关内容" : "等待下一条值得读的发现"}>{q ? "换个说法，或调整频道内的筛选条件。" : "这个频道暂时没有符合条件的内容。你可以订阅 RSS，或浏览其他频道。"}</EmptyState></div>}
  </div>;
}
