# 可选模块

模型榜与 Codex 重置监控在 industry/features.ts 均关闭，导航、定时任务和公开接口相应停用。以下为已有模块的配置说明。

| 模块 | 入口与配置 |
|---|---|
| 模型榜 | /leaderboard、/leaderboard/rules、/leaderboard/sources；共识方法 v15 |
| 重置监控 | /codex-reset、/api/v1/codex-resets；需 SOCIALDATA_API_KEY 与模型路由 |

模型榜每 6 小时检查，来源失败沿用上次快照，证据变化才发布；Artificial Analysis 缺 key 时不参与，其份额不转给其他来源。可选 GITHUB_TOKEN 提高只读配额。

型号、别名与价格在 database/seeds/；开放权重精确对应位于 leaderboard/model-weights.json，不代表无条件商用。厂商/权重筛选保留原榜名次，从完整排名筛选后取前 30。方法变化同步规则页与既有方法版本。

~~~bash
node --env-file=.env scripts/lb-round.ts --fetch
node --env-file=.env scripts/lb-fetch-check.ts
node --env-file=.env scripts/import-leaderboard-prices.ts
~~~

监控读原帖，模型仅识别、状态由代码决定，不确定记录留后台复核。常规 5 分钟、预告/故障 3 分钟检查，每天回看 48 小时；通知仅在已授权配置后发送。启用可选服务前沿用回执、预算和权限要求。
