# ZooRadar 配置

七频道定义与发现窗口在 channels.ts，站名和公开文案在 site.ts。频道与原 category、tags、来源方式独立，机器人原类别与公开 ID 保持。六个新增领域不受机器人相关性要求限制。全部来源共用采集和发布层；信源提示不是独占分类。

本轮来源核验、部署迁移和验证范围以 [多频道说明](../docs/multichannel.md) 为准。source-validation.json 保留旧机器人验证，channel-source-validation.json 记录新增核验。启用列表有 34 个唯一来源，14 个新增来源已经过原采集器检查；没有生产同步或付费编辑质量声明。seed 保留管理员修改。

下面保留旧机器人配置的历史说明；机器人专属限制仅在 robotics 频道适用。

# 机器人行业配置

“机闻”是此前站名，面向机器人创业者、研发负责人和工程师。复用 AIHOT 的采集、worker、数据库、发布层与前端，不改变内部包名或必要署名。名称与Z标记已确认，运营者为 [Homalozoa](https://github.com/homalozoa)（个人），邮箱 homalozoax@gmail.com，网站地址由 `SITE_URL` 配置，目前生产资讯域名为 `news.openzoo.ai`。当前待办与品牌候选见 [清单](../docs/launch-todos.md)。

| 文件 | 用途 |
|---|---|
| `site.ts` | 对外名称、中文文案、抓取身份和稳定 MCP 前缀 `bothot` |
| `taxonomy.ts` | 三个主分类、内容形态标签、技术/产品主题、实体和身份安全词典 |
| `topics.json` | 主题目录；按实体或标签归入，不与主分类混装 |
| `sources.json` | 可导入信源配置，实际验证见 [来源说明](../docs/sources-robotics.md) |
| `prompts/` | 预筛、评分、证据写作、结构化、归组和简报规则 |
| `selection.ts` | 60 / 65 / 76 与 understandFloor=50：沿用上游，机器人领域未校准 |
| `features.ts` | 模型排行榜与 Codex 重置监控均关闭 |
| `brand/` | “机”字开发文字标识、图标与机器人日报/周报/月报报头 |
| `pages/` | 对应真实处理行为的条款和隐私草稿，尚待运营者确认 |
| `gold.example.jsonl` | Agent 编写的合成格式示例，非真实新闻、非人工金标准 |

三个稳定分类 key 是 `hardware`（硬件与系统工程）、`research`（研究与开源）、`industry`（产品与商业化，沿用上游日报 fallback）。七个 `ITEM_TYPES` 及五轴类型权重原样保留。类别标签描述内容形态，技术与产品主题标签独立维护，公司使用 `entityId`，公开分类 key、主题 slug 和工具前缀上线后保持稳定。身份安全检查保留上游词典并补机器人实体，不能因换行业移除防止模型补写公司的检查。

普通大模型、编程工具、消费电子与汽车消息，只有原始材料明确给出具体机器人关联才放行；材料不足保留 UNKNOWN 等待补充。精选要求具体信息价值，不以名校、大厂、SOTA、融资额或炫技替代证据。讨论少的工具、硬件、独立复现或反证仍有入选路径。热度来自事件级传播信号，模型评分只用于编辑筛选，两次评分不代表独立来源核验。

`rules-evidence.md` 共享于写作流程：区分仿真/真机/遥操作、演示/连续运行、来源陈述/独立证据、代码/权重/数据/硬件与许可证、订单/出货/交付/收入/活跃用户；抓取日期不能替代原始发布时间。先讲本次新增事实，后讲价值与必要限制，不为每条制造工程建议。日报通常重点讲 2–3 条、最多 5 条，信息不足允许 0–2 条或空刊。

启动、验证与已知限制见 [机器人站操作说明](../docs/robotics.md)，运行与模型配置也可查 [部署](../docs/deploy.md)，实际来源、验证结果与启用方式见 [来源说明](../docs/sources-robotics.md)。增删信源使用后台或 `sources.json`，保持原文摘要展示权限，不因写入配置而覆盖管理员的设置。X 与公众号是需要授权和服务密钥的可选扩展。不要把 HTTP 200、合成回归或 mock 演示当作真实采集与编辑质量证据。

校准使用 [精选与校准](../docs/selection.md) 的 SelectBench 和 `scripts/eval-selection.ts`。真实候选样本应有原始出处、标注者与待确认状态，用户复核后再作为人工标签；相同事件与近重复不能跨开发集和留出集。`gold.example.jsonl` 只说明输入格式，不能用于宣称准确率、召回率或成本。模型调用与预算授权齐备后，先按有效标注运行评测，再决定是否调整数值门槛。

此前站名为“机闻”，英文为 OpenZoo News，折页 Z 标记由 `branding.ts` 的共享矢量路径定义。运行 `node industry/brand/generate.ts` 可重建彩色/单色/反白 SVG、PNG 和 ICO；`node scripts/nameplates.ts` 使用仓库内 Noto Sans SC Bold 生成机闻日报/周报/月报报头，仍可传入字体包目录使用 Black。字体许可保存在 `brand/FONT-LICENSE.txt`。必要上游署名与内部包名保留。

来源默认优先非简体中文的一手材料；中文摘要不变。当前启用19源，量子位按运营者偏好停用，历史记录保留。详见 [来源语言偏好](../docs/source-preference.md)。
