# 机器人来源记录

2026-10-02 首批验证 18 源，10-03 补 Microduck 两源与 ROS 公告。量子位后来按语言偏好停采，原验证结果保留。现行配置以 [sources.json](../industry/sources.json) 为准，不把历史报告的 enabled 当作实时状态。

[机器记录](source-validation.json) 保存各源检查时间、入口、样例 URL、日期、字数、结果和限制，正文不提交 Git。verified 只说明有限样例的 URL、日期、可读正文与机器人范围通过，不是逐条事实核验、独立复现或未来可用保证。

| 来源组 | 主要限制 |
|---|---|
| Robot Report、Robohub、ロボスタ、Robotiq | 媒体/采访/公关材料回到原文核对 |
| Open Robotics、MoveIt、ROS 公告 | 活动不自动精选；论坛用首帖日期，不用回复活跃时间 |
| NVIDIA、BAIR、arXiv cs.RO | 官方陈述、研究摘要与同行评审分别判断 |
| ROS 2、Gazebo、MuJoCo、Isaac Lab、LeRobot、RealSense、DepthAI releases | 版本发布不等于实机效果或完整开源 |
| Weekly Robotics | 按整篇处理，独立事件拆分尚未实现 |
| Microduck 博客与 releases | 官方自报；排除 -dev. 开发构建，保留原日期 |
| 量子位 | 技术检查曾通过，按运营者偏好保持禁用 |

~~~bash
node scripts/check-sources.ts --live --ids rss-robot-report,rss-lerobot-releases --out .data/source-validation.json
~~~

显式联网，不调用模型、不写库；复用 SSRF、逐跳和大小限制。每源最多一次列表、一次正文请求，间隔至少 500ms；未验证候选保持禁用。新增 ID 可 seed，已有来源经后台修改；停采不删除历史内容。

默认中文摘要与原文链接，全文关闭；可选 X/公众号服务须授权和预算。机器人专属材料需具体机器人关联，其他频道按自己的研究范围判断。

[配置方法](sources.md) · [语言偏好](source-preference.md) · [Microduck调查](microduck-coverage-audit.md) · [ROS时效](news-time-audit.md) · [简报补源](robot-briefing-sources.md)
