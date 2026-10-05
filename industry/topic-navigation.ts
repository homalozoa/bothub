import catalog from "./topics.json";
import { readingDomain, type SiteDomainKey } from "./channels.ts";

export function hiddenTopic(slug: string | null) {
  const topic = catalog.topics.find(t => t.slug === slug);
  return !!topic && "hidden" in topic && !!topic.hidden;
}

// Reading metadata lives in the catalog. Stored article tags and legacy topic slugs stay valid.
export function topicsForDomain(domain: SiteDomainKey) {
  return catalog.topics.filter(t => t.group === "field" && !("aliasOf" in t) && !("hidden" in t && t.hidden)
    && "domains" in t && t.domains?.includes(readingDomain(domain)));
}

export const CHANNEL_SUBTOPICS: Record<string, string[]> = {
  "ai-robotics": ["ai-models", "agent-tools", "embodied-learning", "robot-systems", "motion-manipulation", "perception-navigation", "human-interaction", "engineering-assets"],
  biology: ["zoology", "animal-behavior", "learning-cognition", "anthropology", "paleontology", "animal-ecology", "natural-history"],
};
export function subtopicsForDomain(domain?: SiteDomainKey | "all") {
  const slugs = domain && domain !== "all" ? CHANNEL_SUBTOPICS[readingDomain(domain)] ?? [] : [];
  return slugs.flatMap(slug => { const topic = catalog.topics.find(t => t.slug === slug); return topic ? [topic] : []; });
}
const shortcuts: Record<string, string[]> = {
  "ai-robotics": ["agent-tools", "human-interaction", "embodied-learning"],
  biology: ["animal-behavior", "anthropology", "paleontology"],
};
export function topicShortcuts(domain?: SiteDomainKey) {
  const slugs = domain ? shortcuts[readingDomain(domain)] ?? [] : ["human-interaction", "animal-behavior", "paleontology"];
  return slugs.flatMap(slug => { const topic = catalog.topics.find(t => t.slug === slug); return topic ? [topic] : []; });
}

export const CONTENT_FORMS = ["论文/研究", "模型发布", "产品更新", "开源/仓库", "评测/基准", "教程/实践", "观点/分析", "现象/趋势"];
export function contentFormsForDomain(domain?: SiteDomainKey | "all") {
  return domain === "biology" ? ["论文/研究", "观点/分析", "现象/趋势"] : CONTENT_FORMS;
}
