# 部署

[本机运行](robotics.md) · [生产运维](server-deployment.md)。通用 Compose 用法如下；生产保留既有 SSH 后台边界。

## 初始化

~~~bash
npm ci
node scripts/init-env.ts
# 在 .env 配置服务地址、模型和预算，不把密钥写进命令行。
docker compose up -d --build
~~~

init-env 不覆盖已有 .env，会生成随机密码和密钥。无 Node 时复制 .env.example：管理员密码至少 12 位，其余必需密钥分别用 openssl rand -hex 32 生成。.env 权限 0600；采集、模型、推送默认关闭，配置密钥不等于授权开启服务。

Compose 包含 db、setup、api、worker、web。setup 迁移和 seed 后退出；seed 保留已有来源设置。缺模型配置时只能读已有内容。[配置字段](../.env.example)

## HTTPS 与代理

~~~dotenv
SITE_URL=https://example.com
SITE_DOMAIN=example.com
PORT=127.0.0.1:3000
TRUST_PROXY=true
~~~

解析域名后运行 docker compose --profile https up -d --build，由 Caddy 管理证书；已有 Nginx 可代理回环地址，并正确传递访客地址。SITE_URL 决定 canonical、RSS、API 与分享链接。代理只信任实际受控上游。

MCP 默认允许站点主机和 localhost/回环；额外主机用 MCP_ALLOWED_HOSTS，逗号分隔，IPv6 加方括号。主机匹配忽略有效端口，禁止路径、用户信息及非法端口；Host 许可不扩大浏览器 Origin 许可。

构建可设 NPM_REGISTRY，来源网络可设 EGRESS_PROXY_URL，模型接口不走该代理。备案信息按实际地区要求配置。

## 更新与会话

先备份配对数据库与文件、旧代码、环境和镜像，再构建：

~~~bash
docker compose build
docker compose stop api worker web
docker compose run --rm setup
docker compose up -d
~~~

迁移失败先处理，不启动新版；HTTPS 部署继续带 --profile https。worker 保留 210 秒停机宽限，等待在途付费请求。停止旧 API/worker 再迁移，防止旧任务写回失效内容。保留前一版公开构建资源，避免旧页面导航请求 404。

会话绑定迁移为 0041，旧未绑定会话需重新登录。修改密码、白名单或会话配置后重启所有 API，确保一致：旧密码会话撤权；飞书会话按登录身份与当前名单检查，停用登录或更换应用 ID 会使其失效，同一应用只轮换 secret 不撤销仍获授权身份；轮换或移除 SESSION_SECRET 撤销两种会话。

鉴权观察到失效会话后会删除它，恢复旧配置不使其复活。未被进程加载或检查观察到的变化不能追溯撤权。

## 备份与恢复

配置 DB_BACKUP_STORE_* 的 S3 兼容存储后，每天 04:10 自动备份。完整备份含同一时间戳的数据库 .dump 和 aihot-files-*.tar.gz；文件包含 uploads 和仍存本地的 feedback-screenshots，不含缓存或飞书上的图片。

恢复时停止写入，用兼容 pg_restore 恢复到空库，再将配对文件包解压到数据目录：Docker 为 /data，本机为 AIHOT_DATA_DIR（默认 .data）。保留子目录与读取权限；只恢复数据库无法找回本地附件。先在隔离环境演练，文件可读检查不等于恢复成功。

禁止 docker compose down -v 删除数据卷。备份、环境和日志保持私有，分享前脱敏；查看日志用 docker compose logs --tail 100 api worker web。费用以账单为准，回执历史用量不等于本次新增费用；预算设 0 即暂停对应付费服务。
