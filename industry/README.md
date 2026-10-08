# ZooRadar 配置

入口为综合、AI与机器人、生物学；活动分类为 robotics、agents、biology。旧分类只用于历史记录与显式接口兼容。[内容范围](../docs/life-focus.md)

| 文件 | 用途 |
|---|---|
| site.ts | 名称、文案、联系信息与稳定 MCP 前缀 bothot |
| channels.ts、topic-navigation.ts | 分类、阅读入口、小分类和形态 |
| taxonomy.ts、topics.json | 标签、主体和主题 |
| sources.json、source-candidates.json | 已验证来源与禁用候选 |
| prompts/、selection.ts | 编辑规则；60/65/76 未经当前领域人工校准 |
| features.ts | 模型榜与重置监控均关闭 |
| brand/、branding.ts | 折页 Z、图标和报头 |
| pages/ | 未生效的运营草稿 |
| evaluation/、*gold.example.jsonl | 待复核候选与合成格式示例 |

来源优先非简体中文原始材料，站内使用中文摘要。科学材料不要求 AI 关联；仿真/真机、厂商陈述/独立证据、资产与许可证分别表达。分数用于编辑筛选，两次评分不等于独立核验。

新增源先验证再 seed，已有配置经后台修改。日期、文章 ID、主题 slug、订阅及 MCP 兼容保留，全文默认不公开。[定制](../docs/customize.md) · [信源](../docs/sources.md) · [人工复核](evaluation/README.md)
