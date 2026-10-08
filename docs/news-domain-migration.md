# 域名迁移（历史）· 2026-10-03

hub.openzoo.ai → [news.openzoo.ai](https://news.openzoo.ai/)。SITE_URL、Nginx、证书、canonical、RSS/API/sitemap及主页 9 个入口同步；文章 ID、数据、密钥、预算和数据库容器不变。

当时旧 hub DNS已移除，未配置公网旧域跳转；恢复旧链接需先恢复 DNS 与有效证书。主页/资讯证书分别自动续期，未绕过 TLS 校验。

588 后端、39 前端、8 来源检查、类型/构建、本机 36/36与公开 43/43 smoke 通过。浏览器、canonical和证书检查通过，SSH后台、回环端口与静态只读保留。配置备份仅存服务器私有环境。

[线上截图](screenshots/news-domain-live.jpg) · [当前运维](server-deployment.md)
