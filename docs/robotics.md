# 运行与维护

需要 Node.js 24.11+、PostgreSQL 16/17。本机配置存于 .env，不要提交。

## 启动

~~~bash
npm ci
node scripts/init-env.ts
createdb bothot
~~~

在 .env 设置 DATABASE_URL=postgres://localhost:5432/bothot、API_BASE_URL=http://localhost:3001；数据库用户名和端口按本机调整。已有 .env 不覆盖。

~~~bash
node --env-file=.env scripts/migrate.ts
node --env-file=.env scripts/seed.ts
npm run doctor -- --database
npm run build -w @aihot/web
~~~

三个终端分别启动：

~~~bash
node --env-file=.env apps/api/src/main.ts
node --env-file=.env apps/worker/src/main.ts
node --env-file=.env apps/web/server.ts
~~~

打开 [localhost:3000](http://localhost:3000)，后台 /admin 使用 .env 中的随机密码。开发热更新用 npm run dev:api、dev:worker、dev:web；生产禁止 DEV_AUTH_*。

采集、模型、飞书推送和 IndexNow 默认关闭。doctor 检查配置与数据库，不证明模型服务可用。真实处理需配置 LLM_BASE_URL、LLM_MODEL、LLM_API_KEY，确认授权与预算后，小范围开启采集和模型。阅读不调用模型；付费请求经过回执与预算熔断。

## 来源与纠错

来源先[验证](sources.md)，新增 ID 经 seed 幂等导入，已有后台配置不覆盖。修改、停采、纠错、撤回走后台鉴权、CSRF、版本检查和审计；停采不等于撤回。[当前领域](life-focus.md)

原文日期、首次收录和事件时间分别保留，旧闻重抓不变成新闻。日报默认 Asia/Shanghai 08:00、最多 3 条，上限 5 条；近 14 天同一事实不重复重点刊载，允许空刊。刊期可配置，数据库存 UTC。

撤回统一影响网页、RSS、API、MCP 和报告派生文字。浏览器缓存最长 5 分钟，第三方已下载副本无法远程删除。有限措辞矛盾检查不能替代事实核验；60/65/76 门槛未经当前领域人工校准。[评测方法](selection.md)

## 演示与检查

离线演示仅用空的 bothot_demo*_test / bothot_demo*_ci 库：先迁移，再运行 scripts/demo.ts，网页设置 SITE_DEMO=true。多频道演示加 MULTICHANNEL_DEMO=true，无需 worker。合成数据和本地模型响应只证明程序路径。

代码检查使用全新独立测试库，禁止生产库及真实付费服务：

~~~bash
npm run typecheck
DATABASE_URL=postgres://localhost:5432/bothot_ci node scripts/migrate.ts
DATABASE_URL=postgres://localhost:5432/bothot_ci npm test
npm run test:sources
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3000
~~~

库名须以 _test / _ci 结尾。备份恢复测试需 tar、兼容的 pg_dump/pg_restore 和 CREATEDB 权限；纯文档核对链接和展示即可。

联网检查须显式 --live，不调用模型、不写数据库；有限入库试跑只选 1–3 个 source ID，单独开启 COLLECT_ENABLED=true。正文、备份和敏感日志留在私有环境。[部署与恢复](deploy.md) · [首版验证](verification.md)
