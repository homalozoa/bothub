# 机闻品牌落地

2026-10-03（Asia/Singapore），用户确认站名“机闻”和折页Z标记后，已更新 [news.openzoo.ai](https://news.openzoo.ai/)。英文为 OpenZoo News；OpenZoo主页保留母品牌名称，采用同一Z标记并将资讯入口标注为机闻。

## 变化

- `industry/site.ts`统一站名、英文名、首页标题、关于页、RSS/API/Agent展示文案。机器人仍是内容行业词；现有MCP工具前缀与访问路径保持可用。
- `industry/branding.ts`定义共享的紫/薄荷绿/黄色折页Z矢量路径。网页导航、SVG、PNG/ICO和分享图片读取同一形状。
- 资产包括彩色、单色、反白SVG；512/192px PNG；180px不透明Apple icon；包含16/32/48px PNG帧的ICO。图标、分享图片及webmanifest使用普通品牌版本参数，处理旧浏览器缓存。
- 日报、周报、月报及合订本报头改为机闻品牌，使用仓库已有Noto Sans SC Bold字体。SVG路径、字体许可和生成脚本保留，无运行时字体下载。
- 分享卡片和海报使用Z标记与暖色配色；主页“内容初始化中”提示已改为机闻上线状态。
- 修正紧凑刊名识别：`机闻周报 · 2026-W39`属于刊物名称，不能当作新闻主标题。回归测试验证新旧刊名均回退到仍公开的引用，撤回全部引用时不以刊名冒充新闻。原撤回与派生文案保护保留。

## 发布与数据

API/worker使用 `fda0e29`，网页使用 `e8d750b`。先正常停止worker，实际退出码0，再启动新应用。数据库容器ID和启动时间保持不变，没有迁移、删除或重跑历史新闻。环境文件只更新两个发布版本，模型/采集/预算和密钥配置保留；随后webmanifest缓存更新只替换web容器，API/worker未再次重启。

发布前留下服务器私有备份：`${PRIVATE_BACKUP_FILE}`（约4.3MB）与 `${PRIVATE_BACKUP_FILE}`（约4.3MB），0600。已通过pg_restore目录读取与gzip完整性检查；这不是恢复演练。旧环境和静态主页在 `${PRIVATE_RELEASE_DIR}`，目录0700，旧镜像保留用于回滚。备份命令显式关闭Docker交互输入，避免脚本后续命令被当作容器stdin消费。

## 验证

| 项 | 实测 |
|---|---|
| 类型检查、Web与主页构建、Docker构建 | 通过 |
| 独立 `bothot_jiwen_final_ci` 后端测试 | 589/589，本地模型桩 |
| 前端测试 / 来源检查 | 39/39、8/8 |
| 本地smoke / 公网smoke | 36/36、43/43 |
| 图像 | PNG尺寸512/192/180，ICO含16/32/48帧，分享图片1200×630 |
| 线上品牌 | 页面标题、导航Z、manifest、API attribution、RSS、主页入口、logo.svg及分享图均为新品牌 |
| 浏览器 | 线上实际页面正常；390px宽度无横向溢出 |
| 权限 | 管理/认证/导入入口仍隐藏；web仅回环端口与app网络、无私有环境变量；.env0600、静态文件root只读 |

截图：[桌面](screenshots/jiwen-live-desktop.jpg)、[手机](screenshots/jiwen-live-mobile.jpg)。图标源与导出位于 [industry/brand](../industry/brand/)。

名称和标记已完成；运营者、联系渠道、隐私/使用规则、人工校准、信源/周报处理、自动备份恢复与告警仍见 [当前待办](launch-todos.md)。商标可注册性未在本次工程更新中核查。
