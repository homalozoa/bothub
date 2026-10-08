# ZooRadar · OpenZoo

![机器人、鸟与研究笔记连接智能和生命世界](docs/illustrations/overview.jpg)

追踪 AI 与机器人、动物与人类研究的新进展，用中文摘要连接原始来源。

[资讯站](https://news.openzoo.ai/) · [OpenZoo](https://openzoo.ai/) · [内容范围](docs/life-focus.md)

| 整理资讯 | 阅读与接入 |
|---|---|
| ![原始材料经过筛选、摘要与事件归组的示意](docs/illustrations/editorial-flow.jpg) | ![网页、报刊、RSS、API与MCP共享发布内容的示意](docs/illustrations/reading-outlets.jpg) |
| 采集 → 筛选 → 中文摘要 → 事件归组 | 网页 · 日报 · RSS · API · MCP |

公开阅读无需注册；自动摘要请以原文为准，编辑质量仍待人工校准。

## 运行

需要 Node.js **24.11+**、PostgreSQL 16/17，或 Docker Compose。

~~~bash
npm ci
node scripts/init-env.ts
# 在 .env 配置数据库与 API 地址。
node --env-file=.env scripts/migrate.ts
node --env-file=.env scripts/seed.ts
npm run build -w @aihot/web
~~~

按[运行说明](docs/robotics.md)启动 API、worker 和网页。开发默认关闭采集、模型与推送；生产后台仅通过 SSH 隧道访问。

## 文档

[运行与检查](docs/robotics.md) · [部署与备份](docs/deploy.md) · [信源](docs/sources.md) · [人工评测](docs/selection.md) · [架构](docs/architecture.md) · [定制](docs/customize.md) · [待办](docs/launch-todos.md)

由 [Homalozoa](https://github.com/homalozoa) 维护。基于 [AIHOT](https://github.com/KKKKhazix/AIHOT)，保留 [MIT LICENSE](LICENSE) 和 [NOTICE](NOTICE)；内部包名与 MCP 前缀 bothot 保持兼容。
