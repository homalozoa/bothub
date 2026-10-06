import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { main, summarizeCheck, type SampleCheck } from "../../scripts/check-sources.ts";
import { unsupportedConfig } from "../../packages/backend/src/sources/config-keys.ts";

const sample = (changes: Partial<SampleCheck> = {}): SampleCheck => ({ title: "Robot SDK release", url: "https://example.org/release", publishedAt: "2026-09-22T01:00:00Z", bodyStatus: "feed", bodyChars: 400, roboticsCue: true, ...changes });
test("HTTP success and an empty feed do not count as source validation", () => {
  assert.equal(summarizeCheck([], 0), "empty_feed");
  assert.equal(summarizeCheck([sample({ bodyStatus: "missing", bodyChars: 0 })], 10), "body_unconfirmed");
});
test("a verified source needs date, body and robotics relevance on the same actual item", () => {
  assert.equal(summarizeCheck([sample({ publishedAt: null }), sample({ bodyStatus: "missing" })], 2), "body_unconfirmed");
  assert.equal(summarizeCheck([sample({ publishedAt: null })], 1), "missing_or_bad_dates");
  assert.equal(summarizeCheck([sample({ roboticsCue: false })], 1), "robotics_not_confirmed");
  assert.equal(summarizeCheck([sample()], 1), "verified");
});
test("network checks require explicit opt-in before importing collectors", async () => {
  await assert.rejects(main([]), /No network request made/);
  await assert.rejects(main(["--live", "--limit", "26"]), /limit 1\.\.25/);
  await assert.rejects(main(["--live", "--delay-ms", "0"]), /delay-ms/);
});
test("enabled source configuration and generated verification metadata agree", () => {
  const sources = JSON.parse(readFileSync(new URL("../sources.json", import.meta.url), "utf8")).sources;
  const records = [...JSON.parse(readFileSync(new URL("../../docs/source-validation.json", import.meta.url), "utf8")).records, ...JSON.parse(readFileSync(new URL("../../docs/channel-source-validation.json", import.meta.url), "utf8")).records, ...JSON.parse(readFileSync(new URL("../../docs/life-source-validation.json", import.meta.url), "utf8")).records, ...JSON.parse(readFileSync(new URL("../../docs/briefing-source-validation.json", import.meta.url), "utf8")).records];
  assert.ok(sources.length >= 15);
  assert.equal(new Set(sources.map((s: any) => s.id)).size, sources.length);
  for (const source of sources) {
    assert.deepEqual(unsupportedConfig(source.kind, source.config), []);
    if (!source.enabled) continue;
    const record = records.find((r: any) => r.sourceId === source.id);
    assert.equal(record?.status, "verified", source.id);
    assert.equal(record?.endpoint, source.config.feedUrl ?? source.config.url);
    for (const key of ["language", "coverage", "identity", "homepage", "limitations"]) assert.deepEqual(record[key], (source.editorial ?? source.robotics)[key]);
    assert.equal(source.enabled, true);
    assert.equal(source.site_fulltext, false);
    assert.equal(source.syndicate_fulltext, false);
  }
});
