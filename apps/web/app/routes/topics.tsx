import { DISPLAY_DOMAINS, retainedTopic } from "@aihot/industry/channels";
import { topicsForDomain } from "@aihot/industry/topic-navigation";
import { data as withHeaders, Link, useLoaderData } from "react-router";
import { subjectAfter, withSubject } from "@aihot/industry/site";
import catalog from "@aihot/industry/topics.json";
import type { Route } from "./+types/topics";
import { apiGet, releaseBoundCache } from "../lib/api.server";
import { pageMeta } from "../lib/seo";

interface TopicSummary {
  slug: string;
  name: string;
  group: "company" | "field" | "genre";
  definition: string;
  total: number;
  recent: number;
  indexable: boolean;
  latestAt: string | null;
}

export async function loader({ request }: { request: Request }) {
  const upstream = new Headers();
  const data = await apiGet<{ topics: TopicSummary[]; refreshAt: string | null }>("/api/site/topics", { signal: request.signal, responseHeaders: upstream });
  const sections = [
    ...DISPLAY_DOMAINS.map(d => ({ key: d.key, name: d.label, blurb: d.description, slugs: topicsForDomain(d.key).map(t => t.slug) })),
    ...catalog.groups.filter(g => g.key !== "field").map(g => ({ ...g, slugs: catalog.topics.filter(t => t.group === g.key).map(t => t.slug) })),
  ];
  return withHeaders({ ...data, sections }, { headers: releaseBoundCache(data.refreshAt, 300, Date.now(), upstream) });
}

export function meta({ loaderData }: Route.MetaArgs) {
  const description = loaderData
    ? `${subjectAfter("按 AI 与机器人、生物学、社会学组织的", "主题页")}，也可按内容形态、公司与机构阅读。`
    : withSubject("主题页");
  return pageMeta({ title: "主题", description, path: "/topics", image: "/og/pages/topics.png" });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export default function TopicsPage() {
  const { topics, sections } = useLoaderData<typeof loader>();
  return (
    <div className="pb-10">
      <header className="pb-2 pt-5 lg:pt-1">
        <h1 className="text-[24px] font-semibold leading-[1.3] text-ink">{subjectAfter("按主题看")}</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
          先选研究方向，再按内容形态或机构继续阅读。跨领域主题可出现在多个方向；每个主题都能查看全部资料与入选记录。
        </p>
        <nav aria-label="主题分组" className="mt-4 flex flex-wrap gap-2">{sections.map(s => <a className="chip" key={s.key} href={`#topics-${s.key}`}>{s.name}</a>)}</nav>
      </header>
      {sections.map((g) => (
        <section key={g.key} aria-labelledby={`topics-heading-${g.key}`} className="scroll-mt-20 pt-8" id={`topics-${g.key}`}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h2 id={`topics-heading-${g.key}`} className="text-[15px] font-bold text-ink">
              {g.name}
            </h2>
            <p className="text-[12px] text-ink-4">{g.blurb}</p>
          </div>
          <ul className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topics
              .filter((t) => g.slugs.includes(t.slug))
              .map((t) => (
                <li key={t.slug}>
                  <Link
                    to={`/topics/${t.slug}?view=all`}
                    prefetch="intent"
                    aria-label={`查看${t.name}相关文章`}
                    className="card card-hover group flex h-full flex-col px-5 py-[18px]"
                  >
                    <span className="text-[15px] font-bold text-ink transition-colors group-hover:text-accent">{t.name}</span>
                    <span className="mt-1.5 line-clamp-2 flex-1 text-[12.5px] leading-[1.7] text-ink-3">{t.definition}</span>
                    <span className="mono mt-3 text-[11.5px] text-accent">
                      {t.total > 0 && `${t.total} 条${retainedTopic(t.slug) ? "资料" : "入选记录"} · `}全部资料 <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
