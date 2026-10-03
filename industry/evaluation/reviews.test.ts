import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { exportReviewed, type CandidateRow, type HumanReview } from "./export-reviewed.ts";
const rows: CandidateRow[] = readFileSync(new URL("./candidates.jsonl", import.meta.url), "utf8").trim().split("\n").map((s) => JSON.parse(s));
const review = (row: CandidateRow, changes: Partial<HumanReview> = {}): HumanReview => ({ caseId: row.caseId, annotator: "test reviewer", confirmedAt: "2026-10-02T00:00:00Z", humanConfirmed: true, decision: "either", bodyZh: "离线测试用复核材料，不是真实人工标注。", reasonZh: "离线测试", ...changes });
test("real candidate corpus is explicitly agent-proposed, with source links and no decisive gold", () => {
  assert.equal(rows.length, 42);
  assert.equal(new Set(rows.map((r) => r.caseId)).size, rows.length);
  const families = new Map<string, string>();
  for (const row of rows) {
    assert.equal(row.annotation.status, "pending_human_confirmation");
    assert.equal(row.gold.decision, "either");
    assert.ok(/^https?:\/\//.test(String(row.material.originalUrl)));
    const split = families.get(row.samplingContext.eventFamily);
    if (split) assert.equal(split, row.samplingContext.benchmarkSplit);
    families.set(row.samplingContext.eventFamily, row.samplingContext.benchmarkSplit);
  }
});
test("provisional agent labels cannot silently become human gold", () => {
  assert.throws(() => exportReviewed(rows, [review(rows[0]!, { humanConfirmed: false })]), /human confirmation/);
  assert.throws(() => exportReviewed(rows, [review(rows[0]!, { annotator: "Codex agent" })]), /human confirmation/);
  assert.throws(() => exportReviewed(rows, [review(rows[0]!, { bodyZh: undefined })]), /reviewed material/);
  const out = exportReviewed(rows, [review(rows[0]!, { decision: "reject" })]);
  assert.equal(out[0]?.gold.decision, "reject");
  assert.equal(out[0]?.material.bodyZh, "离线测试用复核材料，不是真实人工标注。");
});
test("an event family cannot cross development and holdout after review", () => {
  assert.throws(() => exportReviewed(rows, [review(rows[0]!, { eventFamily: "same-event", benchmarkSplit: "development" }), review(rows[1]!, { eventFamily: "same-event", benchmarkSplit: "holdout" })]), /crosses splits/);
  assert.throws(() => exportReviewed(rows, [review(rows[0]!), review(rows[0]!)]), /Duplicate review/);
});

test("seven-domain candidate index preserves provenance and explicitly unconfirmed channel suggestions", () => {
  const channels: CandidateRow[] = readFileSync(new URL("./channel-candidates.jsonl", import.meta.url), "utf8").trim().split("\n").map(s=>JSON.parse(s));
  assert.equal(channels.length,18);
  for (const row of channels) {
    assert.equal(row.annotation.status,"pending_human_confirmation");assert.equal(row.gold.decision,"either");
    assert.equal(row.material.bodyOriginal,null);assert.ok(String(row.material.originalUrl).startsWith("https://"));
  }
});
