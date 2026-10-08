# AI与机器人入口合并（历史）

2026-10-05：API/worker/主页 49dccb6，网页 8b7152c。检查时两频道精选首屏 20 张中 19 张重复；当前入选范围机器人 154、AI 84、交叉 81，说明当时合并入口更合适，不是领域永久无法区分的结论。

ai-robotics 为 robotics/agents 的只读并集，不写入主分类；通过 publication 去重。旧网页 308 保留查询，原 RSS/API/MCP 默认范围、日报、分类、日期、评分和人工设置不变，新增合并精选/最新 RSS。

605 后端、44 前端、9 来源检查及类型/构建通过，公开 smoke 43/43、登录/Cookie/CSRF/注销通过。生产并集 1264 条为当时查询快照，分页无重复；桌面、390/320px、亮暗模式无横向溢出。

无迁移，配对备份与旧资源保留，预算及数据库容器不变；文件可读检查不等于恢复演练。当前社会学已退出，见[内容范围](life-focus.md)。

[桌面](screenshots/zooradar-merged-ai-robotics-desktop.jpg) · [手机](screenshots/zooradar-merged-ai-robotics-mobile.jpg)
