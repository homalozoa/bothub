# 机器人热点 · bothot

为机器人创业者、研发负责人和工程师聚合机器人与相关 AI 动态：真实来源采集、中文摘要、事件归组、精选、热点、主题检索与每日简报。默认中文，沿用 AIHOT 的阅读布局与后台，不要求读者注册。

线上入口：[OpenZoo主页](https://openzoo.ai/) · [机器人热点](https://news.openzoo.ai/)。生产内容尚在初始化，后台仅通过SSH隧道访问；见[服务器运维说明](docs/server-deployment.md)。

基于 [KKKKhazix/AIHOT](https://github.com/KKKKhazix/AIHOT) 模板实现。采用的上游提交是 `3343fe2b20db4be7269113752d82d3992fc52b6b`，bothot 初始提交 `d367cf5` 与该提交文件树一致。保留 MIT [LICENSE](LICENSE)、[NOTICE](NOTICE) 与必要署名；本站不代表上游官方。

## 运行

需要 Node.js **24.11+** 与 PostgreSQL 16/17，或 Docker Compose。完整操作见 [运行说明](docs/robotics.md)。

```bash
npm ci
node scripts/init-env.ts
# 编辑 .env：本机加 DATABASE_URL 与 API_BASE_URL；默认采集/模型/推送关闭。
node --env-file=.env scripts/migrate.ts
node --env-file=.env scripts/seed.ts
npm run doctor -- --database
npm run build -w @aihot/web
```

分别启动三个进程：

```bash
node --env-file=.env apps/api/src/main.ts
node --env-file=.env apps/worker/src/main.ts
node --env-file=.env apps/web/server.ts
```

网站默认 [localhost:3000](http://localhost:3000)，后台 `/admin`。管理员密码保存在本机 `.env`。Docker 使用 `docker compose up -d --build`，不会自动启用采集与付费服务。

缺少模型密钥时，网站可以读取已有发布内容，新资料不完成模型筛选。可用独立 `bothot_demo_test` 库运行 `scripts/demo.ts`，配合 `SITE_DEMO=true` 启动演示；详见运行说明。合成演示不得当作真实运营结果。

## 编辑与来源

- 三个主方向：硬件与系统工程、机器人研究与开源、产品与商业化。伙伴/娱乐机器人独立重点标签；普通 AI、汽车或消费电子必须在原材料中有具体机器人关联。
- 精选看信息增量与决策价值，热点看事件传播讨论。模型分数是编辑排序依据，双次评分不等于两个独立来源核验。
- [20 个验证来源与 9 个禁用候选](docs/sources-robotics.md)，配置在 `industry/sources.json`；公开短摘要和原文链接，默认不展示全文或抓取图片。
- 日报默认 Asia/Shanghai 08:00，通常最多 3 条、配置上限 5 条；允许空刊，核对近 14 天已刊事实。数据库时间使用 UTC，刊期时区可配置。
- [42 条真实候选与人工复核方法](industry/evaluation/README.md)。当前标签由 Agent 暂拟，全为待人工确认；原门槛保持 60/65/76，机器人领域尚未校准。

## 验证

```bash
npm run typecheck
# 使用全新独立 *_test / *_ci 数据库，先运行迁移。
DATABASE_URL=postgres://127.0.0.1:5432/bothot_ci npm test
npm run test:sources
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3000
# 显式联网，不调用模型、不写数据库：
node scripts/check-sources.ts --live --out .data/source-validation.json
```

首版开发验证见 [验收记录](docs/verification.md)。后续已完成 [生产部署](docs/server-deployment.md)，真实采集、模型处理和公开发布已运行；机器人领域准确率、召回率与门槛仍待人工校准，运营费用还需与服务商账单对账。

## 文档

[运行与纠错](docs/robotics.md) · [信源验证](docs/sources-robotics.md) · [精选校准](docs/selection.md) · [事件归组](docs/grouping.md) · [部署与备份](docs/deploy.md) · [架构](docs/architecture.md)

正式站名与图标、运营者、联系渠道、隐私与条款待确认；资讯域名 `news.openzoo.ai` 已部署。当前待办见 [清单](docs/launch-todos.md)，名称/icon候选见 [方案](docs/brand-exploration/README.md)。`industry/pages/` 为未生效草稿。模型排行榜及 Codex 重置监控已关闭。内部包名与既有安全、回执、预算、授权和迁移体系沿用上游。
