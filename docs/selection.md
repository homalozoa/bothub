# 精选与校准

采集判重 → 预筛 → 评分/结构化 → 中文摘要 → 事件归组 → 公开发布。BLOCK 不公开，PASS/UNKNOWN 继续处理；评分与热度分开，双次评分不等于独立事实核验。

## 规则

| 配置 | 当前值 |
|---|---|
| 两次评分之和 | ≥ 2 × 来源门槛；显示平均分向下取整 |
| 来源门槛 | T1=60、T1_5=65、T2=76；EXCLUDE_MP 不参与 |
| understandFloor | 50；高于此值的未入选资料也使用详细摘要 |
| AI/机器人发现与新闻窗口 | 2 天 / 7 天 |
| 生物学发现与新闻窗口 | 14 天 / 60 天 |

窗口来自 industry/channels.ts，属于编辑配置，非测得的质量阈值。评分前、发布时、当前读取时分别检查原日期；人工精选、重抓、重分析及归组都不能绕过。未知日期不补写，历史回灌不参与；实时无日期材料以首次发现为时间上限。详情、搜索和历史主题保留资料，入选同步记录不代表当前窗口。

提示词位于 industry/prompts/，沿用既有版本机制；修改影响后续任务，旧判断不自动重算。归组最多等待 3 分钟后再公开精选。[归组](grouping.md)

日报默认 Asia/Shanghai 08:00，周一 10:00 周报、每月 1 日 10:30 月报。跨截稿才确定公开时间的资料进入下一期；取稿等待截止前的发布事务提交，仍受事实去重和容量限制。

## 人工评测

门槛未经当前领域人工校准。先准备有原文材料、标注者和取舍理由的样本；同一事件/近重复留在同一 split，只用开发集调规则，留出集最后检查。gold.decision 为 select/reject/either，either 不计入准确率。

格式见 [gold.example.jsonl](../industry/gold.example.jsonl)；它是合成示例。[真实候选与复核导出](../industry/evaluation/README.md)

服务、模型路由与预算获授权后：

~~~bash
node --env-file=.env scripts/eval-selection.ts --gold .data/gold.jsonl --split development --label "评分规则"
node --env-file=.env scripts/eval-selection.ts --gold .data/gold.jsonl --split holdout
~~~

可用 --models 比较模型，--n 限制数量。报告写 .data/eval/ 并进入 SelectBench，包含准确率、查准率、查全率、错例和门槛比较。先改错例对应的规则，再决定是否调数值。

相同输入共享评分回执，但按各样本预筛、来源门槛和 gold 独立计分；同次失败也共享。token/耗时包含回执全部尝试，缓存重跑显示历史累计，不代表新增费用。模型更换只影响后续任务，先用同批材料比较。
