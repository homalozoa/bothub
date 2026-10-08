# 生产运维

公开入口：[OpenZoo](https://openzoo.ai/) / [ZooRadar](https://news.openzoo.ai/)。使用 deploy/production.compose.yml、既有 Nginx 与 Certbot；主机身份和私有目录在本机运维配置中维护。

## 访问边界

web 仅绑定服务器回环 18090；API/数据库无宿主端口，前端无后端密钥或数据库网络。公网隐藏 admin、管理/认证/导入 API、隐藏文件和路径变体，保留公开阅读、RSS、API、MCP及反馈。

~~~bash
# 将 YOUR_DEPLOY_HOST 替换为本机已配置的 SSH 主机别名。
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:18090:127.0.0.1:18090 YOUR_DEPLOY_HOST
~~~

Chrome 打开 http://localhost:18090/admin；密码仅从服务器私有环境读取。隧道只监听回环，不开放公网后台端口。保留 Secure/HttpOnly/SameSite Cookie、CSRF 和注销撤权。

.env 0600，私有备份目录 0700、文件 0600。静态目录 0755、文件 0644，Nginx 只读；禁索引、隐藏文件及写入方法，CSP 只允许自托管脚本。代理地址仅信任 Cloudflare 官方范围，更新时核对；TLS 使用既有自动续期流程。

## 检查与更新

在服务器源码目录执行，始终显式指定 .env：

~~~bash
docker compose --env-file .env -f deploy/production.compose.yml ps
docker compose --env-file .env -f deploy/production.compose.yml logs --tail 100 api worker web
docker compose --env-file .env -f deploy/production.compose.yml exec -T api node scripts/doctor.ts --database
~~~

整站更新先保存数据库、文件卷、旧代码、环境、镜像及静态主页，再设置 BOTHOT_RELEASE/WEB_RELEASE 为发布提交：

~~~bash
docker compose --env-file .env -f deploy/production.compose.yml build api
docker compose --env-file .env -f deploy/production.compose.yml stop api worker web
docker compose --env-file .env -f deploy/production.compose.yml run --rm setup
docker compose --env-file .env -f deploy/production.compose.yml up -d
~~~

迁移成功再启动；worker 保留 210 秒停机宽限。seed 不覆盖已有来源配置，模型授权与预算沿用。Nginx 修改先 nginx -t，再 reload，只改所属 vhost。

仅网页更新设置 WEB_RELEASE，build web 后 up -d --no-deps web；无需 setup、迁移或重启后端。/api/health.release 代表 API，网页版本另看镜像。发布前导出旧 web 的公开 assets，新版启动后合并缺失旧文件，保留新文件，防止旧页面导航 404。静态主页只发布构建后的 deploy/home/public/。

## 备份与回滚

~~~bash
install -d -m 0700 backups
umask 077
docker compose --env-file .env -f deploy/production.compose.yml exec --interactive=false -T db pg_dump -U aihot -d aihot -Fc > backups/database.dump
docker compose --env-file .env -f deploy/production.compose.yml run --rm --no-deps --interactive=false -T api tar -C /data -czf - . > backups/files.tar.gz
~~~

保留配对备份及原环境；迁移保持增量兼容，应用回滚不删除新增列。需恢复数据时停止写入，在空库恢复数据库及配对文件，先隔离演练。禁止 down -v，文件可读不等于恢复验收。[详细恢复与会话](deploy.md)

更新后执行公开 smoke，并在私有端复查登录、Cookie、CSRF拒绝与注销；核对实际版本、来源配置和预算。历史发布记录见[七频道](zooradar-deployment.md)、[分类整理](taxonomy-audit.md)、[当前范围](life-focus.md)、[简报补源](robot-briefing-sources.md)，记录不是实时状态。
