// Seeds a fresh site from the industry pack: the topics (industry/topics.json, updated in place), the
// demo sources (industry/sources.json, only the ones not there yet, so admin edits are never undone) and,
// with the leaderboard on, its model directory (only models and names not there yet).
// Re-runnable:  node --env-file=.env scripts/seed.ts   (--topics-only: just the topics, as the tests use)
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { FEATURES } from "@aihot/industry/features";
import { REPO_ROOT } from "@aihot/backend/config";
import { closeDb } from "@aihot/backend/db";
import { importModelDirectory } from "@aihot/backend/leaderboard/directory";
import { seedTopics } from "@aihot/backend/publication/topics";
import { disableObsoleteSources, seedSources, type SeedSource } from "@aihot/backend/sources/seed";

const { values } = parseArgs({ options: { "topics-only": { type: "boolean" }, "disable-obsolete": { type: "string" } } });
if (values["topics-only"] && values["disable-obsolete"] !== undefined) throw new Error("--topics-only cannot be combined with --disable-obsolete");

console.log(`topics: ${await seedTopics()}`);
if (values["topics-only"]) {
  await closeDb();
  process.exit(0);
}

const { sources } = JSON.parse(readFileSync(path.join(REPO_ROOT, "industry/sources.json"), "utf8")) as { sources: SeedSource[] };
const added = await seedSources(sources);
console.log(`sources: ${added} added, ${sources.length - added} already there`);
if (values["disable-obsolete"] !== undefined) console.log(`obsolete sources: ${await disableObsoleteSources(values["disable-obsolete"].split(","), sources.map((source) => source.id))} disabled`);
if (FEATURES.leaderboard) {
  const { models, aliases } = await importModelDirectory();
  console.log(`leaderboard directory: ${models} models, ${aliases} names added`);
}
await closeDb();
