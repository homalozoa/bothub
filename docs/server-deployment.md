# OpenZoo 服务器部署

2026-10-02，按用户授权部署到 `root@YOUR_DEPLOY_HOST`。

## 在线入口与目录

- `https://openzoo.ai/`：静态 OpenZoo 首页，源码 `deploy/home/public/`，发布目录 `/var/www/openzoo/public`。
- `https://news.openzoo.ai/`：bothot 阅读站，源码目录 `${DEPLOY_ROOT}`，配置 `${DEPLOY_ROOT}`。
- 使用既有主机 Nginx、Docker、Certbot；新增 `/etc/nginx/conf.d/openzoo.conf`，保留其他站点、服务及端口配置。
- Docker Compose 项目 `bothot`，配置 `deploy/production.compose.yml`；数据库与文件卷分别 `bothot_db`、`bothot_data`。
- 应用发布版本以 `/api/health` 的 `release` 为准，镜像标签采用普通 Git 提交版本；旧镜像可保留用于回滚。服务器使用代码归档，不含本机数据库、演示内容或密钥。

首次部署时Docker已实启，38项迁移成功，导入18个来源及43个主题，当时文章库为空、采集和模型等开关关闭。运营者随后已配置模型并启用采集/处理，当前运行状态以诊断和后台记录为准。前端容器没有数据库/模型/管理员/会话密钥，不连接数据库网络；API/worker/setup在后端使用受限配置。

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

`.env` 为 `0600 root:root`，源码目录为0750。静态文件0644、目录0755，由root拥有；已确认Nginx用户不能写静态根目录，仅发布`public/`内容。静态站禁止目录索引/隐藏文件，未知路径404、POST403。2026-10-03视觉改版加入自托管Three.js概念场景，CSP仅增加`script-src 'self'`，没有CDN、unsafe-inline或unsafe-eval；没有增加追踪。动态站保留SSR脚本，使用nosniff、同源框架限制、referrer与权限策略。

