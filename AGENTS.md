# 给 Agent 的说明

仓库为homalozoa/bothub，网站为基于AIHOT的ZooRadar（既有MCP与部署名称bothot保持兼容）：综合、AI与机器人、生物学三个入口。生物学侧重动物学、动物行为、人类学、古生物学、动物生态与演化。采集、模型筛选、中文摘要、事件归组、日报和公开出口共用原链路。先读README，历史改造记录见docs/multichannel.md，当前范围见docs/life-focus.md。

## 最常见的任务：改成另一个行业

按 `docs/customize.md` 的顺序做。行业相关的一切都在 `industry/`：站名文案（`site.ts`）、分类标签（`taxonomy.ts`）、主题（`topics.json`）、示范信源（`sources.json`）、提示词（`prompts/`）、门槛（`selection.ts`）、模块开关（`features.ts`）、品牌（`brand/`）、条款页（`pages/`）。通常不需要改 `apps/` 和 `packages/`。

当前品牌ZooRadar，OpenZoo保留主页。DISPLAY_DOMAINS有两个阅读频道，ACTIVE_DOMAIN_KEYS有robotics/agents/biology三个内部分类。sociology/play仅保留历史key、记录和显式机器接口兼容，已退出导航、综合、阅读频道与热点，不新增模型输出。人机交互留在AI与机器人，游戏角色和泛社会学来源停采。科学材料不要求AI关联；动物、人类学、古生物范围按研究问题和证据判断。既有机器人RSS、API/MCP默认查询和日报不能静默扩大范围。

当前频道小分类与各领域内容形态见industry/topic-navigation.ts；来源配置及免费联网验证见docs/life-source-validation.json。新源仅验证成功后启用；已有来源变更须使用scripts/apply-life-focus-sources.ts的dry-run/apply及后台版本检查，不覆盖无关设置。历史文章不批量改日期、评分或主分类。

改评分标准时保留原有结构（内容类型、五个维度加权、噪声压制、安全边界），替换的是“什么算重要”“什么算噪声”的例子。门槛要用使用者标注的样本重新校准（`docs/selection.md`），不要凭感觉改数字。

## 运行与检查

- Node.js 24 直接运行 TypeScript，后端没有构建步骤。npm workspaces：`apps/*`、`packages/*`、`industry`。
- 本机运行和 Docker 见 `docs/deploy.md`。
- 改完至少跑：
  ```bash
  npm run typecheck
  DATABASE_URL=postgres://127.0.0.1:5432/<名字>_test npm test   # 空库，名字必须以 _test 或 _ci 结尾，先 node scripts/migrate.ts
  npm run build -w @aihot/web && node --test apps/web/tests/*.test.ts
  node scripts/smoke.ts --base http://localhost:3000             # 站点跑起来以后
  ```
- `tests/` 里部分测试用的是示例行业的分类、标签和公司，改了 `industry/taxonomy.ts` 后把这些例子换成新行业的对应项。

## 要守住的规则

- 前端（`apps/web`）只通过 HTTP 读 `apps/api`，数据库、模型调用和密钥只在后端。
- 所有公开出口都从 `packages/backend/src/publication/` 这一个读取层读，新增公开出口也一样。
- 读者打开页面不触发模型调用；模型只在 worker 的任务里调用。
- 付费请求都经过回执（`providers/receipts.ts`）和预算熔断，不要绕开。
- 开发和测试时保持安全阀关闭：`COLLECT_ENABLED`、`MODEL_CALLS_ENABLED`、`FEISHU_*_ENABLED`、`INDEXNOW_SUBMIT_ENABLED`。测试不访问任何外部服务。
- 信源默认只展示摘要和原文链接（`site_fulltext` 关）；只有来源明确允许时才打开全文。
- 公开内容匿名，管理员和访客看到的一样；后台只允许管理员。
- 数据库迁移只做向后兼容的增量，新迁移按编号加在 `database/migrations/` 末尾。
- 不要提交 `.env`、密钥和 `.data/`。
- 不要使用 AIHOT 的名字和 Logo。
- 本机 `.env` 默认关闭采集、模型、推送。真实来源验证单独运行 `check-sources.ts --live`；有限入库试跑需要显式 `COLLECT_ENABLED=true` 和1–3个source ID。付费模型须获服务和预算授权。
- 演示只写独立 `bothot_demo*_test` / `bothot_demo*_ci` 数据库，通过 `SITE_DEMO=true` 显示合成数据标记；不能作为真实编辑质量证据。
- 小步可回溯迭代，提交使用 Conventional Commits、本地 Git 配置与 GPG 签名，提交后核验签名。默认不新增 hash、冻结 contract、baseline 或 gate；保留既有认证、数据安全及发布措施。
- 额外离线源/样本检查：`npm run test:sources`。候选样本由 Agent 暂标，未经人工确认不得报准确率。

## 写代码

匹配周围代码的写法、命名和注释密度。选能清楚解决问题的简单方案，只定义正在使用的抽象。验证改动涉及的重要行为，不为简单的样式改动写测试。
