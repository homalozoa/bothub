# 架构

~~~mermaid
flowchart LR
  S[原始信源] --> W[worker：采集、筛选、摘要、归组]
  W --> D[(数据库)]
  D --> P[统一公开读取层 publication]
  P --> A[API、RSS、MCP、报刊]
  A --> R[web：HTTP 阅读]
~~~

| 位置 | 职责 |
|---|---|
| apps/api/ | Fastify：公开接口与受认证保护的后台 |
| apps/worker/ | pg-boss：采集、模型、报刊及维护任务 |
| apps/web/ | React Router：只通过 HTTP 读 API |
| packages/backend/ | 来源、内容、编辑、事件、发布、报告、服务、通知、运维与后台 |
| packages/contracts/ | 共享接口类型 |
| industry/ | 站点身份、分类、信源、提示词与品牌 |
| database/migrations/ | 向后兼容的增量迁移 |

- 公开出口使用 publication/，统一可见性、时效、撤回、发布时刻与全文许可。
- 阅读不调模型，付费调用经过回执与预算。已完成回执复用；结果不明超 30 分钟放行一次，再失败由管理员核对。
- 密钥、数据库和模型只在后端；公开内容匿名，后台保留认证、CSRF、版本检查与审计。
- 原日期不被重抓刷新；开发关闭采集、模型和外部推送，迁移只增量追加。
- 后台调用业务模块，业务模块不依赖后台。人工修改、公开投影与恢复记录一起提交；跨进程载荷使用共享类型。

公开入口：/、/all、/hot、/topics、/daily、/weekly、/monthly、RSS、/api/v1/、/api/mcp、/llms.txt、/sitemap.xml。管理入口仅经 SSH；领域见[当前范围](life-focus.md)。

模块边界由 tests/architecture.test.ts 检查。[运行](robotics.md) · [定制](customize.md)
