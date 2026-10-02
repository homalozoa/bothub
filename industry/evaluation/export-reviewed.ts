// Offline conversion for the existing SelectBench evaluation script; no model calls.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

export interface CandidateRow {
  caseId: string;
  material: Record<string, unknown>;
  samplingContext: { benchmarkSplit: string; eventFamily: string; samplingStratum: string; [key: string]: unknown };
  annotation: Record<string, unknown>;
  gold: { decision: "select" | "reject" | "either" };
  [key: string]: unknown;
}
export interface HumanReview {
  caseId: string;
  annotator: string;
  confirmedAt: string;
  humanConfirmed: boolean;
  decision: "select" | "reject" | "either";
  bodyZh?: string;
  bodyOriginal?: string;
  reasonZh: string;
  eventFamily?: string;
  benchmarkSplit?: "development" | "holdout";
}
export function exportReviewed(candidates: CandidateRow[], reviews: HumanReview[]): CandidateRow[] {
  const index = new Map(candidates.map((c) => [c.caseId, c]));
  const seen = new Set<string>();
  const out: CandidateRow[] = [];
  for (const review of reviews) {
    if (seen.has(review.caseId)) throw new Error(`Duplicate review: ${review.caseId}`);
    seen.add(review.caseId);
    const candidate = index.get(review.caseId);
    if (!candidate) throw new Error(`Unknown case: ${review.caseId}`);
    if (!review.humanConfirmed || !review.annotator?.trim() || /codex|\bagent\b/i.test(review.annotator) || !Number.isFinite(Date.parse(review.confirmedAt))) {
      throw new Error(`Explicit human confirmation, reviewer name and review time are required: ${review.caseId}`);
    }
    if (!["select", "reject", "either"].includes(review.decision) || !review.reasonZh?.trim()) throw new Error(`Decision and reason are required: ${review.caseId}`);
    if (!review.bodyZh?.trim() && !review.bodyOriginal?.trim()) throw new Error(`Provide reviewed material, not the agent's title paraphrase: ${review.caseId}`);
    out.push({ ...candidate,
      material: { ...candidate.material, bodyZh: review.bodyZh?.trim() ?? null, bodyOriginal: review.bodyOriginal?.trim() ?? null },
      samplingContext: { ...candidate.samplingContext, eventFamily: review.eventFamily ?? candidate.samplingContext.eventFamily, benchmarkSplit: review.benchmarkSplit ?? candidate.samplingContext.benchmarkSplit },
      annotation: { annotator: review.annotator, confirmedAt: review.confirmedAt, status: "human_confirmed", reasonZh: review.reasonZh, materialScope: "reviewer supplied material" },
      gold: { decision: review.decision },
    });
  }
  const families = new Map<string, string>();
  for (const row of out) {
    const { eventFamily, benchmarkSplit } = row.samplingContext;
    if (!eventFamily.trim() || !["development", "holdout"].includes(benchmarkSplit)) throw new Error(`Event family and split required: ${row.caseId}`);
    const earlier = families.get(eventFamily);
    if (earlier && earlier !== benchmarkSplit) throw new Error(`Same event family crosses splits: ${eventFamily}`);
    families.set(eventFamily, benchmarkSplit);
  }
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { candidates: { type: "string", default: "industry/evaluation/candidates.jsonl" }, reviews: { type: "string" }, out: { type: "string", default: ".data/robotics-gold.jsonl" } } });
  if (!values.reviews) throw new Error("Pass --reviews .data/robotics-reviews.jsonl. Candidate suggestions are not human gold labels.");
  const read = <T>(file: string): T[] => readFileSync(file, "utf8").split("\n").filter((s) => s.trim()).map((s) => JSON.parse(s));
  const rows = exportReviewed(read<CandidateRow>(values.candidates!), read<HumanReview>(values.reviews));
  if (!rows.length) throw new Error("No confirmed reviews to export.");
  mkdirSync(path.dirname(values.out!), { recursive: true });
  writeFileSync(values.out!, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  console.log(`Exported ${rows.length} confirmed reviews to ${values.out}; no network requests or model calls.`);
}
