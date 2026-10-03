# 机器人信源验证

当前默认启用19个非简体中文来源。量子位已于2026-10-03按运营者偏好停采，以下表格和机器记录保留当时的解析验证结果；它仍可解析，不代表当前启用。来源选择规则见 [来源语言偏好](source-preference.md)。


首次整批检查（UTC）：2026-10-02T11:33:58.809Z。机器记录见 [source-validation.json](source-validation.json)，配置见 [sources.json](../industry/sources.json)。首批表格由同一次检查按配置元数据生成，后续追加检查保留条目各自的时间。

“verified”表示原采集器解析到了条目，并在最多三个样例（优先选择原材料包含机器人线索的条目）中找到同一条具有原文 URL、发布时间、可提取正文和机器人关联的材料。ROS 2、Nav2、MoveIt 2 和 ros2_control 的数字版本标题通过原始机器人项目 release URL 确认范围，relevanceBasis 字段区分该依据与正文关键词。它不代表逐条事实核验、独立复现或所有未来条目可用。全文只在检查内存中使用；报告只保留标题、URL、时间、字数和状态。

| 名称 | 语言 / 方向 | 身份 / 启用 | 实际入口 | 结果 |
|---|---|---|---|---|
| The Robot Report | en / industry, hardware | media / 启用 | [rss](https://www.therobotreport.com/feed/) | verified |
| Robohub | en / research, industry | media / 启用 | [rss](https://robohub.org/feed/) | verified |
| ロボスタ | ja / industry, hardware | media / 启用 | [rss](https://robotstart.info/rss20/index.rdf) | verified |
| 量子位 | zh / research, industry | media / 启用 | [rss](https://www.qbitai.com/feed) | verified |
| Open Robotics Blog | en / hardware, research | institution / 启用 | [rss](https://www.openrobotics.org/blog?format=rss) | verified |
| MoveIt Blog | en / hardware, research | project / 启用 | [rss](https://moveit.ai/feed.xml) | verified |
| NVIDIA Blog · Robotics | en / hardware, research, industry | company / 启用 | [rss](https://blogs.nvidia.com/blog/category/robotics/feed/) | verified |
| Berkeley AI Research | en / research | institution / 启用 | [rss](https://bair.berkeley.edu/blog/feed.xml) | verified |
| arXiv · cs.RO | en / research | paper-platform / 启用 | [rss](https://rss.arxiv.org/rss/cs.RO) | verified |
| ROS 2 Releases | en / hardware | project / 启用 | [rss](https://github.com/ros2/ros2/releases.atom) | verified |
| Gazebo Sim Releases | en / hardware, research | project / 启用 | [rss](https://github.com/gazebosim/gz-sim/releases.atom) | verified |
| MuJoCo Releases | en / research, hardware | project / 启用 | [rss](https://github.com/google-deepmind/mujoco/releases.atom) | verified |
| Isaac Lab Releases | en / research, hardware | project / 启用 | [rss](https://github.com/isaac-sim/IsaacLab/releases.atom) | verified |
| LeRobot Releases | en / research, hardware | project / 启用 | [rss](https://github.com/huggingface/lerobot/releases.atom) | verified |
| RealSense SDK Releases | en / hardware | project / 启用 | [rss](https://github.com/realsenseai/librealsense/releases.atom) | verified |
| DepthAI Core Releases | en / hardware | project / 启用 | [rss](https://github.com/luxonis/depthai-core/releases.atom) | verified |
| Weekly Robotics | en / hardware, research | editor / 启用 | [rss](https://www.weeklyrobotics.com/atom.xml) | verified |
| Robotiq Blog | en / hardware, industry | company / 启用 | [rss](https://blog.robotiq.com/rss.xml) | verified |
| Microduck Blog | en / hardware, research, industry | project / 启用 | [rss](https://pollen-robotics.com/microduck/blog/rss.xml) | verified |
| Microduck Releases | en / hardware, research | project / 启用 | [rss](https://github.com/pollen-robotics/microduck/releases.atom) | verified |

2026-10-03 单独补验 Microduck 两个官方入口，既有 18 个来源保留原检查时间。此次未重新验证其全部内容。

## 样例与限制

### The Robot Report

检查：2026-10-02T11:32:55.078Z；verified。15 个解析条目，15 个有日期。

- [Top 10 robotics stories of September 2026](https://www.therobotreport.com/top-10-robotics-stories-of-september-2026/)；原始日期 2026-10-01T20:42:08.000Z；正文 feed（4460 字符）；机器人线索 有。
- [Boston Dynamics drops pinkie on new humanoid hand](https://www.therobotreport.com/boston-dynamics-drops-pinkie-on-new-humanoid-hand/)；原始日期 2026-10-01T17:52:51.000Z；正文 feed（6478 字符）；机器人线索 有。
- [Precision In Motion. Vishay Precision Group, Inc. (VPG) to Showcase Custom Sensing Capabilities for Humanoid Robotics at RoboBusiness 2026](https://www.therobotreport.com/precision-in-motion-vishay-precision-group-inc-vpg-to-showcase-custom-sensing-capabilities-for-humanoid-robotics-at-robobusiness-2026/)；原始日期 2026-10-01T15:29:55.000Z；正文 feed（6120 字符）；机器人线索 有。

包含赞助稿、活动和融资线索；报道中转述的厂商说法不是独立验证。

### Robohub

检查：2026-10-02T11:32:57.536Z；verified。75 个解析条目，75 个有日期。

- [Robotics and automation? Informal reflections on familiar terms](https://robohub.org/robotics-and-automation-informal-reflections-on-familiar-terms/)；原始日期 2026-09-30T08:37:22.000Z；正文 feed（6876 字符）；机器人线索 有。
- [Small, medium or large, a robotic fish maintains its swimming ability](https://robohub.org/small-medium-or-large-a-robotic-fish-maintains-its-swimming-ability/)；原始日期 2026-09-28T11:24:15.000Z；正文 feed（4502 字符）；机器人线索 有。
- [Robot Talk Episode 163 – Robots helping people, with Aaron Edsinger](https://robohub.org/robot-talk-episode-163-robots-helping-people-with-aaron-edsinger/)；原始日期 2026-09-25T11:54:14.000Z；正文 feed（683 字符）；机器人线索 有。

投稿、专栏和研究者访谈；检查原始论文与项目链接。

### ロボスタ

检查：2026-10-02T11:33:05.425Z；verified。50 个解析条目，50 个有日期。

- [ロボットメーカーとしての知見を生かした「製造業向けAXソリューション」をNew Innovationsが発表、「図面バンク」はエージェント機能を追加](https://robotstart.info/article/2026/10/02/382479.html)；原始日期 2026-10-02T09:20:02.000Z；正文 readability（2409 字符）；机器人线索 有。
- [デモ映像の枠を超え日常へ ショールームの案内からホテルの受付まで行うヒューマノイドAGIBOT A3 Ultra](https://robotstart.info/article/2026/10/02/382478.html)；原始日期 2026-10-02T08:35:02.000Z；正文 missing（0 字符）；机器人线索 有。
- [ヒューマノイドAtlasの新しいハンドは13自由度、小指を省いた理由をBoston Dynamicsの開発チームが語る【動画】](https://robotstart.info/article/2026/10/02/382477.html)；原始日期 2026-10-02T07:15:03.000Z；正文 missing（0 字符）；机器人线索 有。

关注服务、伙伴和消费机器人；日文标题需保留归属，公关稿须降权。

### 量子位

检查：2026-10-02T11:33:13.630Z；verified。10 个解析条目，10 个有日期。

- [刚刚，GPT-6 Astra接上宇树G1，把厨房收拾了！](https://www.qbitai.com/2026/09/499493.html)；原始日期 2026-09-30T07:54:54.000Z；正文 readability（3619 字符）；机器人线索 有。
- [openJiuwen X-Router自演进模型路由技术首发，昇腾亲和，Agent越跑越省，实测减少50+%Token消耗](https://www.qbitai.com/2026/10/500098.html)；原始日期 2026-10-02T07:34:15.000Z；正文 missing（0 字符）；机器人线索 未确认。
- [丘成桐新论文致谢了GPT和Claude](https://www.qbitai.com/2026/10/499991.html)；原始日期 2026-10-02T07:27:03.000Z；正文 missing（0 字符）；机器人线索 未确认。

综合 AI 媒体，只保留原材料明确涉及机器人的报道。

### Open Robotics Blog

检查：2026-10-02T11:33:18.242Z；verified。20 个解析条目，20 个有日期。

- [Complete the Open Robotics Annual Survey 2026 to enter the prize draw](https://www.openrobotics.org/blog/2026/9/29/complete-the-open-robotics-annual-survey-2026-to-enter-the-prize-draw)；原始日期 2026-09-29T07:11:25.000Z；正文 feed（2601 字符）；机器人线索 有。
- [Open Robotics announces Red Hat Enterprise Linux Tier 1 support for ROS](https://www.openrobotics.org/blog/2026/9/22/open-robotics-announces-red-hat-enterprise-linux-tier-1-support-for-ros)；原始日期 2026-09-22T21:00:01.000Z；正文 feed（1581 字符）；机器人线索 有。
- [Resources for users of ROS 1](https://www.openrobotics.org/blog/2026/4/20/resources-for-users-of-ros-1)；原始日期 2026-04-21T06:21:09.000Z；正文 feed（1326 字符）；机器人线索 有。

ROS/Gazebo 官方组织博客；刊期稀疏，活动通知不自动进入精选。

### MoveIt Blog

检查：2026-10-02T11:33:21.089Z；verified。10 个解析条目，10 个有日期。

- [GSoC 2024 - MuJoCo support for ROS 2 MoveIt](https://moveit.ai/moveit/gsoc/2024/08/22/GSoC-2024-mujoco-support-for-ros2-moveit.html)；原始日期 2024-08-22T00:00:00.000Z；正文 readability（3043 字符）；机器人线索 有。
- [New MoveIt LTS release for ROS 2 Jazzy!](https://moveit.ai/release/jazzy/rolling/2024/06/30/New-MoveIt-LTS-release-for-ROS-2-Jazzy.html)；原始日期 2024-06-30T00:00:00.000Z；正文 missing（0 字符）；机器人线索 有。
- [MoveIt Pro Open Core - Building and Supporting Open Source Software for the Future](https://moveit.ai/open%20source/open%20core%20software/2024/02/22/MoveIt-Pro-Open-Core.html)；原始日期 2024-02-22T00:00:00.000Z；正文 missing（0 字符）；机器人线索 有。

官方项目文章；机器人演示条件、ROS 版本和软件许可仍需逐条核对。

### NVIDIA Blog · Robotics

检查：2026-10-02T11:33:24.525Z；verified。18 个解析条目，18 个有日期。

- [NVIDIA Isaac ROS 5.0 Advances Agentic, Open Source Robotics Development](https://blogs.nvidia.com/blog/isaac-ros-5-0-agentic-open-source-robotics/)；原始日期 2026-09-22T12:00:41.000Z；正文 feed（9534 字符）；机器人线索 有。
- [Why Deploying Physical AI at Scale Demands Safety at Every Layer](https://blogs.nvidia.com/blog/physical-ai-halos-safety/)；原始日期 2026-09-21T16:00:46.000Z；正文 feed（8217 字符）；机器人线索 有。
- [Skild AI Taps NVIDIA Physical AI to Teach Robots New Tasks From a Single Video](https://blogs.nvidia.com/blog/skild-ai-s1-physical-ai/)；原始日期 2026-09-10T16:30:35.000Z；正文 feed（5699 字符）；机器人线索 有。

官方宣传和合作案例；保留硬件要求、仿真条件与性能归属。

### Berkeley AI Research

检查：2026-10-02T11:33:26.847Z；verified。10 个解析条目，10 个有日期。

- [2026 BAIR Graduate Showcase](http://bair.berkeley.edu/blog/2026/07/01/grads-2026/)；原始日期 2026-07-01T09:00:00.000Z；正文 readability（18155 字符）；机器人线索 有。
- [Gradient-based Planning for World Models at Longer Horizons](http://bair.berkeley.edu/blog/2026/04/20/grasp/)；原始日期 2026-04-20T09:00:00.000Z；正文 missing（0 字符）；机器人线索 有。
- [Information-Driven Design of Imaging Systems](http://bair.berkeley.edu/blog/2026/01/10/information-driven-imaging/)；原始日期 2026-01-10T09:00:00.000Z；正文 missing（0 字符）；机器人线索 有。

混合 AI 研究，机器人相关性逐条预筛；发表不自动意味着工程价值。

### arXiv · cs.RO

检查：2026-10-02T11:33:31.372Z；verified。158 个解析条目，158 个有日期。

- [Bounded-Fidelity Sim-as-Demo-Stage: Mocap Handoff for Governance Benchmarks](https://arxiv.org/abs/2610.00008)；原始日期 2026-10-02T04:00:00.000Z；正文 readability（2272 字符）；机器人线索 有。
- [Probabilistic Plan Legibility with Off-the-shelf Planners](https://arxiv.org/abs/2610.00065)；原始日期 2026-10-02T04:00:00.000Z；正文 missing（0 字符）；机器人线索 有。
- [HumanoidTTT: Test-Time Capability Reuse for Efficient Humanoid Control](https://arxiv.org/abs/2610.00198)；原始日期 2026-10-02T04:00:00.000Z；正文 missing（0 字符）；机器人线索 有。

预印本摘要而非全文；不保证同行评审，RSS 可能含修订与跨类论文。

### ROS 2 Releases

检查：2026-10-02T11:33:36.485Z；verified。10 个解析条目，10 个有日期。

- [ROS 2 Humble Hawksbill - Patch Release 15](https://github.com/ros2/ros2/releases/tag/release-humble-20260914)；原始日期 2026-09-14T18:34:12.000Z；正文 feed（666 字符）；机器人线索 有。
- [ROS Lyrical Luth - Patch Release 2 (2026/08/07)](https://github.com/ros2/ros2/releases/tag/release-lyrical-20260807)；原始日期 2026-08-08T00:05:41.000Z；正文 feed（504 字符）；机器人线索 有。
- [ROS Lyrical Luth - Patch Release 1 (2026/06/23)](https://github.com/ros2/ros2/releases/tag/release-lyrical-20260623)；原始日期 2026-06-23T20:32:22.000Z；正文 feed（504 字符）；机器人线索 有。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### Gazebo Sim Releases

检查：2026-10-02T11:33:38.746Z；verified。10 个解析条目，10 个有日期。

- [ignition-gazebo6_6.18.0: Prepare for 6.18.0 (#3670)](https://github.com/gazebosim/gz-sim/releases/tag/ignition-gazebo6_6.18.0)；原始日期 2026-06-09T17:53:51.000Z；正文 readability（394 字符）；机器人线索 有。
- [gz-sim11_11.0.0-pre1: Fix graded buoyancy for rotated collision shapes (#3880)](https://github.com/gazebosim/gz-sim/releases/tag/gz-sim11_11.0.0-pre1)；原始日期 2026-08-20T08:51:36.000Z；正文 missing（0 字符）；机器人线索 未确认。
- [gz-sim9_9.6.0: Prepare 9.6.0 release (#3875)](https://github.com/gazebosim/gz-sim/releases/tag/gz-sim9_9.6.0)；原始日期 2026-08-13T02:28:21.000Z；正文 missing（0 字符）；机器人线索 未确认。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### MuJoCo Releases

检查：2026-10-02T11:33:42.068Z；verified。10 个解析条目，10 个有日期。

- [3.14.0](https://github.com/google-deepmind/mujoco/releases/tag/3.14.0)；原始日期 2026-09-22T16:52:58.000Z；正文 feed（4883 字符）；机器人线索 有。
- [3.13.0](https://github.com/google-deepmind/mujoco/releases/tag/3.13.0)；原始日期 2026-09-09T15:03:05.000Z；正文 feed（4023 字符）；机器人线索 有。
- [3.12.0](https://github.com/google-deepmind/mujoco/releases/tag/3.12.0)；原始日期 2026-08-20T12:53:06.000Z；正文 feed（10278 字符）；机器人线索 有。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### Isaac Lab Releases

检查：2026-10-02T11:33:43.841Z；verified。10 个解析条目，10 个有日期。

- [v3.0.0-EA](https://github.com/isaac-sim/IsaacLab/releases/tag/v3.0.0-EA)；原始日期 2026-09-16T22:34:03.000Z；正文 feed（15163 字符）；机器人线索 有。
- [v3.0.0-beta2.patch1](https://github.com/isaac-sim/IsaacLab/releases/tag/v3.0.0-beta2.patch1)；原始日期 2026-07-02T04:21:18.000Z；正文 feed（686 字符）；机器人线索 有。
- [v3.0.0-beta2](https://github.com/isaac-sim/IsaacLab/releases/tag/v3.0.0-beta2)；原始日期 2026-06-17T02:16:55.000Z；正文 feed（12070 字符）；机器人线索 有。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### LeRobot Releases

检查：2026-10-02T11:33:45.697Z；verified。10 个解析条目，10 个有日期。

- [Release v0.6.1](https://github.com/huggingface/lerobot/releases/tag/v0.6.1)；原始日期 2026-08-03T14:24:49.000Z；正文 feed（14027 字符）；机器人线索 有。
- [Release v0.6.0](https://github.com/huggingface/lerobot/releases/tag/v0.6.0)；原始日期 2026-07-08T15:39:00.000Z；正文 feed（16255 字符）；机器人线索 有。
- [Release v0.5.1](https://github.com/huggingface/lerobot/releases/tag/v0.5.1)；原始日期 2026-04-07T14:57:52.000Z；正文 feed（3992 字符）；机器人线索 有。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### RealSense SDK Releases

检查：2026-10-02T11:33:49.318Z；verified。10 个解析条目，10 个有日期。

- [RealSense SDK 2.0 beta (v2.58.4)](https://github.com/realsenseai/librealsense/releases/tag/v2.58.4)；原始日期 2026-08-30T09:06:43.000Z；正文 feed（4468 字符）；机器人线索 有。
- [RealSense SDK 2.0 beta (v2.58.3)](https://github.com/realsenseai/librealsense/releases/tag/v2.58.3)；原始日期 2026-07-20T12:27:07.000Z；正文 feed（4493 字符）；机器人线索 有。
- [RealSense SDK 2.0 beta (v2.58.2)](https://github.com/realsenseai/librealsense/releases/tag/v2.58.2)；原始日期 2026-06-16T11:24:07.000Z；正文 feed（3832 字符）；机器人线索 有。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### DepthAI Core Releases

检查：2026-10-02T11:33:50.963Z；verified。10 个解析条目，10 个有日期。

- [ros-v3.10.0](https://github.com/luxonis/depthai-core/releases/tag/ros-v3.10.0)；原始日期 2026-09-07T10:40:58.000Z；正文 missing（0 字符）；机器人线索 有。
- [ros-old-v3.10.0](https://github.com/luxonis/depthai-core/releases/tag/ros-old-v3.10.0)；原始日期 2026-09-07T10:42:45.000Z；正文 missing（0 字符）；机器人线索 有。
- [Release v3.10.0](https://github.com/luxonis/depthai-core/releases/tag/v3.10.0)；原始日期 2026-09-02T08:06:55.000Z；正文 feed（2948 字符）；机器人线索 有。

官方 release 说明只证明该版本发布及其陈述；代码、权重、数据、硬件文件和许可证分别检查。

### Weekly Robotics

检查：2026-10-02T11:33:54.011Z；verified。10 个解析条目，10 个有日期。

- [Weekly Robotics #378](https://weeklyrobotics.com/weekly-robotics-378)；原始日期 2026-09-27T23:00:00.000Z；正文 feed（4964 字符）；机器人线索 有。
- [Weekly Robotics #377](https://weeklyrobotics.com/weekly-robotics-377)；原始日期 2026-09-20T23:00:00.000Z；正文 feed（6368 字符）；机器人线索 有。
- [Weekly Robotics #376](https://weeklyrobotics.com/weekly-robotics-376)；原始日期 2026-09-13T23:00:00.000Z；正文 feed（4885 字符）；机器人线索 有。

机器人技术周刊；转载线索需回到原材料，赞助与编辑推荐分开。

### Robotiq Blog

检查：2026-10-02T11:33:56.571Z；verified。10 个解析条目，10 个有日期。

- [Robotiq Releases New 2F-85 Isaac Sim Asset on Newton](https://blog.robotiq.com/robotiq-releases-new-2f-85-gripper-isaac-sim-assets-on-newton)；原始日期 2026-09-22T01:31:56.000Z；正文 feed（5105 字符）；机器人线索 有。
- [Robotiq Releases ROS 2 Packages for Adaptive Grippers](https://blog.robotiq.com/robotiq-releases-ros-2-packages-for-adaptive-grippers)；原始日期 2026-08-26T12:00:02.000Z；正文 feed（6740 字符）；机器人线索 有。
- [Robotiq Releases an Open-Source C++ SDK for Adaptive Grippers](https://blog.robotiq.com/robotiq-releases-open-source-c-sdk-for-adaptive-gripper)；原始日期 2026-08-12T11:14:05.000Z；正文 feed（5782 字符）；机器人线索 有。

夹爪、传感器与系统集成官方资料；案例效果为厂商陈述，保留硬件版本和实验条件。

### Microduck Blog

检查：2026-10-03T02:59:39.989Z；verified。1 个解析条目，1 个有日期。

- [Meet Microduck](https://pollen-robotics.com/microduck/blog/introducing-microduck/)；原始日期 2026-08-27T00:00:00.000Z；正文 readability（6682 字符）；机器人线索 有。

Pollen Robotics 的 Microduck 官方发布；当前 feed 仅一篇 2026-08-27 公告。产品、价格及预售说法按厂商自报处理，保留原始日期。

### Microduck Releases

检查：2026-10-03T02:59:43.313Z；verified。10 个解析条目，10 个有日期。

- [daemon 0.14.1-dev.1189.1794b74 (mediad-gst-deinit)](https://github.com/pollen-robotics/microduck/releases/tag/daemon-dev-mediad-gst-deinit)；原始日期 2026-10-02T14:57:29.000Z；正文 feed（384 字符）；机器人线索 有。
- [daemon 0.15.1](https://github.com/pollen-robotics/microduck/releases/tag/daemon-v0.15.1)；原始日期 2026-10-01T15:32:33.000Z；正文 feed（1215 字符）；机器人线索 有。
- [daemon 0.15.1-dev.1183.534d9e1 (standup-retry)](https://github.com/pollen-robotics/microduck/releases/tag/daemon-dev-standup-retry)；原始日期 2026-10-01T16:13:31.000Z；正文 feed（376 字符）；机器人线索 有。

官方 daemon/SDK 发布，不能据此宣称全部硬件开源或已经完成真实机器人验证。过滤标题中的 -dev. 开发构建，保留稳定版本。

## 复验与维护

显式网络检查（不会导入数据库，不会调用模型）：

```bash
node scripts/check-sources.ts --live --limit 25 --out .data/source-validation.json
node scripts/check-sources.ts --live --ids rss-robot-report,rss-lerobot-releases --out .data/source-validation.json
```

每个信源最多一次 feed 和一次原文请求，顺序执行且至少间隔 500ms；默认间隔 1 秒，feed 25 秒、原文 20 秒超时，复用大小限制和逐跳 SSRF 检查。不传 --live 会在任何网络请求前报错。未检查的端点只列在 source-candidates.json，不能按已接入成果计算。

修改 sources.json 的同一对象内 robotics 元数据后运行检查；如需更新仓库报告与本页，加 --out docs/source-validation.json --docs docs/sources-robotics.md。自动测试只读离线文件。

后台既有信源设置由 seed 保留；新增 ID 可幂等导入。当前机器配置的 enabled 字段与本报告一起复查；配置更新后重新生成报告。旧 AI 示范源由管理员明确停用，不能清空数据库。

X / 微信当前不启用。X 使用 x_search 与 SOCIALDATA_API_KEY，微信公众号使用 mp_account 与 DAJIALA_KEY（docs/sources.md）；先取得服务与预算授权再接入，不绕过登录或访问控制。

研究源不等于同行评审，GitHub release 不等于完整开源，厂商自报不等于独立验证。媒体转载、共同通稿需按实际事件归组。纯 AI、代码工具和普通汽车内容需要原材料中明确的机器人关联才能入选。
