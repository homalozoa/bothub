# 机器人候选评测材料

`candidates.jsonl` 有 **42 条真实候选**，均有原始 URL、原标题及来源身份：18 个已接入信源的样例 36 条，另补 6 条公开原文用于仿真/真机、伙伴机器人、历史重抓和项目后续进展边界。初始划分 development 28 条、holdout 14 条；同一项目的 release 系列、同一期/系列的近重复和 Reachy Mini 的原始发布/本地链路进展保持同一 split。`eventFamily` 是普通人工分组字段，后续可修改，不能替代阅读材料后的事件核对。

标注者是 **Codex agent**，状态全部为 `pending_human_confirmation`。`annotation.suggestedDecision` 和理由是待复核建议，`gold.decision` 全部为 `either`，避免把自标样本冒充人工金标准。没有跑付费模型，没有有效人工标注，没有已验证的机器人精选准确率、召回率或费用。

这些是候选材料索引，主体材料是 Agent 按真实标题/来源元数据写的短释义；补充材料来自公开原文或论文摘要的短释义。它们不是完整文章，正文验证报告只说明每源至少一个样例的抽取结果，并不证明已逐条读完全部 42 条。复核者需要打开原 URL，补充足以支持判断的材料，分清仿真/真机、厂商自报/独立证据、代码/权重/数据/硬件文件/许可证，再确认标签。低热度资产候选没有量化讨论量，不能据此声称已测得传播热度。样本偏重工程 release 和英语材料，伙伴/娱乐产品、中文一手来源、长期真机部署、独立反证与真实商业口径仍不足。

旧材料保留原始日期、未知日期保持未知。GitHub 软件不同版本是后续进展候选，而同版本不同构建不预设为不同事件。这里的 `suggestedDecision` 判断价值有不确定性；归档/当天可刊状态应独立检查，不能把“旧”当成没有研究价值。人工复核时还需检查跨来源的同一事实，调整 `eventFamily`；导出脚本会拒绝同一 family 跨 split。

复核后在 `.data/robotics-reviews.jsonl` 写每行一条，不把抓取全文或私人材料提交 Git。例如：

```json
{"caseId":"robotics-001","annotator":"填写复核人姓名","confirmedAt":"填写实际 ISO UTC 时间","humanConfirmed":true,"decision":"either","bodyZh":"填写自己阅读原文后确认的材料，保留实验条件和限制","reasonZh":"填写入选或排除理由","eventFamily":"原始事件或近重复归组","benchmarkSplit":"development"}
```

导出到上游兼容格式，过程离线、不调用模型：

```bash
node industry/evaluation/export-reviewed.ts --reviews .data/robotics-reviews.jsonl --out .data/robotics-gold.jsonl
```

没有人工确认、时间、理由或复核材料时会明确报错。脚本依赖复核人诚实声明，不提供身份认证，不是独立事实核验。`bodyZh`/`bodyOriginal` 由复核者提供，候选中的 Agent 短释义不会自动进入人工 gold。

在模型服务、路由与预算已获授权并开启 `MODEL_CALLS_ENABLED` 后，复用上游评测和 SelectBench：

```bash
node --env-file=.env scripts/eval-selection.ts --gold .data/robotics-gold.jsonl --split development --label "机器人人工复核开发集"
node --env-file=.env scripts/eval-selection.ts --gold .data/robotics-gold.jsonl --split holdout --label "机器人人工复核留出集"
```

先读开发集错例改提示词，再看留出集；不能用留出集逐条调标准。上游门槛目前是未校准起点。后台 SelectBench 可以查看每次脚本导入的结果、错例和 token 用量；可靠单价缺失时费用保持未知。短索引候选不能直接用于宣称完整文章筛选效果。

离线检查（不请求外网、不调用模型、不访问数据库）：

```bash
node --test industry/evaluation/*.test.ts
```
