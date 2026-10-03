# ZooRadar · OpenZoo

ZooRadar 是 OpenZoo 的四主频道资讯阅读站：机器人、AI 与 Agent、生物学、社会学。综合加四频道共五个领域入口；自然史、人机交互、游戏与角色通过主题聚合。真实来源共用采集、中文摘要、事件归组与发布链路，读者无需注册。

外观默认跟随系统亮暗模式，系统切换后即时更新；桌面侧栏和手机「更多 → 外观」可手动选择深色、浅色或跟随系统，偏好仅保存在浏览器。

线上入口：[OpenZoo](https://openzoo.ai/) · [资讯站](https://news.openzoo.ai/)。五个领域入口已正式上线，网页与静态主页版本 `d94fc07`、API/worker版本 `d2803dd`；全站桌面/手机细节见 [排版复查](docs/layout-audit.md)，亮暗色模式见 [外观更新](docs/system-theme.md)，综合精选的展示修正见 [修复记录](docs/selected-feed-fix.md)，四频道组织见 [四频道记录](docs/four-domain-consolidation.md)。迁移、兼容、信源和开发验证见 [多频道说明](docs/multichannel.md)。后台继续仅通过 SSH 隧道访问。

基于 [KKKKhazix/AIHOT](https://github.com/KKKKhazix/AIHOT)，保留 MIT [LICENSE](LICENSE)、[NOTICE](NOTICE) 及必要署名。内部包名与公开 MCP 前缀 bothot 保持兼容。

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

- 四个主频道与类别、内容形态、主题和来源方式独立。科学与社会材料不要求机器人或 AI 关联。类别 key、既有链接和机器人原订阅保留。
- 精选看信息增量与决策价值，热点看事件传播讨论。模型分数是编辑排序依据，双次评分不等于两个独立来源核验。
- [20 个启用来源、9 个未接入候选与1个按偏好停用来源](docs/sources-robotics.md)，配置在 `industry/sources.json`；公开短摘要和原文链接，默认不展示全文或抓取图片。
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

资讯站名为 ZooRadar，标记为折页 Z；由 [Homalozoa](https://github.com/homalozoa) 个人维护，邮箱 [homalozoax@gmail.com](mailto:homalozoax@gmail.com)；隐私与使用规则的保存期限等内容仍待完善。资讯域名 `news.openzoo.ai` 已部署。当前待办见 [清单](docs/launch-todos.md)，名称/icon候选见 [方案](docs/brand-exploration/README.md)。`industry/pages/` 为未生效草稿。模型排行榜及 Codex 重置监控已关闭。内部包名与既有安全、回执、预算、授权和迁移体系沿用上游。
