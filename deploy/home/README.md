# OpenZoo 首页

`public/` 是 `https://openzoo.ai/` 的独立静态首页。只包含公开的 HTML、CSS、SVG、robots.txt 和 sitemap.xml，不需要构建、JavaScript、外部字体或统计服务。文字基于当前机器人热点站的三方向配置；热点站仍处于内容初始化阶段，不宣称已完成真实模型编辑链路。

部署时仅复制 `public/` 内容到专用 Nginx 静态根目录。文件由部署用户拥有、目录 0755、文件 0644；Nginx 只读，不授予写权限。关闭目录索引，限制静态站方法为 GET/HEAD，禁止隐藏文件，未知路径返回 404。不要把仓库根目录或此 README 作为公开目录。

建议响应头：

```nginx
add_header Content-Security-Policy "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

首页的阅读链接均指向 `https://hub.openzoo.ai/` 的已实现公开路由。正式内容运营开始后，可修改 footer 的初始化说明；无需改动页面布局。
