# 事件归组

| 关系 | 含义 |
|---|---|
| SAME_OCCURRENCE | 同一次发布/发生的不同报道 |
| SAME_STORY | 同一具体事件的直接后续进展 |
| UNRELATED | 不同事实，同主体或话题也不必归组 |
| ROUNDUP | 一方包含多个话题的汇总 |

规则位于 industry/prompts/group-*.md，入口为 events/relate.ts、group.ts。标题/摘要召回候选后由模型判关系。

## 评测

[relation-gold.example.jsonl](../industry/relation-gold.example.jsonl) 是虚构格式示例。真实标注存 .data/，含 a/b 的标题、来源、日期、摘要及可选 frame；gold.relation 使用上表。开发集用于调规则，留出集最后检查。

~~~bash
node --env-file=.env scripts/eval-relations.ts --gold .data/relation-gold.jsonl --split development
~~~

脚本复用生产 pairwise 提示词和 schema，只测两篇关系，不重跑召回、不写回事件。模型服务与预算须已获授权。

| 参数 | 默认 |
|---|---|
| --models | 当前 groupReview 模型，可逗号分隔比较 |
| --split / --n | all / 200 |
| --seed / --concurrency | 7 / 6 |
| --thresholds | 0.75,0.8 |

报告写 .data/eval/relations-*.json：混淆矩阵、各类 precision/recall/F1、accuracy、macro-F1、置信度阈值表现、错例、回执与用量。samplingStratum 只用于错误分析，不进入模型。

请求走既有回执与预算；相同输入共享结果和失败，各自计分。历史回执全部尝试计入 token/耗时，同一回执不重复计算，缓存重跑不代表新增费用。CI 使用本地替身，不访问外部模型。
