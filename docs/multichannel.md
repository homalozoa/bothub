# ZooRadar 七频道改造

## 审计与实现范围

2026-10-03 检查到 OpenZoo 品牌主页与 news.openzoo.ai 资讯站，源码为 React Router 8 + React 19、Node 24、PostgreSQL、既有 worker / publication / RSS / API / MCP。改造前网页为机器人视觉、三类导航，资讯名称机闻 / OpenZoo News。截图保存在 output/playwright/before-*.png。Git 工作区起始无未提交改动。

按运营者的新指令重构两站页面与信息架构，资讯命名 ZooRadar；保留 OpenZoo 品牌、折页 Z、暖纸紫色配色、明暗主题、原文入口、详情身份、机器人订阅和 SSH 管理边界。news.openzoo.ai 域名暂时沿用，名称变化不要求 DNS 迁移。

新增独立领域字段 primary_channel / related_channels；既有 channel=news/x/firstParty 仍表示来源方式，category / tags 仍表示方向和形态。七频道共用采集、预筛、结构化、评分、归组和发布，归组身份不随领域改变。预筛和结构化调用承担路由，不增加七次逐频道模型调用。各领域规则进入原有提示词，数值门槛保持，真实质量仍须人工校准。

页面计划：OpenZoo 保留品牌主页和概念机器人，加入七领域入口；ZooRadar 综合页提供频道精选入口，/channels/:slug 提供精选和最新、频道搜索、来源/内容形态筛选与独立 RSS。综合订阅单独提供，原机器人订阅及日报不扩大范围。不显示尚未实现的长读或综合简报按钮。

## 迁移与发布

0042 只增加可空字段、默认空数组和查询索引，不批量推断历史频道。旧 worker 仍可写原列；旧应用可忽略新增列。备份数据库及文件卷后，停止旧 API / worker / web，执行迁移，检查历史分类 dry-run，再运行新应用。回滚应用可保留新增列；分类回填须保留人工编辑并用同一工具撤销，不改原日期、不发推送、不重跑模型。禁止直接在生产库运行测试。

本轮实现与测试在本机隔离数据库完成，未修改生产环境。正式发布使用既有备份、预算、SSH 后台和容器流程。
