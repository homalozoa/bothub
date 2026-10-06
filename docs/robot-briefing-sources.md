# 每日机器人简报信源接入

2026-10-06，按用户要求接入现有信源，由 ZooRadar 原 worker 持续采集。此次没有新增每日检查 ChatGPT 报告的自动化。

## 整理范围

读取「生成机器人简报」最近 10 期（2026-09-27 至 2026-10-06），提取 20 个明确的原始链接，涉及 12 个域名。简报中的内部引用编号不能还原全部链接，因此这是一份有限范围的信源整理。报告陈述本身不作为网站事实证据；网站仍抓取原始材料并通过原预筛、摘要和发布链路。

arXiv cs.RO、NVIDIA 机器人博客等已有来源沿用现有 ID；不为单篇论文创建重复来源。项目页和产品首页属于原文资源，不能因在简报出现就当成有稳定发布日期的更新源。

## 新增持续采集来源

以下 11 个来源已通过原采集器联网检查：至少一个同一条目同时具有原文 URL、原始日期、可提取正文。该检查不等于每篇文章的质量确认。具体样例与限制见[机器检查记录](briefing-source-validation.json)。

| 来源 | 范围 | 实际采集入口 |
|---|---|---|
| Anthropic Research | 研究与具身任务评估 | [HTML](https://www.anthropic.com/research) |
| Agility Robotics | 机器人操作、部署与官方研究 | [HTML](https://www.agilityrobotics.com/content) |
| FANUC | 工业机器人、物理 AI 与产品公告 | [HTML](https://www.fanuc.co.jp/en/profile/pr/newsrelease/) |
| Boston Dynamics Blog | 机器人研发、产品与部署 | [RSS](https://bostondynamics.com/feed/?post_type=blog) |
| Boston Dynamics News | 公司公告及媒体覆盖线索 | [RSS](https://bostondynamics.com/feed/?post_type=news) |
| OMNIVISION Machine Vision | 机器视觉与图像传感器 | [RSS](https://www.ovt.com/press-application/machine-vision/feed/) |
| Leopard Imaging | 机器人视觉硬件、集成与 SDK | [RSS](https://leopardimaging.com/feed/) |
| Lumotive Official Releases | 固态激光雷达与光学硬件发布 | [RSS](https://lumotive.com/feed/?post_type=nooz_release) |
| Hello Robot | 移动操作、研究平台与开发工具 | [RSS](https://hello-robot.com/feed/) |
| IDC Research | 机器人市场研究；保留方法与统计口径 | [HTML](https://www.idc.com/resource-center/blog/) |
| Viam Blog | 机器人软件、数据工具与集成案例 | [HTML](https://www.viam.com/blog) |

新源初始每 12 小时检查一次，后续沿用原 worker 按来源活跃度调整频率的机制。首次最多导入 3 篇，保持原始发布时间。HTML 列表按原发布时间排序，避免首页置顶旧文挤掉新文章。FANUC 的 YYYYMMDD 公告标识与页面日期核对后按日本时区解析，非法日历日期被拒绝。OMNIVISION 仅订阅 Machine Vision 分类，避免移动设备等泛产品公告挤入机器人频道。

Boston Dynamics 博客与新闻共用厂商身份；两条 feed 不能当作两家独立信源。厂商案例、合作公告、市场研究仍需区分自报、独立证据、统计口径与营销内容。所有新增来源保持摘要和原文链接，全文公开开关关闭；采集频率不改变原模型预算。

seed 只幂等插入新增 ID，保留已有后台设置。条目按原 URL 去重并沿用原事件归组。采集到的条目不保证进入精选；精选由原编辑筛选决定。

## 候选及一次性资源

- IDC RSS 实际返回空 feed，采用已验证的官网 HTML 列表替代。
- ros2_control 已有同一官方 release 候选，本次更新检查记录；Atom 有日期但版本正文未确认，继续禁用，避免重复建立另一个来源 ID。
- Advantech 尝试的新闻入口跳转至 404；Coco 与 Deliveroo 尝试的汇总页未取得有效列表，不启用这些入口。单条 Deliveroo 合作公告保留为原始资源。
- PolyUMI 与 GlassGuard 官网可访问并给出官方代码仓库，但 releases feed 暂为空；RAPID、Recova、UniTrackPLA 项目页没有稳定的带日期更新列表。保留项目链接，不将无日期页面伪装成新闻。
- Primebot 产品首页与 HHS TAGGS 授权记录用于原文核对，未发现合适的持续新闻入口。

候选配置保留于[source-candidates.json](../industry/source-candidates.json)，未通过检查的候选不进入已启用来源。

## 简报明确链接清单

日期是报告的刊期，不是替代文章的原始发布时间。下面保留链接以便追溯；不导入 ChatGPT 报告全文。

| 报告刊期 | 资源 | 原始链接 |
|---|---|---|
| 2026年9月27日 | RAPID论文与项目页 | [原文](https://yuyaoliu.me/projects/rapid/) |
| 2026年9月27日 | PolyUMI项目页 | [原文](https://polyumi-vista.github.io/) |
| 2026年9月30日 | 论文全文 | [原文](https://arxiv.org/abs/2609.32550) |
| 2026年10月1日 | Anthropic原始研究 | [原文](https://www.anthropic.com/research/what-work-can-robots-do) |
| 2026年10月1日 | 原论文 | [原文](https://arxiv.org/abs/2609.38178) |
| 2026年10月1日 | IDC原始数据 | [原文](https://www.idc.com/resource-center/blog/%E5%8D%8A%E5%B9%B4%E5%87%BA%E8%B4%A7-2-5-%E4%B8%87%E5%8F%B0%EF%BC%8C%E5%90%8C%E6%AF%94%E5%A2%9E%E9%95%BF432-1%EF%BC%9A%E5%85%A8%E7%90%83%E4%BA%BA%E5%BD%A2%E6%9C%BA%E5%99%A8%E4%BA%BA%E5%95%86%E4%B8%9A/) |
| 2026年10月3日 | EIDA论文 | [原文](https://arxiv.org/abs/2610.01219) |
| 2026年10月3日 | 启元产品官网 | [原文](https://www.primebot.com/) |
| 2026年10月3日 | GlassGuard项目与代码 | [原文](https://glassguardproject.github.io/) |
| 2026年10月4日 | VAPS论文 | [原文](https://arxiv.org/abs/2610.01397) |
| 2026年10月4日 | WBAG论文 | [原文](https://arxiv.org/abs/2610.01083) |
| 2026年10月4日 | FANUC官方公告 | [原文](https://www.fanuc.co.jp/en/profile/pr/newsrelease/2026/notice20260930.html) |
| 2026年10月5日 | Recova论文 | [原文](https://arxiv.org/abs/2610.01178) |
| 2026年10月5日 | 项目页 | [原文](https://www.liuisabella.com/Recova) |
| 2026年10月5日 | UniTrackPLA论文 | [原文](https://arxiv.org/abs/2610.00878) |
| 2026年10月5日 | 项目页 | [原文](https://tw5775.github.io/UniTrackPLA) |
| 2026年10月5日 | HHS TAGGS项目记录 | [原文](https://taggs.hhs.gov/Detail/AwardDetail?arg_AwardNum=R44AG072982&arg_ProgOfficeCode=102) |
| 2026年10月6日 | HexVIO论文 | [原文](https://arxiv.org/abs/2610.03283) |
| 2026年10月6日 | MiNI-Q论文 | [原文](https://arxiv.org/abs/2610.02728) |
| 2026年10月6日 | Deliveroo合作公告 | [原文](https://deliveroo.co.uk/more/news-articles/autonomous-robot-launch) |

## 检查与部署

离线检查覆盖来源 ID 唯一性、数据库 tier、配置支持情况、启用状态和原始验证元数据；日期测试覆盖时区、闰日和非法日期。完整来源包在独立 CI 库首次 seed 导入 50 个来源，再次运行新增 0 个。

2026-10-06 已部署 API/worker `89adc84`。网页和静态主页继续使用 `3589201`。生产 seed 新增 11 个 ID，全站共 54 个来源记录、45 个启用。已有来源配置与部署前一致，模型预算一致；web、数据库和无关服务没有重建。

首次真实采集 11/11 成功，新增 32 条原始资料；27 条分析完成、5 条被预筛拒绝，没有待处理或失败状态。通过原 publication 读取条件及 AI与机器人频道条件确认 27 条可在资料池公开阅读；OG05D、Claude 的公开搜索返回了新增来源内容。首次回填没有自动挤入精选，过期材料仍保留原日期及原新闻新鲜度规则。

其中一条 Boston Dynamics 转引报道没有可提取的正文，原备用 Jina 服务未配置。使用既有免费提取入口复核后标记正文未确认，再沿用原摘要处理规则完成分析；未启用额外付费服务，未改日期或评分。未来仍可能遇到摘要不足、网页不可读或无法确认正文的条目，不能将本次来源检查解释为每篇都可收录。

验证：后端 607、前端 49、来源检查 9 项全通过，类型检查与网页构建通过；生产公开 smoke 43/43 通过，私有后台登录、Secure/HttpOnly/SameSite Cookie、CSRF 拒绝和退出会话检查通过。私有备份和部署日志保存在服务器 release 目录，未提交配置密钥、数据库备份或报告全文。
