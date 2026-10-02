# OpenZoo 服务器部署

2026-10-02，按用户授权部署到 `root@YOUR_DEPLOY_HOST`。

## 在线入口与目录

- `https://openzoo.ai/`：静态 OpenZoo 首页，源码 `deploy/home/public/`，发布目录 `/var/www/openzoo/public`。
- `https://hub.openzoo.ai/`：bothot 阅读站，源码目录 `${DEPLOY_ROOT}`，配置 `${DEPLOY_ROOT}`。
- 使用既有主机 Nginx、Docker、Certbot；新增 `/etc/nginx/conf.d/openzoo.conf`，保留其他站点、服务及端口配置。
- Docker Compose 项目 `bothot`，配置 `deploy/production.compose.yml`；数据库与文件卷分别 `bothot_db`、`bothot_data`。
- 应用发布版本以 `/api/health` 的 `release` 为准，镜像标签采用普通 Git 提交版本；旧镜像可保留用于回滚。服务器使用代码归档，不含本机数据库、演示内容或密钥。

Docker 已实启，38项迁移成功，导入18个来源及43个主题。生产文章库为空，采集、模型、飞书与IndexNow开关关闭，未调用付费服务。前端容器没有数据库/模型/管理员/会话密钥，不连接数据库网络；API/worker/setup在后端使用受限配置。

## 后台只通过 SSH 访问

公网 `/admin`（含大小写、编码及`.data`路径）、`/api/admin/*`、`/api/auth/*`、`/api/ingest/*`、旧`/sources`入口与隐藏文件路径返回404。包含反斜杠的URL返回400，避免SSR把它再次规范化为后台路径。RSS、公开API、MCP、反馈及阅读页面正常开放；MCP所需POST没有被全局禁止。

Web端口仅绑定服务器 `127.0.0.1:18090`；API和数据库没有映射主机端口。电脑建立隧道：

```bash
ssh -N -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:18090:127.0.0.1:18090 root@YOUR_DEPLOY_HOST
```

保持终端打开，在 **Chrome** 访问 `http://localhost:18090/admin`。既有随机管理员密码在服务器 `${DEPLOY_ROOT}` 的 `ADMIN_PASSWORD`，通过SSH读取，不在文档、聊天或Git中公开。首次检查已实测 Chrome 正常登录、信源列表和退出；Secure/HttpOnly/SameSite=Lax Cookie保持原样，`dev=false`，无CSRF写请求403，退出后旧Cookie读取管理员信息401。利用Chromium对localhost的Secure Cookie支持，没有修改会话安全规则；Safari未验证。

本次临时密码文件已删除、浏览器已退出后台。不要把隧道监听地址改成 `0.0.0.0`，也不要开放18090或数据库端口来代替隧道。

## 权限、代理与证书

`.env` 为 `0600 root:root`，源码目录为0750。静态文件0644、目录0755，由root拥有；已确认Nginx用户不能写静态根目录，仅发布`public/`内容。静态站禁止目录索引/隐藏文件，未知路径404、POST403；无JS、外部资源或追踪，使用仅允许自身样式/图片的CSP。动态站保留SSR脚本，使用nosniff、同源框架限制、referrer与权限策略。

