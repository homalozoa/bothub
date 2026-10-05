import catalog from "./topics.json";
import { readingDomain, type SiteDomainKey } from "./channels.ts";

// Reading metadata lives in the catalog. Stored article tags and legacy topic slugs stay valid.
export function topicsForDomain(domain: SiteDomainKey) {
  return catalog.topics.filter(t => t.group === "field" && !("aliasOf" in t)
    && "domains" in t && t.domains?.includes(readingDomain(domain)));
}

const shortcuts: Record<string, string[]> = {
  "ai-robotics": ["agent-tools", "vla", "human-interaction"],
  biology: ["animal-behavior", "learning-cognition", "natural-history"],
  sociology: ["family-care", "work-leisure", "community-culture"],
};
export function topicShortcuts(domain?: SiteDomainKey) {
  const slugs = domain ? shortcuts[readingDomain(domain)] ?? [] : ["human-interaction", "animal-behavior", "family-care"];
  return slugs.flatMap(slug => { const topic = catalog.topics.find(t => t.slug === slug); return topic ? [topic] : []; });
}

export const CONTENT_FORMS = ["论文/研究", "模型发布", "产品更新", "开源/仓库", "评测/基准", "教程/实践", "观点/分析", "现象/趋势"];
