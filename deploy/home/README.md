# OpenZoo 首页

`public/` 是 `https://openzoo.ai/` 的独立静态首页，采用 NEURAL WORKSHOP 视觉：暗色、青色与品红强调、技术标记与 Three.js 机器人概念视觉。正文、导航与分类链接不依赖 JavaScript。文字基于当前机器人热点站的三方向配置；热点站仍处于内容初始化阶段，不宣称已完成真实模型编辑链路。机器人是视觉示意，不是实际产品或性能演示。

`src/scene.ts` 调用热点站共享的 `mountRobotScene`，构建后输出 `public/assets/scene.js`。Three.js 打包在本地资源中，不使用 CDN、外部字体、模型下载或统计服务。共享场景负责缩放、资源释放与减少动态效果偏好；页面离开时释放场景。WebGL 或脚本不可用时保留 SVG 机器人，所有阅读操作仍可用。Hero 场景与装饰不包含有意义的数据，使用 `aria-hidden`，不会代替正文。

部署时仅复制 `public/` 内容到专用 Nginx 静态根目录。文件由部署用户拥有、目录 0755、文件 0644；Nginx 只读，不授予写权限。关闭目录索引，限制静态站方法为 GET/HEAD，禁止隐藏文件，未知路径返回 404。不要把仓库根目录或此 README 作为公开目录。

建议响应头：

```nginx
add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

首页的阅读链接均指向 `https://hub.openzoo.ai/` 的已实现公开路由。正式内容运营开始后，可修改 footer 的初始化说明；无需改动页面布局。