DNS目前由Cloudflare代理，Nginx仅在[官方IP范围](https://www.cloudflare.com/ips/)内信任CF-Connecting-IP，再覆盖传给应用的Forwarded/IP头，防止直接访客伪造限速地址。配置 `deploy/nginx/cloudflare-realip.conf` 安装为 `/etc/nginx/snippets/openzoo-cloudflare-realip.conf`，仅这两个新vhost引用。更新时核对官方范围。

证书位于 `/etc/letsencrypt/live/openzoo.ai/`，SAN覆盖两个域名。本次证书有效期至2026-12-31；沿用已有 `certbot.timer` 与 `renewal-hooks/deploy/reload-nginx.sh` 自动续期后重载Nginx。HTTP重定向HTTPS，HTTP ACME路径保留。`nginx -t`、证书校验、公网与直接源站HTTPS均已实测；没有绕过证书校验。续期任务已确认启用，本次未额外运行续期dry-run。

## 运维与更新

所有Compose命令从 `${DEPLOY_ROOT}` 执行并明确指定环境文件（配置位于deploy目录，不能依赖隐式.env查找）：

```bash
cd ${DEPLOY_ROOT}
docker compose --env-file .env -f deploy/production.compose.yml ps
docker compose --env-file .env -f deploy/production.compose.yml logs --tail 100 api worker web
docker compose --env-file .env -f deploy/production.compose.yml exec -T api node scripts/doctor.ts --database
```

更新前先备份；将新Git版本代码部署到源码目录，保留原`.env`，设置 `BOTHOT_RELEASE` 为对应Git提交。构建完成后停止旧API/worker/web，让setup迁移/seed成功再启动：

```bash
docker compose --env-file .env -f deploy/production.compose.yml build api
docker compose --env-file .env -f deploy/production.compose.yml stop api worker web
docker compose --env-file .env -f deploy/production.compose.yml run --rm setup
docker compose --env-file .env -f deploy/production.compose.yml up -d
```

没有数据库结构变化时仍可幂等执行迁移；seed不覆盖管理员已有来源设置。worker停机宽限保留210秒，不能强杀在途付费回执。更新Nginx配置先 `nginx -t` 再 `systemctl reload nginx`，无需修改其他vhost。更换静态首页时只发布 `deploy/home/public/`，保持只读权限。

保留数据库及对应文件卷的完整备份，禁止 `down -v` 删除数据。一次手动备份：

```bash
install -d -m 0700 ${DEPLOY_ROOT}
umask 077
docker compose --env-file .env -f deploy/production.compose.yml exec -T db \
  pg_dump -U aihot -d aihot -Fc > ${PRIVATE_BACKUP_FILE}
docker compose --env-file .env -f deploy/production.compose.yml run --rm --no-deps api \
  tar -C /data -czf - . > ${PRIVATE_BACKUP_FILE}
```

本次已在服务器留下首次部署后的数据库与文件备份，目录仅root可访问；没有复制到仓库。恢复须停止写入进程，对空库使用对应版本pg_restore，再恢复文件卷及权限。完整备份/恢复说明见 `docs/deploy.md`；本次没有对生产库执行恢复或破坏性测试。

启用内容运营仍需运营者选择 `LLM_BASE_URL`、`LLM_MODEL`、`LLM_API_KEY` 并授权预算，再小范围启用处理与采集；部署授权没有被当作模型消费授权。公众号、X、外部推送和导入接口继续禁用。隐私/条款仍是待运营者确认草稿，首页如实提示内容初始化。

## 本次实测

- 生产Docker镜像构建及API/worker/web启动、数据库健康、seed与38项迁移通过；Node24.21.0。
- 公网 `node scripts/smoke.ts --base https://hub.openzoo.ai --public`：**43/43**，包括公开阅读、RSS/API/MCP和私有入口隐藏。
- 原始反斜杠路径400、编码后台路径404；敏感文件404；静态未知路径404、POST403。
- Docker端口绑定、服务器监听及实际HTTP协议检查确认18090仅回环；DB/API未映射端口。机器网络代理会接受无服务端口的TCP连接，所以不把裸connect成功当成公网服务可达证据。
- 前端环境私有密钥集合为空，仅连接app网络；Nginx不能写静态目录；`.env`0600。
- SSH隧道内的浏览器登录、真实管理员鉴权、CSRF拒绝和退出撤权通过；没有改动新闻或来源配置。
- 线上主页1280桌面及390手机均检查，手机DOM宽度390无横向溢出；首页按钮实际进入hub站点。截图在 `docs/screenshots/openzoo-live-*.jpg`。
- 既有模拟器容器仍连续运行，未重启其他项目服务。

之前本机627项程序测试仍见 `docs/verification.md`；本次改动集中在部署、静态首页与运维smoke，补跑类型检查与实际线上验证。没有新增模型调用、生产新闻或编辑质量结论。
