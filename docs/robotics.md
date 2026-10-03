# bothot 运行与维护

## 首版边界

站名为“机闻”，位置 `industry/site.ts`；域名使用 `SITE_URL`，MCP 前缀 `bothot`、分类 key `hardware/research/industry` 和主题 slug 保持稳定。名称与折页 Z 标记已确认；运营主体和联系渠道尚未补齐，条款与隐私为待确认草稿。资讯域名已为 `news.openzoo.ai`，当前运营待办见 [清单](launch-todos.md)。普通 AI 内容只有原材料明确涉及机器人时才入选。

上游采用 `3343fe2b20db4be7269113752d82d3992fc52b6b`，本仓库初始提交 `d367cf5` 文件树与它一致。复用采集器、双次评分、事件关系、publication、后台、RSS/API/MCP、预算回执和 SelectBench。必要代码修改仅涉及可配置刊期、日报容量/空刊/14天去重、原始日期、撤回报告派生文字、旧分类假设与明确证据矛盾回退。没有新模型服务、数据库结构或额外模型调用。

## 本机启动

需要 Node24.11+ 和 PostgreSQL16/17。macOS 同时装多个 Node 时先确认 `node --version`；本次本机使用 `/opt/homebrew/opt/node@24/bin`。本次独立数据库服务器位于 `.data/postgres`、绑定127.0.0.1:55432，没有启用系统开机服务；此路径只是本次本机环境，不是服务器部署约定。

```bash
npm ci
node scripts/init-env.ts
createdb bothot
```

在新生成的 `.env` 设置连接；已有 `.env` 不覆盖。下面是普通本机 PostgreSQL 示例，用户名/端口按实际调整：

```dotenv
DATABASE_URL=postgres://你的用户名@127.0.0.1:5432/bothot
API_BASE_URL=http://127.0.0.1:3001
SITE_URL=http://localhost:3000
COLLECT_ENABLED=false
MODEL_CALLS_ENABLED=false
FEISHU_CONTENT_PUSH_ENABLED=false
FEISHU_INTERNAL_ENABLED=false
INDEXNOW_SUBMIT_ENABLED=false
REPORT_TIMEZONE=Asia/Shanghai
REPORT_DAILY_TIME=08:00
REPORT_DAILY_MAX_ITEMS=3
```

```bash
node --env-file=.env scripts/migrate.ts
node --env-file=.env scripts/seed.ts
npm run doctor -- --database
npm run build -w @aihot/web
```

三个终端分别执行：

```bash
node --env-file=.env apps/api/src/main.ts
node --env-file=.env apps/worker/src/main.ts
node --env-file=.env apps/web/server.ts
```

开发热更新用 `npm run dev:api`、`npm run dev:worker`、`npm run dev:web`。正常后台使用 `.env` 中随机管理员密码；生产禁止 DEV_AUTH_* 免登录。本地进程 Ctrl-C 正常停机；worker 会等待在途回执，保留 Docker 的210秒停机宽限。密钥只由后端使用，读页面不调用模型。

健康检查 `curl http://localhost:3000/api/health`，完整启动检查 `node scripts/smoke.ts --base http://localhost:3000`。后台运行页查看采集、模型、队列与任务失败；`doctor` 只诊断配置与可选数据库连接，不能证明模型服务能用。

## 独立离线演示

使用空的独立数据库，名称必须以 `bothot_demo` 开头、`_test`或`_ci`结尾。禁止生产环境。没有外部模型调用，固定本地响应仅证明程序路径可运行。

```bash
createdb bothot_demo_test
DATABASE_URL=postgres://你的用户名@127.0.0.1:5432/bothot_demo_test node scripts/migrate.ts
DATABASE_URL=postgres://你的用户名@127.0.0.1:5432/bothot_demo_test node scripts/demo.ts
```

API终端：

```bash
DATABASE_URL=postgres://你的用户名@127.0.0.1:5432/bothot_demo_test SITE_URL=http://localhost:3100 API_PORT=3101 node --env-file=.env apps/api/src/main.ts
```

网页终端：

```bash
SITE_DEMO=true SITE_URL=http://localhost:3100 API_BASE_URL=http://127.0.0.1:3101 WEB_PORT=3100 node --env-file=.env apps/web/server.ts
```

无需启动worker。打开3100；所有示例标题/来源有合成标记，全站有演示横幅。使用真实RSS解析、本地模型桩、原处理与发布层，展示代码发布→后续权重开放两个fact同一story、硬件条目及日报；演示日报覆盖下一次截稿窗口，显示的未来刊期也是演示。重跑保留同一URL与模型回执，不新增发布条目。

## 真实来源与有限试跑

信源配置和验证报告见 [sources-robotics.md](sources-robotics.md)，报告仅记录标题/URL/日期/字数，正文不入Git。真实网络检查必须显式运行：

