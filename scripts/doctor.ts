// Configuration diagnostics; never print secrets or call a model/collector.
import { config, credential } from "@aihot/backend/config";
import { REPORT_SCHEDULE } from "@aihot/backend/reports/calendar";

let failed = false;
function check(label: string, ok: boolean, detail: string) {
  console.log(`${ok ? "✓" : "✗"} ${label}: ${detail}`);
  if (!ok) failed = true;
}
check("Node.js", Number(process.versions.node.split(".")[0]) >= 24, process.versions.node);
check("站点地址", /^https?:\/\//.test(config.siteUrl), config.siteUrl);
check("管理员", !!config.adminPassword && config.adminPassword.length >= 12 || !!credential("auth", "FEISHU_LOGIN_APP_ID"), "至少12位密码或飞书登录配置");
for (const key of ["SESSION_SECRET", "IMG_PROXY_SIGN_SECRET"]) check(key, !!credential("auth", key), credential("auth", key) ? "已设置（不显示值）" : "未设置");
console.log(`刊期: ${REPORT_SCHEDULE.timeZone} ${REPORT_SCHEDULE.dailyTime}，最多${REPORT_SCHEDULE.maxItems}条`);
console.log(`采集: ${process.env.COLLECT_ENABLED === "false" ? "关闭" : "开启"}；模型: ${config.modelCallsEnabled ? "开启" : "关闭"}`);
if (config.modelCallsEnabled) {
  check("默认模型接口", !!credential("models", "LLM_API_KEY") && !!process.env.LLM_BASE_URL && !!process.env.LLM_MODEL, "LLM_API_KEY、LLM_BASE_URL、LLM_MODEL；单步骤路由请在后台确认");
} else console.log("模型关闭：网站仍可读取已生成内容；新资料不会完成模型筛选。启用前确认服务和预算。");
if (process.argv.includes("--database")) {
  const { sql, closeDb } = await import("@aihot/backend/db");
  try {
    await sql`SELECT 1`;
    check("数据库", true, "可连接");
    const [row] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM schema_migrations`;
    check("迁移", !!row?.count, `${row?.count ?? 0}项已应用`);
  } catch (error) {
    check("数据库", false, error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, "[数据库地址]") : "连接失败");
  } finally { await closeDb(); }
}
process.exitCode = failed ? 1 : 0;
