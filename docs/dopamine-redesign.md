# OpenZoo 亮色改版

2026-10-03，根据用户反馈替换此前的赛博朋克主题，两站已上线：[OpenZoo](https://openzoo.ai/) / [机器人热点](https://news.openzoo.ai/)。前端发布 `d574c24`，API/worker 继续使用 `8f8a410`。

奶油白阅读底色，亮黄色与紫色主视觉、薄荷绿和蜜桃色卡片、圆角控件，搭配紫色/黄色 Three.js 机械伙伴。资讯正文保持深色文字和安静的白色卡片；不增加模拟运营数据。新访客默认浅色，已保存的深色、浅色、系统主题及收藏/已读/导入导出偏好保留。

共享 Three.js 场景的几何、按需加载、30fps 上限、离屏暂停、减少动态效果、手动暂停、WebGL 回退及卸载释放保留，仅调整材质、光照与配色。静态主页仍自托管脚本和 Three.js MIT 许可，没有增加 CDN 或扩大 CSP。

| 验证 | 结果 |
|---|---|
| 类型检查、Web / 静态主页构建 | 通过 |
| 独立空库 `bothot_dopamine2_ci` 后端测试 | 588/588，本地模型 HTTP 桩 |
| 前端主题兼容等测试 | 39/39 |
| 离线来源检查 | 8/8 |
| 本地站点 smoke | 36/36 |
| 公网站点 smoke | 43/43，包括公开 API/RSS/MCP 及私有入口隐藏 |
| 浏览器线上主页 / Hub | Three.js `scene-ready`，实际内容正常显示 |
| 本机两站 / 线上主页 390px 检查 | DOM 宽度390，无横向溢出 |
| API / worker / db 连续运行 | 发布前后容器 ID 与启动时间逐项一致 |
| 前端隔离 | 私有环境变量集合为空，仅 app 网络，端口127.0.0.1:18090 |
| 文件和入口权限 | `.env`0600，静态文件root:root0644，www-data不能写静态根目录，Nginx检查通过 |

后端测试首次运行误设 `MODEL_CALLS_ENABLED=false`，使需要本地模型桩的用例失败；在另一个全新测试库使用测试自身的本地桩配置重跑后588项通过。没有修改后端实现或测试断言来掩盖失败，也没有测试调用真实付费模型。

发布只替换 web 容器和静态 public 文件，保留原 `.env` 配置及模型/预算设置。旧静态主页保存为 `${STATIC_BACKUP_DIR}`，旧网页镜像保留。新 Microduck 信源通过既有幂等导入加入，随后由运营者已启用的 worker 正常处理；具体覆盖缺口、实际评分和局限见 [调查记录](microduck-coverage-audit.md)。

截图：[热点站桌面](screenshots/bothot-dopamine-live-desktop.jpg)、[主页桌面](screenshots/openzoo-dopamine-live-desktop.jpg)、[主页手机](screenshots/openzoo-dopamine-live-mobile.jpg)。
