// Editorial domains are independent of source channels (news / X / first-party), categories and tags.
export const DOMAINS = [
  { key: "robotics", label: "机器人", english: "Robotics", description: "从硬件、控制与学习，到走进现场的机器人。", guide: "机器人系统、研究、开源、控制导航、交付与使用。区分演示、真机实验和连续运行；不让融资或重复演示占满频道。" },
  { key: "agents", label: "Agent 与工程", english: "Agents & Engineering", description: "让智能真正完成任务的工具、方法与工程。", guide: "Personal Agent、长任务、工具调用、权限、记忆、编程、测试、评测与硬件调试。实际任务、失败恢复、可靠性和成本优先，不机械收录所有模型发布。" },
  { key: "interaction", label: "人机交互", english: "Human Interaction", description: "技术如何被理解、被信任，又如何改变体验。", guide: "界面、信任、依赖、自主权、拟人化、共同活动、长期使用和认知。说明研究设计、样本、持续时间、退出者和测量；喜欢、使用和生活改善分别表达。" },
  { key: "play", label: "游戏与角色", english: "Play & Characters", description: "游戏机制、虚拟生命与值得反复相遇的角色。", guide: "游戏设计、虚拟生命、养成、互动玩具、角色行为、玩家创造和开发复盘。区分开发者自述、玩家个案和独立数据；排除娱乐八卦与常规发行榜。" },
  { key: "biology", label: "生物学", english: "Biology", description: "学习、感觉、行为与生命系统的运行方式。", guide: "动物行为认知、学习、感觉、适应、植物、微生物与生态机制。按发现本身评价，保留对象、样本、方法、替代解释和一般化范围；不要求机器人或商业关联，排除泛临床、药物与保健。" },
  { key: "natural-history", label: "自然史", english: "Natural History", description: "沿着物种、标本与时间，读懂自然的来路。", guide: "古生物、演化史、分类、生物多样性、生物地理、标本、博物馆和田野。说明地层、测年、分类和系统发育依据及争议，不填补未知；以历史和分布问题为主，机制行为研究通常归生物学。" },
  { key: "sociology", label: "社会学", english: "Sociology", description: "家庭、工作、照护与人与人之间的日常生活。", guide: "家庭、独居、工作、休闲、照护、社区、消费、规范、仪式和生活实践。说明地区、调查或田野时间、样本、方法和解释范围；定性研究不因小样本降质，排除刻板印象、无证据趋势和泛时政热搜。" },
] as const;
export type DomainKey = (typeof DOMAINS)[number]["key"];
export const DOMAIN_KEYS = DOMAINS.map(d => d.key) as [DomainKey, ...DomainKey[]];
export const DOMAIN_LABELS = Object.fromEntries(DOMAINS.map(d => [d.key, d.label])) as Record<DomainKey, string>;
export function isDomainKey(value: unknown): value is DomainKey {
  return typeof value === "string" && DOMAIN_KEYS.includes(value as DomainKey);
}
export function domainInfo(key: DomainKey) { return DOMAINS.find(d => d.key === key)!; }
export function relatedDomains(primary: DomainKey | null, values: unknown): DomainKey[] {
  return Array.isArray(values) ? [...new Set(values.filter(isDomainKey))].filter(d => d !== primary).slice(0, 2) : [];
}
