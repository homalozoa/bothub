# 当前内容范围

2026-10-06 收拢为综合、AI与机器人、生物学。社会学、游戏角色与泛家庭/工作/社区主题撤下，人机交互留在 AI与机器人。旧主键、单篇地址、显式历史机器接口和原机器人订阅保留，旧资料不删除或改名归入生物学。

| 阅读频道 | 方向 |
|---|---|
| AI与机器人 | 模型与方法、Agent、具身智能、硬件、运动操作、感知导航、人机交互、工程开源 |
| 生物学 | 动物学、行为、学习认知、人类学、古生物、动物生态、自然史 |

科学材料不要求 AI 关联；人类学关注人类起源、古 DNA、灵长类比较、物质文化及实证文化演化，排除泛民调/时政。纯细胞分子、植物微生物、临床药物通常不收，仅直接解释核心问题时作为辅助。使用机器学习不等于生物体认知，动物材料不等于动物行为。

小分类、内容形态、来源分别筛选；生物学只显示论文/研究、观点/分析、现象/趋势。切换领域清除不适用条件。生物学发现/新闻窗口 14/60 天，AI/机器人 2/7 天；窗口为编辑配置，60/65/76 分数门槛未改。

## 来源与维护

[验证记录](life-source-validation.json) 保存日期、样例和限制。启用 ScienceDaily 的 Zoology、Animal Learning、Anthropology、Paleontology，以及 Leakey Foundation、Max Planck Animal Behavior；Animal Behaviour 未确认正文/日期，保持禁用。ScienceDaily 专题属于同一发布方，有重叠 URL，不是独立核验。

PLOS Biology、eLife、ZooKeys、BHL 按研究问题筛选。Pew、OWID、Sociological Science、SocOpen、NNG 和原游戏来源停采。已有源使用 scripts/apply-life-focus-sources.ts，先 dry-run，再按后台版本检查 apply，只改指定策略，保留许可、预算和管理员其他设置。

## 2026-10-25 更新

线上近七天生物学来源新增 29 篇，预筛阻断 10 篇、普通动态 19 篇、精选 1 篇；11 个启用来源的采集无失败。该快照按首次发现计数，不能代表学科整体产出或人工编辑质量。发现无脊椎动物分类被错误排除，且五轴具体说明仍偏机器人，已修正相关提示词，见[精选说明](selection.md)。

新增 [Nature Ecology & Evolution](https://www.nature.com/natecolevol/) 及 Phys.org 的[生态](https://phys.org/biology-news/ecology/)、[演化](https://phys.org/biology-news/evolution/)、[古生物](https://phys.org/biology-news/paleontology/)订阅。四个入口来自两个发布方；Phys.org 专题有交叉，媒体转载不能计作独立核验。新来源每六小时采集，首次最多三条，后续读取公开正文再分析，仅展示摘要与链接。Nature 中植物、微生物及纯分子材料仍按研究问题排除。

本次原采集器验证了同条目的 URL、原日期与可读材料，结果追加至[来源记录](life-source-validation.json)。Journal of Experimental Biology 的 RSS 有日期但未确认可读正文，保留为禁用候选，不绕过访问控制。真实文章复查属于有限的运行诊断，不是人工标注评测，也不据此降低 60/65/76 门槛。

## 2026-10-06 记录

网页/主页 3589201、API/worker df60697 上线；606 后端、49 网页、9 来源检查及公开 smoke 43/43 通过，登录/CSRF/注销复查通过。36 次亮暗/宽度页面读取无横向溢出。

首次处理 13 条因小分类误填 relatedChannels 而失败；修复后仅接受合法主分类，原回执保留诊断，经后台恢复。首批 14 条中 12 完成分析、2 按范围阻断，历史日期保留。标签修正经鉴权/审计完成，未改评分、日期或事件 ID；不是论文方法质量或准确率评测。[后续补源](robot-briefing-sources.md)
