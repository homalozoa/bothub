# 资讯站域名迁移

2026-10-03，按用户授权把 `hub.openzoo.ai` 改为 [news.openzoo.ai](https://news.openzoo.ai/)。DNS由用户修改：生产主机可解析 openzoo/news 到Cloudflare地址，旧hub已不存在DNS记录，因此没有配置依赖旧域名的公网跳转。

## 已完成

- `deploy/nginx/openzoo.conf` 的资讯vhost使用 news，HTTP跳转HTTPS。保留原私有路径、反斜杠、隐藏文件、代理头、日志和安全响应头规则，其他项目vhost未改动。
- 新签发 news 独立证书；主页原证书重签为只含 openzoo，去除已删除hub，避免以后续期失败。两证书有效期均至2027-01-01，沿用Certbot定时续期与Nginx重载hook。
- 服务器 `.env` 只替换 `SITE_URL`；API、worker、web均使用 `https://news.openzoo.ai`，保留原镜像版本、密钥、采集/模型开关和预算配置。
- worker按现有宽限时间退出，实际退出码0、OOM=false，然后重建应用容器以读取新环境。数据库容器ID和启动时间不变，没有迁移或修改新闻数据。
- 主页9处资讯链接改为news，保留既有样式和脚本版本参数。源码默认生产域名、README和当前运维入口也已更新。
- 变更前 `.env`、Nginx配置、主页HTML备份位于服务器 `${DEPLOY_ROOT}`，目录0700；含密钥的环境备份仅保留在服务器。Certbot也保留自身历史证书文件。

## 验证

- 新域名公网 smoke **43/43**，包括公开页面、RSS/API/MCP及 `/admin`、管理/认证/导入API和敏感文件隐藏。
- canonical、公开API条目链接、robots中的sitemap均为news；主页9个入口无旧hub链接。
- 实际浏览器从主页进入news成功；页面canonical与URL一致，Three.js场景ready。[截图](screenshots/news-domain-live.jpg)。
- Nginx语法通过，直接源站HTTPS健康检查通过正常证书验证。
- web仅绑定127.0.0.1:18090，仅app网络，没有后端私有环境变量；`.env`0600，静态HTML root:root0644，www-data不能写静态根目录。
- 类型检查及Web构建通过；独立 `bothot_news_ci` 本地桩后端588项、前端39项、来源8项全通过。本地smoke36项通过；没有测试调用真实模型。

后台访问方式仍是SSH隧道与 `http://localhost:18090/admin`。旧文章路径与ID保持，访问时使用新的域名；旧域名DNS未恢复前旧链接无法从公网跳转。
