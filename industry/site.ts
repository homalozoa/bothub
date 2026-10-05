// 站点身份和读者看得到的文案。换成你的行业时，先改这个文件。
// 网页和后端都读它；改完重新构建（docker compose up --build）即可生效。
// 域名不在这里：部署时用环境变量 SITE_URL 设置。

export const SITE = {
  /** 站名：导航、页面标题、分享图、RSS、MCP、后台都用它。 */
  name: "ZooRadar",
  englishName: "ZooRadar",
  /**
   * 行业词：拼进默认说法里，比如“AI 日报”“AI 动态”。
   * 改成“法律”“HR”“黄金”之类，页面上就会变成“法律日报”“法律动态”。
   */
  subject: "资讯",
  /** 首页的完整标题（浏览器标签、搜索结果）。 */
  homeTitle: "ZooRadar · 智能、动物与演化的新进展",
  /** 一句话介绍：搜索引擎、分享卡片、RSS、llms.txt 会用。 */
  description: "追踪 AI 与机器人、动物与人类研究的新进展。沿着原始来源阅读，用中文摘要连接智能、动物与演化。",
  /** 首页左上角和侧边栏下面的一行小字。 */
  tagline: "追踪智能、动物与演化",
  /** 界面语言（HTML lang、og:locale）。 */
  locale: "zh-CN",
  /** 默认域名，只在没设置 SITE_URL 时使用。 */
  defaultUrl: "http://localhost:3000",
  /**
   * MCP 工具名的前缀（小写字母、数字、下划线），工具会叫 bothot_get_latest、bothot_search……
   * 已经有人接入后就不要再改。
   */
  mcpPrefix: "bothot",
  /** 对外联系邮箱（选填）：使用规则、llms.txt、响应头里会写。 */
  contactEmail: "homalozoax@gmail.com" as string | null,
  /** 页脚的一行小字（选填）。 */
  footerNote: "自动筛选与生成摘要 · 请以原文为准",
  /** 中国大陆网站的 ICP 备案号（选填），填了就显示在页脚并链接到工信部备案系统。 */
  icp: null as string | null,
  /** 结构化数据里的网站运营者（搜索引擎用）。 */
  organization: {
    name: "Homalozoa",
    type: "Person",
    url: "https://github.com/homalozoa",
    /** 创始人（选填）：{ name, url, description }。 */
    founder: null as null | { name: string; url?: string; description?: string },
  },
  /** 抓取信源时报上的名字（User-Agent 里用），不要冒用别的站。 */
  crawlerName: "BothotBot",
} as const;

/** 关于页的文案。数字（信源数、收录数、精选数、日报期数）来自站内实时统计，不用写在这里。 */
export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  /** 大标题：第一行正常颜色，第二行强调色。 */
  headline: ["世界总有新的发现，", "先看事实，再看意义。"] as [string, string],
  /** 标题下面的一段话。{sources} 会换成实时的信源数。 */
  lead: `${SITE.name} 从 {sources} 个已配置信源发现智能、生命、自然与社会的新进展，用模型筛选和生成中文摘要，将同一发生的报道归组。精选关注信息价值，热点反映传播讨论；两次模型评分不等于独立事实核验。公开阅读无需注册。`,
  /** 信源河动画下面的四个环节。 */
  steps: {
    collect: "默认优先非简体中文的公开官方新闻、研究与开源项目和专业媒体，优先一手原始材料；站内继续提供中文摘要。新增来源先检查语言、出处、日期和正文。",
    store: "保留原文链接和原始日期，同一次发布的转载归组。后续代码、权重、价格变化和独立复现作为新进展，旧闻重抓不会变成新发布。",
    select: "按频道研究问题评价事实、证据和低热度早期信号。厂商声明、仿真结果和真机证据分别表达，不把自动筛选称为人工审核。",
    publish: "网站、RSS、公开 API 和 MCP 读取同一批已发布内容。既有机器人日报通常重点讲 2–3 条，最多 5 条；信息不足允许空刊。默认刊期为 Asia/Shanghai 每日 08:00，可由运营者配置。",
  },
  /**
   * 作者块（选填），null 就不显示。
   * avatarSourceId：一个 X 账号信源的 id，头像取它的（选填）。
   * 二维码在后台“设置”里上传，或者放进 industry/brand/contact/；没有二维码就不显示那张卡片。
   */
  maker: {
    name: "Homalozoa",
    url: "https://github.com/homalozoa",
    greeting: ["ZooRadar 由我以个人身份维护，持续整理智能、生命与社会领域值得跟进的进展。", "默认优先非简体中文的原始来源，用中文摘要连接原文；来源中的声明和实际验证条件分别表达。"],
  } as null | {
    name: string;
    greeting: string[];
    url?: string;
    avatarSourceId?: string | null;
    wechat?: { title: string; note: string };
    feishu?: { title: string; note: string };
  },
  /** 页面底部的版权与下架说明（结尾会接“反馈页”的链接）。 */
  copyright: `${SITE.name} 是聚合摘要和阅读索引，原文版权归各来源所有。如果你是来源方，希望更正、下架或调整展示方式，可以通过`,
} as const;

/** “AI 日报”这类说法：行业词和名词之间，英文词加空格，中文词不加。 */
export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}

/** “按主题看 AI”“往期 AI 日报”这类说法：行业词接在中文后面，英文词前加空格，中文词不加；noun 照 withSubject 接上。 */
export function subjectAfter(text: string, noun?: string): string {
  const gap = /^[A-Za-z0-9]/.test(SITE.subject) ? " " : "";
  return `${text}${gap}${noun ? withSubject(noun) : SITE.subject}`;
}

/** Branded publication names, separate from the subject used in content categories. */
export function withBrand(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.name) ? `${SITE.name} ${noun}` : `${SITE.name}${noun}`;
}
