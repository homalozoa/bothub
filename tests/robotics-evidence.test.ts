import "./setup.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { evidenceContradictions } from "@aihot/backend/editorial/evidence";
import { finalizeCopy } from "@aihot/backend/editorial/writing";
import { normalizeAnalysis, type AnalysisRun } from "@aihot/backend/editorial/analyze";

test("explicit simulation-only evidence cannot turn into robot validation or a selected publication", () => {
  const copy = finalizeCopy({ sourceKind: "rss", title: "Robot policy", text: "This is simulation-only. No real-robot tests have been run." }, { titleZh: "机器人策略", summaryZh: "策略已完成真机验证。表现稳定。" });
  assert.equal(copy.summaryZh, "");
  assert.equal(copy.evidenceGuard?.outcome, "review");
  const run = { prefilter: { label: "PASS" }, scores: { values: [90, 90], threshold: 60 }, writing: { kind: "understand", titleZh: copy.titleZh, summaryZh: copy.summaryZh, tags: [], evidenceGuard: copy.evidenceGuard }, structure: null } as unknown as AnalysisRun;
  assert.deepEqual([normalizeAnalysis(run).relevance, normalizeAnalysis(run).selected], ["unknown", false]);
});

test("code-only release cannot become complete open source", () => {
  assert.ok(evidenceContradictions("The release is code-only; weights are not released.", "该模型已完全开源，包含全部资产。"));
  assert.ok(evidenceContradictions("仅发布代码，权重尚未开放。", "项目完整开源。"));
});

test("limitations and actual real tests or full assets remain usable", () => {
  assert.equal(evidenceContradictions("simulation-only; weights are not released", "仅在仿真测试，尚未完成真机验证。不能称为完整开源。"), null);
  assert.equal(evidenceContradictions("We tested the policy on real robots and released code, weights, and data.", "策略已完成真机验证。项目完整开源。"), null);
});

test("a contradiction after a long summary is checked before compaction", () => {
  const copy = finalizeCopy({ sourceKind: "rss", title: "Code release", text: "code-only" }, { titleZh: "代码发布", summaryZh: "介绍项目的代码发布与使用条件。".repeat(20) + "模型完整开源。" });
  assert.equal(copy.summaryZh, "");
  assert.ok(copy.evidenceGuard);
});

test("an unrelated limitation does not hide a positive unsupported claim", () => {
  assert.ok(evidenceContradictions("simulation-only", "策略已完成真机验证，但未公开权重。"));
  assert.ok(evidenceContradictions("code-only", "模型已完全开源，但未进行现场部署。"));
  assert.ok(evidenceContradictions("evaluated only in simulation", "策略已在真机上验证。"));
});

test("quoted source limitations are part of the evidence", () => {
  const copy = finalizeCopy({ sourceKind: "x_search", title: "Great result", text: "Great result", quotedText: "simulation-only" }, { titleZh: "策略更新", summaryZh: "策略已完成真机验证。" });
  assert.equal(copy.evidenceGuard?.outcome, "review");
});

test("evidence in a later release is not discarded because of an earlier restriction", () => {
  assert.equal(evidenceContradictions("Previous work was simulation-only. We now validated this policy on real robots.", "新策略已完成真机验证。"), null);
  assert.equal(evidenceContradictions("Version 1 was code-only. Version 2 releases all code, weights, data and hardware files under Apache-2.0.", "版本2模型已完全开源。"), null);
});

test("an unsupported claim in the recommendation also withholds the summary", () => {
  const copy = finalizeCopy({ sourceKind: "rss", title: "Simulation", text: "simulation-only" }, { titleZh: "仿真策略", summaryZh: "策略仅有仿真测试。", reasonZh: "已完成真机验证，便于直接部署。" });
  assert.equal(copy.summaryZh, "");
  assert.equal(copy.evidenceGuard?.outcome, "review");
});
