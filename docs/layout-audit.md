# 排版复查（历史）· 2026-10-04

网页/主页 d94fc07，API/worker d2803dd。修复手机 5 个底栏入口换行、时间栏挤正文、频道卡片、表单列宽、日报报头遮挡/合订本溢出、正文侧栏、长标题及缩窄时选项不可见。

37 组公开模板/状态 × 桌面/手机/亮暗共 148 次线上截屏；另检 10 种宽度及 55 主题逐页无页面级溢出。148 图对应 b953356，最终 d94fc07 追加窄屏标题与选项同步后补验相关场景；未声称逐篇审查历史文章。

604 后端、43 前端、类型/构建、公开 smoke 43/43 和私有登录/CSRF/退出通过。只更新 web/主页，无迁移、seed或内容写入，预算与后端容器不变。

发现旧 assets 在新版容器 404，合并缺失旧资源后恢复 200；后续网页发布继续保留前版公开资源。旧镜像与私有备份保留，未做恢复演练。[运维](server-deployment.md)

[手机前](screenshots/zooradar-layout-mobile-before.jpg) · [手机后](screenshots/zooradar-layout-mobile-after.jpg) · [日报前](screenshots/zooradar-layout-report-before.jpg) · [日报后](screenshots/zooradar-layout-report-mobile.jpg)
