# OpenZoo 首页

public/ 为 [openzoo.ai](https://openzoo.ai/) 的静态首页，链接至 [ZooRadar](https://news.openzoo.ai/) 当前阅读入口。正文和导航不依赖 JavaScript。

npm run build:home 将 src/scene.ts 打包到 public/assets/scene.js，复用 mountRobotScene。Three.js 与许可自托管，无 CDN、外部字体、模型下载或统计服务。概念机器人不代表实机性能；动效保留减少动态效果、暂停、资源释放及 WebGL/SVG 回退。

仅发布构建后的 public/：目录 0755、文件 0644，Nginx 只读。禁止索引、隐藏文件和写入方法，未知路径 404；不要公开仓库根目录。

保持 deploy/nginx/openzoo.conf 的同源 CSP、nosniff、Referrer-Policy 和 Permissions-Policy。[部署与回滚](../../docs/server-deployment.md)
