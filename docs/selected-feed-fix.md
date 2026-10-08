# 综合精选修复（历史）· 2026-10-03

d2803dd 修复首页忽略 domain，以及旧机器人方向筛选掩盖新增领域的情况。综合页展示真实领域精选并按事件去重，空精选显示已收录数与最新入口；未降低门槛或把未入选资料当精选。

领域、搜索、形态与分页上下文正确转发；旧 category 参数继续兼容，/all 切领域保留最新/搜索视图。当前领域见[范围](life-focus.md)。

604 后端、42 前端、35 项发布回归、类型/构建、本机和公开 43/43 smoke 通过；手机 390px 无溢出。无迁移、来源策略或历史重跑，预算与数据库容器保留；私有配对备份可读，未恢复演练。

[桌面](screenshots/zooradar-selected-live-desktop.jpg) · [手机](screenshots/zooradar-selected-live-biology-mobile.jpg)
