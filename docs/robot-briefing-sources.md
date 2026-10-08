# 机器人简报补源 · 2026-10-06

读取“生成机器人简报”2026-09-27 至 10-06 的 10 期，提取 20 个明确原始链接、12 个域名；内部引用不能还原全部材料，范围有限。报告陈述不作为事实证据，网站仍抓原文并走既有 worker，没有新增每日检查报告的自动化。

## 来源

原 arXiv cs.RO、NVIDIA 等沿用 ID。以下 11 源经原采集器确认至少一个同条目的 URL、日期与可读材料，记录见[验证 JSON](briefing-source-validation.json)，配置见 [sources.json](../industry/sources.json)。

| 来源 | 入口 |
|---|---|
| Anthropic Research | [HTML](https://www.anthropic.com/research) |
| Agility Robotics | [HTML](https://www.agilityrobotics.com/content) |
| FANUC | [HTML](https://www.fanuc.co.jp/en/profile/pr/newsrelease/) |
| Boston Dynamics Blog / News | [Blog](https://bostondynamics.com/feed/?post_type=blog) / [News](https://bostondynamics.com/feed/?post_type=news) |
| OMNIVISION Machine Vision | [RSS](https://www.ovt.com/press-application/machine-vision/feed/) |
| Leopard Imaging | [RSS](https://leopardimaging.com/feed/) |
| Lumotive | [RSS](https://lumotive.com/feed/?post_type=nooz_release) |
| Hello Robot | [RSS](https://hello-robot.com/feed/) |
| IDC Research | [HTML](https://www.idc.com/resource-center/blog/) |
| Viam | [HTML](https://www.viam.com/blog) |

初始每 12 小时、首次最多 3 篇，保留原日期；HTML 按日期排序，FANUC 公告日期按日本时区校验，OMNIVISION 仅取 Machine Vision。摘要公开、全文关闭；幂等 seed 不覆盖已有设置，同 URL 和事件仍去重，采集不保证精选。

IDC 空 RSS 改用已验证 HTML；ros2_control 正文未确认、Advantech/Coco/Deliveroo 汇总入口失败，保持禁用。PolyUMI、GlassGuard、RAPID、Recova、UniTrackPLA、Primebot 与 TAGGS 为原文资源，没有稳定更新入口时不建新闻源。[候选](../industry/source-candidates.json)

## 原始链接

- 2026年9月27日：[RAPID论文与项目页](https://yuyaoliu.me/projects/rapid/)、[PolyUMI项目页](https://polyumi-vista.github.io/)
- 2026年9月30日：[论文全文](https://arxiv.org/abs/2609.32550)
- 2026年10月1日：[Anthropic原始研究](https://www.anthropic.com/research/what-work-can-robots-do)、[原论文](https://arxiv.org/abs/2609.38178)、[IDC原始数据](https://www.idc.com/resource-center/blog/%E5%8D%8A%E5%B9%B4%E5%87%BA%E8%B4%A7-2-5-%E4%B8%87%E5%8F%B0%EF%BC%8C%E5%90%8C%E6%AF%94%E5%A2%9E%E9%95%BF432-1%EF%BC%9A%E5%85%A8%E7%90%83%E4%BA%BA%E5%BD%A2%E6%9C%BA%E5%99%A8%E4%BA%BA%E5%95%86%E4%B8%9A/)
- 2026年10月3日：[EIDA论文](https://arxiv.org/abs/2610.01219)、[启元产品官网](https://www.primebot.com/)、[GlassGuard项目与代码](https://glassguardproject.github.io/)
- 2026年10月4日：[VAPS论文](https://arxiv.org/abs/2610.01397)、[WBAG论文](https://arxiv.org/abs/2610.01083)、[FANUC官方公告](https://www.fanuc.co.jp/en/profile/pr/newsrelease/2026/notice20260930.html)
- 2026年10月5日：[Recova论文](https://arxiv.org/abs/2610.01178)、[项目页](https://www.liuisabella.com/Recova)、[UniTrackPLA论文](https://arxiv.org/abs/2610.00878)、[项目页](https://tw5775.github.io/UniTrackPLA)、[HHS TAGGS项目记录](https://taggs.hhs.gov/Detail/AwardDetail?arg_AwardNum=R44AG072982&arg_ProgOfficeCode=102)
- 2026年10月6日：[HexVIO论文](https://arxiv.org/abs/2610.03283)、[MiNI-Q论文](https://arxiv.org/abs/2610.02728)、[Deliveroo合作公告](https://deliveroo.co.uk/more/news-articles/autonomous-robot-launch)

## 结果与限制

API/worker 89adc84 上线，网页/主页保留 3589201。生产新增 11 源，54 个来源记录、45 启用；首次采集 11/11 成功，32 条原始资料中 27 完成分析、5 预筛拒绝，无待处理/失败。27 条经 publication 条件确认可公开；首次回填未挤入精选，日期与预算保留。

一条转引报道正文未确认，经既有摘要规则处理，未启用额外付费服务。来源技术检查不保证每篇可收录、质量或独立证据；Boston Dynamics 两 feed 不是两家核验，市场统计需保留口径。

类型/构建、607 后端、49 前端、9 来源检查通过；公开 smoke 43/43、私有会话/Cookie/CSRF/注销通过。配对备份和日志保持服务器私有；原始链接保留在上文，报告刊期不替代原文发布日期。