DNS目前由Cloudflare代理，Nginx仅在[官方IP范围](https://www.cloudflare.com/ips/)内信任CF-Connecting-IP，再覆盖传给应用的Forwarded/IP头，防止直接访客伪造限速地址。配置 `deploy/nginx/cloudflare-realip.conf` 安装为 `/etc/nginx/snippets/openzoo-cloudflare-realip.conf`，仅这两个新vhost引用。更新时核对官方范围。

2026-10-03 阅读站改为 `news.openzoo.ai`。主页和资讯站分别使用 `/etc/letsencrypt/live/openzoo.ai/`、`/etc/letsencrypt/live/news.openzoo.ai/` 的独立证书，有效期均至2027-01-01。旧hub DNS已移除，主页证书不再包含它，避免续期依赖不存在的域名；沿用已有 `certbot.timer` 与 `renewal-hooks/deploy/reload-nginx.sh` 自动续期后重载Nginx。HTTP重定向HTTPS，HTTP ACME路径保留。`nginx -t`、证书校验、公网与直接源站HTTPS均已实测；没有绕过证书校验。续期任务已确认启用，本次未额外运行续期dry-run。

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
docker compose --env-file .env -f deploy/production.compose.yml exec --interactive=false -T db \
  pg_dump -U aihot -d aihot -Fc > ${PRIVATE_BACKUP_FILE}
docker compose --env-file .env -f deploy/production.compose.yml run --rm --no-deps --interactive=false -T api \
  tar -C /data -czf - . > ${PRIVATE_BACKUP_FILE}
```

本次已在服务器留下首次部署后的数据库与文件备份，目录仅root可访问；没有复制到仓库。恢复须停止写入进程，对空库使用对应版本pg_restore，再恢复文件卷及权限。完整备份/恢复说明见 `docs/deploy.md`；本次没有对生产库执行恢复或破坏性测试。

运营者已配置并启用了内容处理；后续更换 `LLM_BASE_URL`、`LLM_MODEL`、`LLM_API_KEY` 及预算仍使用原后台和环境配置。视觉改版不改变这些配置。公众号、X、外部推送和导入接口继续按现有配置处理。隐私/条款仍是待运营者确认草稿，编辑质量尚需人工复核和校准。

## 只更新网页与三维主页

`WEB_RELEASE` 是独立的前端镜像版本，未设置时继承 `BOTHOT_RELEASE`。视觉更新设置服务器`.env`中的`WEB_RELEASE`为新Git版本，保留`BOTHOT_RELEASE`及所有模型配置，然后执行：

```bash
docker compose --env-file .env -f deploy/production.compose.yml build web
docker compose --env-file .env -f deploy/production.compose.yml up -d --no-deps web
```

这不会启动setup、seed或重启API/worker/database。前端版本由Web镜像标签确认，`/api/health.release`继续代表API版本。完整业务更新若也需要更新网页，应同步设置`WEB_RELEASE`或清除它以继承新的`BOTHOT_RELEASE`。

构建会生成`/app/deploy/home/public/assets/scene.js`与Three.js MIT许可，并为主页CSS/JS附上Git版本参数，避免Cloudflare浏览器缓存沿用旧资源。仅从构建后的镜像导出`deploy/home/public/`到静态站目录；源码中的`public/assets/`是忽略的构建产物。更新过程中保留旧首页以供回滚。截图、性能及权限验证见[视觉改版记录](visual-redesign.md)。

## 本次实测

- 生产Docker镜像构建及API/worker/web启动、数据库健康、seed与38项迁移通过；Node24.21.0。
- 公网 `node scripts/smoke.ts --base https://news.openzoo.ai --public`：**43/43**，包括公开阅读、RSS/API/MCP和私有入口隐藏。
- 原始反斜杠路径400、编码后台路径404；敏感文件404；静态未知路径404、POST403。
- Docker端口绑定、服务器监听及实际HTTP协议检查确认18090仅回环；DB/API未映射端口。机器网络代理会接受无服务端口的TCP连接，所以不把裸connect成功当成公网服务可达证据。
- 前端环境私有密钥集合为空，仅连接app网络；Nginx不能写静态目录；`.env`0600。
- SSH隧道内的浏览器登录、真实管理员鉴权、CSRF拒绝和退出撤权通过；没有改动新闻或来源配置。
- 线上主页1280桌面及390手机均检查，手机DOM宽度390无横向溢出；首页按钮实际进入hub站点。截图在 `docs/screenshots/openzoo-live-*.jpg`。
- 既有模拟器容器仍连续运行，未重启其他项目服务。

之前本机627项程序测试仍见 `docs/verification.md`；本次改动集中在部署、静态首页与运维smoke，补跑类型检查与实际线上验证。没有新增模型调用、生产新闻或编辑质量结论。

## 2026-10-03 亮色主题与 Microduck 补源

当前 `WEB_RELEASE=d574c24`，仅更新网页容器和静态主页，API/worker 的 `BOTHOT_RELEASE=8f8a410` 保留。生产43项公开/私有入口检查通过，后端容器未重启；权限复查与截图见 [亮色改版](dopamine-redesign.md)。

另通过既有 `seedSources` 幂等导入两个已验证的 Microduck 官方来源，启用来源从18增至20，保持原管理员配置与摘要权限。自动处理已收录一篇历史公告与两个稳定版本更新，历史公告评分71进入精选；保留日期与首次回灌标记，详见 [覆盖调查](microduck-coverage-audit.md)。

## 当前资讯域名

`SITE_URL=https://news.openzoo.ai` 已在 API、worker、web 生效，主页9处阅读入口也已替换。既有文章 ID 和数据不变，RSS/API/canonical/sitemap 使用新域名。旧 `hub.openzoo.ai` 已无DNS，未配置公网旧域名跳转；以后如要恢复旧链接，应先恢复DNS并为旧域名单独签发证书。详见 [迁移记录](news-domain-migration.md)。

## 当前站名与发布版本

2026-10-03，站名正式使用“机闻”，英文OpenZoo News，折页Z为统一标记。API/worker版本为 `fda0e29`，web版本为 `e8d750b`，域名保持news.openzoo.ai；具体资产、备份和验证见 [品牌落地](jiwen-brand-rollout.md)。原始运营资料和人工校准事项仍在 [待办](launch-todos.md)。

## 个人运营信息与当前来源

个人运营者为 [Homalozoa](https://github.com/homalozoa)，邮箱 homalozoax@gmail.com。默认来源优先非简体中文，量子位停采后当前19源启用，历史文章保留。当前API/worker版本为 `2f03f0c`、web为 `d749c97`；部署与验证见 [更新记录](personal-operator-rollout.md)。

## 当前资讯时效修正

2026-10-03，API/worker/web同步发布到 `1edefea`。评分前检查原日期48小时收录延迟与7天窗口，发布和当前资讯读取独立复查。31条历史回灌退出当前精选，保留评分和归档；新增ROS论坛公告源后默认20个非简体中文来源。完整Lyrical公告已经作为2026-05-22历史资料收录，未伪装成今天的新闻。640项程序测试和43项生产smoke通过，DB未重启、原模型预算与SSH后台权限保留。详见 [时效与覆盖核验](news-time-audit.md)。

## ZooRadar 七频道生产版本

2026-10-03，API/worker/web与OpenZoo静态主页同步发布到 `0b539b9`。0042迁移完成，34个启用来源与52个主题，14个新源首轮实际采集均成功；真实PLOS Biology材料已由原模型链路归组并发布。公网43项smoke、七频道页面/订阅和私有端会话检查通过，原预算、密钥、数据库及其他项目容器保留。备份、截图、具体边界与回滚见 [ZooRadar部署记录](zooradar-deployment.md)。

## 当前四频道版本

2026-10-03，API/worker/web及静态主页更新到 `70e9329`。领域导航为综合＋四频道，三项旧频道入口308至主题；自然史通过读取层并入生物学，旧文章/订阅保留。暂停三源、补入Sociological Science，32个启用来源与55主题；无新数据库迁移。652项程序检查、公网43项smoke与私有端认证复查通过。当前备份、兼容和截图见 [四频道记录](four-domain-consolidation.md)。

## 当前精选展示版本

2026-10-03，应用发布到 `d2803dd`。综合精选直接展示四领域入选内容，首页域筛选正确转发，旧机器人方向筛选替换为通用内容形态；没有调整评分门槛、来源、预算或数据。604项后端、42项前端与公网43项smoke通过，线上生物学精选可见。备份及截图见 [精选展示修复](selected-feed-fix.md)。

## 当前亮暗色模式

2026-10-03，网页单独更新到 `d5d118f`，API/worker仍为 `d2803dd`。新访客默认跟随系统，打开页面时即采用系统亮暗色，系统变化和其他标签页的偏好变化会即时同步；既有手动偏好保留。只重建web容器，无迁移或seed，API/worker/DB及其他项目容器未重启，环境仅WEB_RELEASE变化。604项后端、42项前端、公网43项smoke及私有登录/CSRF/退出复查通过。回滚资料和线上截图见 [外观更新](system-theme.md)。
