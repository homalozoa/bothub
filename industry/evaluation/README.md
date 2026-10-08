# 人工复核材料

candidates.jsonl 含 42 条真实候选索引，development 28、holdout 14；标注均为 Codex agent 暂拟、pending_human_confirmation，gold=either。channel-candidates.jsonl 的 18 项属于旧频道阶段，按[当前范围](../../docs/life-focus.md)复核适用性。

候选正文是短释义，不能代表逐条全文核验；先打开原 URL，补充材料，区分仿真/真机、厂商陈述/独立证据及资产许可，再确认取舍。同事件与近重复保持同一 eventFamily/split；家族字段可人工修改，导出会拒绝跨 split。

在 .data/robotics-reviews.jsonl 每行写 caseId、annotator、confirmedAt、humanConfirmed=true、decision、bodyZh 或 bodyOriginal、reasonZh、eventFamily、benchmarkSplit。正文与私人材料不提交 Git。

~~~bash
node industry/evaluation/export-reviewed.ts --reviews .data/robotics-reviews.jsonl --out .data/robotics-gold.jsonl
# 旧频道索引需另加 --candidates industry/evaluation/channel-candidates.jsonl。
~~~

缺少确认、时间、理由或材料会报错；候选短释义不自动进入人工 gold。脚本依赖复核人声明，不提供身份认证或独立事实核验。

模型与预算获授权后：

~~~bash
node --env-file=.env scripts/eval-selection.ts --gold .data/robotics-gold.jsonl --split development
node --env-file=.env scripts/eval-selection.ts --gold .data/robotics-gold.jsonl --split holdout
~~~

没有有效人工标签或真实模型评测，不能报告准确率、召回率或校准后门槛；可靠单价缺失时费用未知。样本偏重工程 release/英语，长期实机、消费机器人与独立反证不足。

离线检查：npm run test:sources，不联网、不调模型、不访问数据库。[校准方法](../../docs/selection.md)
