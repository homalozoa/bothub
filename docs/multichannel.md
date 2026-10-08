# 七频道改造（历史）

2026-10-03 从机器人站扩展为七频道；当前入口与规则见[内容范围](life-focus.md)。保留 OpenZoo、折页 Z、域名、原机器人订阅及 SSH 后台。

迁移 0042 增加 primary_channel/related_channels，不重写历史分类；来源方式、类别、标签与领域分开。预筛和结构化共用原调用，所有出口继续经 publication。新 RSS/API 可显式选领域，默认机器人范围与文章 ID 保留。

本机 603 后端、39 前端、9 来源检查，共 651 项通过，类型/两站构建和 smoke 36/36 通过；后续订阅回归 17 项、关联频道回归 28 项通过。34 源幂等 seed 第二次新增 0，14 个新入口验证见[机器记录](channel-source-validation.json)。

PLOS 原文回放保留日期和 URL，使用 5 次本地固定响应、外部模型 0 次，只证明程序路径；生产真实处理另见[部署记录](zooradar-deployment.md)。候选 18 项为 Agent 暂标、gold=either，不证明分类准确率。

历史回填使用 scripts/backfill-channels.ts：默认 dry-run，显式 --apply，回滚用原输出文件；事务、审计与版本冲突保护人工修改，不改日期或事件 ID，私有回滚文件不提交 Git。

[本地生物学](screenshots/zooradar-after-biology-mobile.jpg) · [本地概览](screenshots/zooradar-after-radar-desktop.jpg) · [当前运维](server-deployment.md)
