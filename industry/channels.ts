// Editorial domains are independent of source channels (news / X / first-party), categories and tags.
export const DOMAINS = [
  { key: "robotics", label: "机器人", english: "Robotics", description: "从硬件、控制与学习，到走进现场的机器人。", guide: "机器人系统、研究、开源、控制导航、交付与使用。区分演示、真机实验和连续运行；不让融资或重复演示占满频道。" },
  { key: "agents", label: "AI 与 Agent", english: "AI & Agents", description: "模型、智能体与应用方法，关注能力、证据和真实变化。", guide: "基础与多模态模型、能力评测、训练与推理方法、开源模型和数据、AI工具与应用、Personal Agent、长任务、工具权限、记忆、编程测试和可靠性。重要模型与研究不要求机器人或Agent关联，排除没有实质增量的榜单和发布营销。工程作为主题。" },
  { key: "biology", label: "生物学", english: "Biology", description: "从学习、行为与生态，到物种、标本与演化。", guide: "动物行为认知、学习、感觉、适应、植物、微生物、生态、古生物、演化史、分类、多样性、生物地理、标本、博物馆与田野。按发现本身评价；自然史作为主题，保留地层、测年、分类和争议，不要求AI或商业关联，排除泛临床、药物与保健。" },
  { key: "sociology", label: "社会学", english: "Sociology", description: "家庭、工作、照护与人与人之间的日常生活。", guide: "家庭、独居、工作、休闲、照护、社区、消费、规范、仪式和生活实践，包括技术使用、玩家社群和角色关系的社会研究。说明地区、调查或田野时间、样本、方法和解释范围；定性研究不因小样本降质，排除刻板印象、无证据趋势和泛时政热搜。" },
] as const;
export const RETIRED_DOMAINS = [
  { key: "interaction", label: "人机交互", english: "Human Interaction", description: "人与技术的交互、信任和使用体验。", guide: "历史主题范围" },
  { key: "play", label: "游戏与角色", english: "Play & Characters", description: "玩家社群、角色关系与互动机制。", guide: "历史主题范围" },
  { key: "natural-history", label: "自然史", english: "Natural History", description: "物种、标本、演化历史与田野发现。", guide: "并入生物学的主题范围" },
] as const;
// Existing public parameters, source hints and historical records keep their valid keys.
export const ALL_DOMAINS = [...DOMAINS, ...RETIRED_DOMAINS] as const;
export type ActiveDomainKey = (typeof DOMAINS)[number]["key"];
export type DomainKey = (typeof ALL_DOMAINS)[number]["key"];
export const ACTIVE_DOMAIN_KEYS = DOMAINS.map(d => d.key) as [ActiveDomainKey, ...ActiveDomainKey[]];
export const DOMAIN_KEYS = ALL_DOMAINS.map(d => d.key) as [DomainKey, ...DomainKey[]];
export const DOMAIN_LABELS = Object.fromEntries(ALL_DOMAINS.map(d => [d.key, d.label])) as Record<DomainKey, string>;
export const RETAINED_TOPICS = [
  { domain: "natural-history", slug: "natural-history", name: "自然史", tag: "自然史", tags: ["自然史", "演化历史", "系统分类", "标本/田野"], parents: ["biology"] },
  { domain: "interaction", slug: "human-interaction", name: "人机交互", tag: "人机交互", tags: ["人机交互", "交互/信任", "自主权"], parents: ["robotics", "agents", "sociology"] },
  { domain: "play", slug: "games-and-characters", name: "游戏与角色", tag: "游戏与角色", tags: ["游戏与角色", "虚拟生命", "游戏设计", "玩家社群", "角色关系"], parents: ["agents", "biology", "sociology"] },
] as const;
export function isDomainKey(value: unknown): value is DomainKey { return typeof value === "string" && DOMAIN_KEYS.includes(value as DomainKey); }
export function isActiveDomain(value: unknown): value is ActiveDomainKey { return typeof value === "string" && ACTIVE_DOMAIN_KEYS.includes(value as ActiveDomainKey); }
export function domainInfo(key: DomainKey) { return ALL_DOMAINS.find(d => d.key === key)!; }
export function retainedTopic(key: string) { return RETAINED_TOPICS.find(t => t.domain === key || t.slug === key); }
export function domainPath(key: DomainKey) { const topic = retainedTopic(key); return topic ? `/topics/${topic.slug}` : `/channels/${key}`; }
export function canonicalDomain(key: DomainKey): DomainKey { return key === "natural-history" ? "biology" : key; }
export function relatedDomains(primary: DomainKey | null, values: unknown): DomainKey[] {
  return Array.isArray(values) ? [...new Set(values.filter(isDomainKey))].filter(d => d !== primary).slice(0, 2) : [];
}
/** Virtual topic tags preserve old records without changing dates, scores, manual decisions or event identity. */
export function editorialTags(tags: string[], primary?: DomainKey | null, related: DomainKey[] = []): string[] {
  const inferred = [primary, ...related].flatMap(key => { const topic = key ? retainedTopic(key) : null; return topic ? [topic.tag] : []; });
  return [...new Set([...tags, ...inferred])];
}
/** Discovery and current-news windows, initial editorial configuration rather than measured quality thresholds. */
export const DOMAIN_WINDOWS: Record<DomainKey, { discoveryDays: number; newsDays: number }> = {
  robotics: { discoveryDays: 2, newsDays: 7 }, agents: { discoveryDays: 2, newsDays: 7 },
  interaction: { discoveryDays: 7, newsDays: 30 }, play: { discoveryDays: 7, newsDays: 30 },
  biology: { discoveryDays: 7, newsDays: 30 }, "natural-history": { discoveryDays: 14, newsDays: 60 }, sociology: { discoveryDays: 14, newsDays: 60 },
};
