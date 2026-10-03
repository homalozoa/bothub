// Explicit, free network check. Uses production parsers and guards; never writes to the database.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { Candidate, SourceRow } from "../packages/backend/src/sources/types.ts";

export interface SourceSpec extends Omit<SourceRow, "cursor" | "fail_count"> {
  site_fulltext: boolean;
  syndicate_fulltext: boolean;
  channel_hints?: string[];
  editorial?: { language: string; coverage: string[]; identity: string; homepage: string; limitations: string[] };
  robotics?: { language: string; coverage: string[]; identity: string; homepage: string; limitations: string[] };
}
export interface SampleCheck {
  title: string;
  url: string;
  publishedAt: string | null;
  bodyStatus: "feed" | "readability" | "missing";
  bodyChars: number;
  roboticsCue: boolean;
  relevanceBasis?: "material-text" | "robotics-project-url" | "none";
}
export function summarizeCheck(samples: SampleCheck[], total: number): string {
  if (total === 0) return "empty_feed";
  if (!samples.length || samples.every((s) => !s.publishedAt)) return "missing_or_bad_dates";
  if (!samples.some((s) => s.roboticsCue)) return "robotics_not_confirmed";
  if (!samples.some((s) => s.bodyStatus !== "missing" && s.publishedAt && s.roboticsCue)) return "body_unconfirmed";
  return "verified";
}
export function roboticsCue(text: string): boolean {
  return /robot|机器人|ロボット|ロボ|ROS\b|nav2|gazebo|mujoco|lerobot|manipulat|locomotion|embodied|simulat|actuator|servo|depthai|realsense|isaac|gripper|lidar|SLAM|sensor|physic|关节|机械臂|具身|传感器|仿真/i.test(text);
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const { values } = parseArgs({ args: argv, options: {
    live: { type: "boolean", default: false },
    sources: { type: "string", default: "industry/sources.json" },
    ids: { type: "string" }, limit: { type: "string", default: "25" },
    "delay-ms": { type: "string", default: "1000" },
    out: { type: "string", default: ".data/source-validation.json" },
    docs: { type: "string" },
  } });
  // Require the flag before loading backend code or doing any network/DNS work.
  if (!values.live) throw new Error("No network request made. Explicitly pass --live to validate public sources (free requests only).");
  const limit = Number(values.limit);
  const delayMs = Number(values["delay-ms"]);
  if (!Number.isInteger(limit) || limit < 1 || limit > 25 || !Number.isFinite(delayMs) || delayMs < 500) {
    throw new Error("Use --limit 1..25 and --delay-ms >= 500.");
  }
  for (const name of ["COLLECT_ENABLED", "MODEL_CALLS_ENABLED", "FEISHU_ENABLED", "FEISHU_INTERNAL_ENABLED", "FEISHU_READER_ENABLED", "INDEXNOW_SUBMIT_ENABLED", "ALLOW_PRIVATE_NETWORK_FETCH"]) {
    process.env[name] = "false";
  }
  // A deliberately free path: no Jina, X, WeChat, models, publication, or database calls.
  const [{ fetchRss }, { fetchJsonList }, { guardedFetch }, { readable }, { assertSupportedConfig }] = await Promise.all([
    import("../packages/backend/src/sources/rss.ts"), import("../packages/backend/src/sources/json-list.ts"),
    import("../packages/backend/src/lib/http-fetch.ts"), import("../packages/backend/src/content/extract.ts"),
    import("../packages/backend/src/sources/config-keys.ts"),
  ]);
  const specs = (JSON.parse(readFileSync(values.sources!, "utf8")) as { sources: SourceSpec[] }).sources;
  const ids = new Set(values.ids?.split(",").filter(Boolean) ?? []);
  const sources = specs.filter((s) => !ids.size || ids.has(s.id)).slice(0, limit);
  if (!sources.length) throw new Error("No sources selected.");
  const checks: Array<Record<string, any>> = [];
  let bodyFetches = 0;
  let collectorRuns = 0;
  const pause = () => new Promise((resolve) => setTimeout(resolve, delayMs));
  for (const source of sources) {
    const checkedAt = new Date().toISOString();
    const base = { sourceId: source.id, name: source.name, kind: source.kind, enabled: source.enabled, endpoint: source.config.feedUrl ?? source.config.url, ...source.robotics, ...source.editorial, channelHints: source.channel_hints ?? ["robotics"], checkedAt };
    try {
      assertSupportedConfig(source.kind, source.config);
      if (!['rss', 'json_list'].includes(source.kind)) throw new Error("Unsupported by this free checker; candidate remains unverified.");
      if (String(base.endpoint).includes("r.jina.ai")) throw new Error("Paid renderer is prohibited in this checker.");
      const row: SourceRow = { ...source, cursor: null, fail_count: 0 };
      collectorRuns += 1;
      const candidates: Candidate[] = source.kind === "rss" ? (await fetchRss(row, { force: true })).candidates : await fetchJsonList(row);
      // Check no more than three feed entries and fetch one missing body per source.
      const projectCue = (c: Candidate) => /github\.com\/(?:ros2\/ros2|ros-navigation\/navigation2|moveit\/moveit2|ros-controls\/ros2_control)\/releases\//.test(c.url);
      const hasCue = (c: Candidate) => roboticsCue([c.title, c.excerpt ?? "", c.bodyText ?? ""].join(" ")) || projectCue(c);
      const shortlist = [...candidates.filter(hasCue), ...candidates.filter((c) => !hasCue(c))].slice(0, 3);
      const samples: SampleCheck[] = [];
      let detailUsed = false;
      for (const candidate of shortlist) {
        let body = candidate.bodyText ?? "";
        let bodyStatus: SampleCheck["bodyStatus"] = body.length >= 200 ? "feed" : "missing";
        // Relevance uses original material. Repository releases may have numeric titles;
        // their robot-specific scope is documented in source identity, not invented by a model.
        if (bodyStatus === "missing" && !detailUsed && (!!source.editorial || roboticsCue(candidate.title + " " + (candidate.excerpt ?? "")) || /releases/.test(source.id))) {
          detailUsed = true;
          bodyFetches += 1;
          await pause();
          try {
            const response = await guardedFetch(candidate.url, { timeoutMs: 20_000, maxBytes: 6 * 1024 * 1024 });
            if (response.status === 200 && /html/.test(response.headers.get("content-type") ?? "")) {
              const extracted = readable(response.text(), response.url);
              if (extracted) { body = extracted.text; bodyStatus = "readability"; }
            }
          } catch { /* Missing bodies are an explicit status, never silently verified. */ }
        }
        samples.push({ title: candidate.title.slice(0, 250), url: candidate.url,
          publishedAt: candidate.publishedAt?.toISOString() ?? null, bodyStatus, bodyChars: body.length,
          roboticsCue: roboticsCue([candidate.title, candidate.excerpt ?? "", body].join(" ")) || projectCue(candidate),
          relevanceBasis: roboticsCue([candidate.title, candidate.excerpt ?? "", body].join(" ")) ? "material-text" : projectCue(candidate) ? "robotics-project-url" : "none" });
      }
      const status = source.editorial
        ? candidates.length === 0 ? "empty_feed" : samples.some(s => s.publishedAt && s.url && s.bodyStatus !== "missing") ? "verified" : "body_or_date_unconfirmed"
        : summarizeCheck(samples, candidates.length);
      checks.push({ ...base, validationScope: source.editorial ? "feed-url-date-readable-material; not editorial classification" : "robotics-material", status, itemCount: candidates.length, datedItems: candidates.filter((c) => c.publishedAt).length, samples });
      console.log(`${source.id}: ${status} (${candidates.length} parsed items)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      checks.push({ ...base, status: /HTTP/.test(message) ? "http_error" : /parse|RSS\/Atom|mapped|array/.test(message) ? "parse_error" : "fetch_error", error: message.slice(0, 300), samples: [] });
      console.log(`${source.id}: failed (${message.slice(0, 120)})`);
    }
    await pause();
  }
  const report = { checkedAt: new Date().toISOString(), method: "Production fetchRss/fetchJsonList, guardedFetch and readable; up to 3 candidates (legacy robotics checks prioritize robotics cues; editorial checks validate URL, source date and readable material), <=1 article fetch/source; no model or paid fallback", limits: { sources: sources.length, delayMs, feedTimeoutMs: 25000, bodyTimeoutMs: 20000, maxBodyBytes: 6 * 1024 * 1024 }, requests: { collectorRuns, bodyFetches, note: "Counts of parser runs and detail requests; SSRF-checked redirects can add HTTP requests." }, records: checks };
  const { mkdirSync } = await import("node:fs");
  mkdirSync(path.dirname(values.out!), { recursive: true });
  writeFileSync(values.out!, JSON.stringify(report, null, 2) + "\n");
  if (values.docs) writeFileSync(values.docs, renderDocs(report));
  console.log(`Report: ${values.out}; verified: ${checks.filter((c) => c.status === "verified").length}/${checks.length}`);
}

function renderDocs(report: { checkedAt: string; records: Array<Record<string, any>> }): string {
  const lines = ["# 机器人信源验证", "", `最近检查（UTC）：${report.checkedAt}。机器记录见 [source-validation.json](source-validation.json)，配置见 [sources.json](../industry/sources.json)。本表由同一次检查按配置元数据生成。`, "", "“verified”表示原采集器解析到了条目，并在最多三个样例（优先选择原材料包含机器人线索的条目）中找到同一条具有原文 URL、发布时间、可提取正文和机器人关联的材料。ROS 2、Nav2、MoveIt 2 和 ros2_control 的数字版本标题通过原始机器人项目 release URL 确认范围，relevanceBasis 字段区分该依据与正文关键词。它不代表逐条事实核验、独立复现或所有未来条目可用。全文只在检查内存中使用；报告只保留标题、URL、时间、字数和状态。", "", "| 名称 | 语言 / 方向 | 身份 / 启用 | 实际入口 | 结果 |", "|---|---|---|---|---|", ...report.records.map((r) => `| ${r.name} | ${r.language} / ${(r.coverage ?? []).join(", ")} | ${r.identity} / ${r.enabled ? "启用" : "禁用"} | [${r.kind}](${r.endpoint}) | ${r.status} |`), "", "## 样例与限制", "", ...report.records.flatMap((r) => [`### ${r.name}`, "", `检查：${r.checkedAt}；${r.status}。${r.error ?? `${r.itemCount} 个解析条目，${r.datedItems} 个有日期。`}`, "", ...(r.samples ?? []).map((s: SampleCheck) => `- [${s.title.replace(/\[/g, "(").replace(/\]/g, ")")}](${s.url})；原始日期 ${s.publishedAt ?? "未知"}；正文 ${s.bodyStatus}（${s.bodyChars} 字符）；机器人线索 ${s.roboticsCue ? "有" : "未确认"}。`), "", ...(r.limitations ?? []), ""]), "## 复验与维护", "", "显式网络检查（不会导入数据库，不会调用模型）：", "", "```bash", "node scripts/check-sources.ts --live --limit 25 --out .data/source-validation.json", "node scripts/check-sources.ts --live --ids rss-robot-report,rss-lerobot-releases --out .data/source-validation.json", "```", "", "每个信源最多一次 feed 和一次原文请求，顺序执行且至少间隔 500ms；默认间隔 1 秒，feed 25 秒、原文 20 秒超时，复用大小限制和逐跳 SSRF 检查。不传 --live 会在任何网络请求前报错。未检查的端点只列在 source-candidates.json，不能按已接入成果计算。", "", "修改 sources.json 的同一对象内 robotics 元数据后运行检查；如需更新仓库报告与本页，加 --out docs/source-validation.json --docs docs/sources-robotics.md。自动测试只读离线文件。", "", "后台既有信源设置由 seed 保留；新增 ID 可幂等导入。当前机器配置的 enabled 字段与本报告一起复查；配置更新后重新生成报告。旧 AI 示范源由管理员明确停用，不能清空数据库。", "", "X / 微信当前不启用。X 使用 x_search 与 SOCIALDATA_API_KEY，微信公众号使用 mp_account 与 DAJIALA_KEY（docs/sources.md）；先取得服务与预算授权再接入，不绕过登录或访问控制。", "", "研究源不等于同行评审，GitHub release 不等于完整开源，厂商自报不等于独立验证。媒体转载、共同通稿需按实际事件归组。纯 AI、代码工具和普通汽车内容需要原材料中明确的机器人关联才能入选。", ""];
  return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