```bash
node scripts/check-sources.ts --live --ids rss-robot-report,rss-lerobot-releases --out .data/source-validation.json
```

先在独立试跑库迁移、seed，模型与推送保持关闭。有限真实入库最多指定3个源：

```bash
COLLECT_ENABLED=true MODEL_CALLS_ENABLED=false node --env-file=.env scripts/collect.ts rss-robot-report rss-lerobot-releases
```

以上只说明解析/入库/排队，不能说明中文筛选或日报质量。首次导入及过期材料按上游回灌/历史规则处理；不改日期让它们进入当天热点。缺少模型key的任务会显示禁用/失败，不吞异常。

完整真实链路需在 `.env` 设置用户选择的 OpenAI兼容 `LLM_BASE_URL`、`LLM_MODEL`、`LLM_API_KEY`，可通过已有单步骤模型路由调整，向量服务仍可选。先确认服务授权及每分钟/小时/天预算，再设置 `MODEL_CALLS_ENABLED=true`，小范围运行worker；之后按来源质量和预算启用 `COLLECT_ENABLED=true`。付费Jina/X/微信仍可选且默认不用。没有可靠模型单价时费用未知，后台显示请求、token、缓存及错误；本次没有消费模型余额。

## 来源维护与编辑

新增源在 `industry/sources.json` 同一对象维护机器配置和 `robotics`身份/语言/方向/限制；先用检查脚本验证实际条目，失败的进入 `source-candidates.json` 而非启用列表。随后seed只插入新ID，保持管理员已有参数。修改同ID配置后需要在后台信源页明确编辑，seed不会覆盖已有配置。删除配置不会清空数据库或自动删除来源。

从旧AI示范站升级时先查看后台，确认哪些旧源应停用，再运行 `node --env-file=.env scripts/seed.ts --disable-obsolete rss-openai-news,rss-google-deepmind`；只对后台实际存在的旧ID执行。该步骤只停用明确列出的旧ID，保留自建源和历史材料。日后停用其他源在后台操作。来源参与模式与撤回是两件事，停采不自动删除已经发布的内容。

日报0–3条默认、最多5条；没有新精选生成空刊而不是凑数。近14天已刊相同fact不会重复重点刊载，同项目新权重/价格/独立复现可成为新fact。导语提供近14天已刊上下文，并对完全相同的导语回退到本期事实；语义相似的工程启示仍需编辑评测，未宣称完全自动解决。刊期时区决定截稿窗口，数据库存UTC；前台普通时间目前明确标UTC+08:00，不推断访客所在地。

原始发布时间、首次收录与事件发生日期保持区分，未知日期不补齐。结构化fact已有occurredAt，事件详情保留进展与来源。关键限制通过摘要/推荐理由表达，非统一可信度分数。新增明确矛盾检查仅拦截有显式仿真限定却无真实测试支持、部分资产发布却宣称完整开源的有限措辞；检测标题、摘要、理由与引用材料，失败保留诊断并等待处理，不再调模型修复。它不是通用事实核验器，混合版本、复杂否定及未知条件仍依靠来源材料与人工复核。

后台内容详情进行标题、摘要、归组、来源权限纠错或撤回；保留审计与人工覆盖。发布统一通过publication，RSS/API/MCP与网页遵守相同撤回规则；已刊报告在引用项撤回时停止显示依赖它的派生导语/主题文字，不调用模型。默认浏览器缓存最长5分钟，已经下载到第三方客户端的历史副本无法远程删除。不得改SQL让撤回内容重新公开。

## 校准与测试

原阈值60/65/76未校准，不凭感觉调。42条真实候选都是Agent建议、gold=either，人工先打开原文补充材料、核对事件家族和开发/留出划分，再使用现有SelectBench。详见 [evaluation/README](../industry/evaluation/README.md)，只有 `human_confirmed` 的资料才能导出用于评测。合成gold示例仅用于程序回归。

```bash
npm run typecheck
# 全新空库，名称必须以_test或_ci结尾，先执行迁移。
DATABASE_URL=postgres://127.0.0.1:5432/bothot_ci node scripts/migrate.ts
DATABASE_URL=postgres://127.0.0.1:5432/bothot_ci npm test
npm run test:sources
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3000
```

测试只用本地HTTP桩；上游模型测试允许调用本地桩来验证回执，但不配置真实provider密钥。重复全套DB测试用新的空_test/_ci库，避免有意保留的上游fixture影响候选容量；不要对生产运行破坏性测试。Docker构建/HTTPS/对象存储备份与恢复见 [deploy.md](deploy.md)，本次没有Docker环境或云部署授权，因此只验证本机流程。备份同时保存数据库dump及对应文件包，恢复到空库后恢复附件；`.env`、数据库、原文全文和敏感日志不进Git。
