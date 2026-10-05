# 给 Agent 的说明

这是基于 AIHOT 的 ZooRadar 三个阅读频道网站（内部 bothot）：AI与机器人、生物学、社会学，加综合共四个入口。采集信源、用模型筛选和写作、归组事件、出日报，并通过网站、RSS、公开 API 和 MCP 对外提供。先读 README 和 `docs/multichannel.md`，旧机器人运行说明保留在 `docs/robotics.md`，再按任务读对应文档。

## 最常见的任务：改成另一个行业

按 `docs/customize.md` 的顺序做。行业相关的一切都在 `industry/`：站名文案（`site.ts`）、分类标签（`taxonomy.ts`）、主题（`topics.json`）、示范信源（`sources.json`）、提示词（`prompts/`）、门槛（`selection.ts`）、模块开关（`features.ts`）、品牌（`brand/`）、条款页（`pages/`）。通常不需要改 `apps/` 和 `packages/`。

当前授权的品牌为 ZooRadar，OpenZoo 保留品牌主页；三个阅读频道及四个内部分类与窗口见 industry/channels.ts。自然史并入生物学，人机交互、游戏与角色是保留的主题；历史key和订阅只用于兼容，模型输出限四个主频道。channel=news/x/firstParty 仍表示来源方式，不改成领域。科学与社会频道不要求机器人/AI 关联。既有机器人 RSS、API/MCP 默认查询和日报不能静默扩大范围；当前域名 news.openzoo.ai 沿用。

2026-10-05，用户因机器人/AI内容高度重合，授权阅读入口合并为AI与机器人。DISPLAY_DOMAINS定义三个阅读入口，DOMAINS/ACTIVE_DOMAIN_KEYS保留四个内部分类，既有文章和订阅不重写。ai-robotics是只读并集（SiteDomainKey），不是新的模型输出/人工主分类；页面按事件归组去重。旧机器人和AI网页入口308至合并页，旧API/RSS语义保留，机器人日报不扩大。Agent、人机交互、游戏等继续按主题或内容形态阅读。

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
- 小步可回溯迭代，提交使用 Conventional Commits。默认不新增 hash、冻结 contract、baseline 或 gate；保留既有认证、数据安全及发布措施。
- 额外离线源/样本检查：`npm run test:sources`。候选样本由 Agent 暂标，未经人工确认不得报准确率。

## 写代码

匹配周围代码的写法、命名和注释密度。选能清楚解决问题的简单方案，只定义正在使用的抽象。验证改动涉及的重要行为，不为简单的样式改动写测试。
