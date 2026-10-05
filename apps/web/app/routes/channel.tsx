import { Form, Link, redirect, data as withHeaders, useLoaderData, useSearchParams } from "react-router";
import { siteDomainInfo, isSiteDomainKey, readingDomain, domainPath, retainedTopic } from "@aihot/industry/channels";
import { contentFormsForDomain, subtopicsForDomain } from "@aihot/industry/topic-navigation";
import catalog from "@aihot/industry/topics.json";
import { isCategoryKey, isChannelKey } from "@aihot/contracts/taxonomy";
import type { PoolResponse, TimelineResponse } from "@aihot/contracts/site";
import type { Route } from "./+types/channel";
import { loadOr404, queryString, releaseBoundCache } from "../lib/api.server";
import { pageMeta } from "../lib/seo";
import { Timeline } from "../features/feed/Timeline";
import { DayList, Pagination } from "../features/feed/DayList";
import { EmptyState } from "../components/ui/Page";
import { DomainNav, ChannelIcon, TopicLinks } from "../features/channels/Channels";
import { SearchField, hrefWith } from "../features/feed/Filters";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (!isSiteDomainKey(params.domain)) throw new Response("Unknown channel", { status: 404 });
  if (params.domain === "sociology" || params.domain === "play") throw redirect("/channels", 308);
  const legacy = retainedTopic(params.domain);
  if (legacy || readingDomain(params.domain) !== params.domain) throw redirect(`${domainPath(params.domain)}${new URL(request.url).search}`, 308);
  const domain = siteDomainInfo(params.domain);
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
  const topic = sp.get("topic")?.trim().slice(0, 100) || null;
  const filters = { domain: domain.key, channel, category, tag, topic, since };
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
export default function Channel() {
  const { domain, mode, result, q, since } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const base = `/channels/${domain.key}`;
  const f = result.filters;
  const topics = subtopicsForDomain(domain.key);
  const forms = contentFormsForDomain(domain.key);
  const empty = "cards" in result ? result.cards.length === 0 && !result.nextCursor : result.items.length === 0;
  const keep = { view: "latest", topic: f.topic ?? null, tag: f.tag, category: f.category, channel: f.channel === "all" ? null : f.channel, since };
  return <div className="radar-page">
    <DomainNav active={domain.key} />
    <header className={`channel-header domain-${domain.key}`}>
      <div><p className="radar-eyebrow">ZOORADAR / {domain.english.toUpperCase()}</p><h1>{domain.label}<span className="title-dot">.</span></h1><p>{domain.description}</p></div>
      <ChannelIcon domain={domain.key} className="channel-header-icon" />
    </header>
    <TopicLinks domain={domain.key} />
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
        <label>主题<select name="topic" defaultValue={f.topic ?? ""} key={`topic-${f.topic}`}><option value="">全部主题</option>{f.topic && !topics.some(t => t.slug === f.topic) && <option value={f.topic}>当前主题：{catalog.topics.find(t => t.slug === f.topic)?.name ?? f.topic}</option>}{topics.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label>
        <label>内容形态<select name="tag" defaultValue={f.tag ?? ""} key={`tag-${f.tag}`}><option value="">全部形态</option>{f.tag && !forms.includes(f.tag) && <option value={f.tag}>当前标签：{f.tag}</option>}{forms.map(t => <option key={t}>{t}</option>)}</select></label>
        <label>来源<select name="channel" defaultValue={f.channel} key={`source-${f.channel}`}><option value="all">全部来源</option><option value="firstParty">一手来源</option><option value="news">资讯</option><option value="x">X</option></select></label>
        <label>起始日期<input type="date" name="since" defaultValue={since ?? ""} key={`since-${since}`} /></label>
        <button type="submit">筛选</button>
      </Form>
    </div>
    <p className="reader-note">{q ? `在${domain.label}中搜索“${q}”` : mode === "selected" ? "本频道的近期精选 · 保留原始发表日期" : "按原始日期阅读，包括明确标记的历史资料"} · <Link to={`/all${q ? `?q=${encodeURIComponent(q)}` : ""}`}>浏览全站 ↗</Link></p>
    {empty ? <div className="channel-empty-panel"><ChannelIcon domain={domain.key} /><EmptyState title={q ? "没有找到相关内容" : mode === "selected" ? "本频道暂无当前精选" : "暂无符合条件的内容"} action={<Link className="text-[13px] font-medium text-accent" to={hrefWith(base, params, { view: "latest", q: null, tag: null, topic: null, channel: null, since: null, category: null })}>{mode === "selected" && !q ? "查看最新内容" : "清除筛选"} →</Link>}>{q ? "换个说法，或调整频道内的筛选条件。" : "你可以查看本频道已收录的资料，或订阅 RSS 等待下一条精选。"}</EmptyState></div> : "cards" in result ? <Timeline initial={result} filters={result.filters} /> : <><DayList items={result.items} todayCount={null} showTags /><Pagination page={result.page} pageCount={result.pageCount} href={page => { const sp = new URLSearchParams(params); sp.set("page", String(page)); return `${base}?${sp}`; }} /></>}
  </div>;
}
