import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/channels";
import { loadOr404 } from "../lib/api.server";
import { pageMeta } from "../lib/seo";
import { ChannelGrid, DomainNav, TopicLinks, type ChannelOverview } from "../features/channels/Channels";
export async function loader({ request }: Route.LoaderArgs) { return loadOr404<ChannelOverview>("/api/site/channels", { signal: request.signal }); }
export function meta() { return pageMeta({ title: "三个频道", description: "从机器人与 Agent，到生命、自然与日常生活，沿着三个频道继续阅读。", path: "/channels" }); }
export function headers() { return { "Cache-Control": "public, max-age=60, s-maxage=60" }; }
export default function Channels() {
  const data = useLoaderData<typeof loader>();
  return <div className="radar-page"><DomainNav /><header className="directory-header"><p className="radar-eyebrow">THREE WAYS TO FOLLOW YOUR CURIOSITY</p><h1>沿着好奇心，<br />选一个方向<span className="title-dot">.</span></h1><p>智能、生命与社会。每个领域，都有值得认真读的进展。</p></header><ChannelGrid channels={data.channels} /><TopicLinks /><div className="subscription-banner"><div><strong>想一次看见更多？</strong><p>综合订阅汇集三个频道，机器人原订阅继续保留。</p></div><a href="/feed/channels/all.xml">订阅综合精选 ↗</a><Link to="/all">浏览全部动态 ↗</Link></div></div>;
}
