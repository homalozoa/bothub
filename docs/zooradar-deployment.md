# ZooRadar 七频道生产部署

2026-10-03，按运营者“部署实施”的授权，将应用版本 `0b539b9` 发布到 [OpenZoo](https://openzoo.ai/) 与 [ZooRadar](https://news.openzoo.ai/)。域名、TLS、Nginx访问边界和其他项目服务保留。开发验收见 [多频道记录](multichannel.md)。

## 实施与备份

- 从干净Git工作区归档代码，在服务器独立release目录构建 `bothot-app:0b539b9`。没有上传本机.env、数据库或演示数据。
- 正常停止旧worker/API/web；worker保留210秒排空宽限。随后备份数据库、自有文件卷、旧源码、环境文件和静态主页。
- 私有备份目录 `${DEPLOY_ROOT}` 为0700；数据库dump约4.6MB、文件包约4.3MB。pg_restore目录读取与gzip检查通过；本次没有进行恢复演练。
- 应用0042增量迁移，迁移总数38→39；幂等seed新增14个来源，保留20个原来源和管理员配置，来源总数34。主题43→52。
- API/worker/web镜像均为0b539b9。静态主页从同一构建镜像导出，资源附Git版本参数；文件0644、目录0755，Nginx用户不可写。
- 环境文件只有BOTHOT_RELEASE、WEB_RELEASE改变；.env仍0600。预算表前后逐项相同，模型、密钥、采集、推送与刊期设置未改。原数据库容器和无关模拟器的ID、启动时间保持。
- 没有对历史全库重跑模型或批量频道回填；原记录仍按兼容范围读取。新增来源首次采集及正常模型处理由既有worker执行，沿用原预算、回执与熔断。

初次通过远程stdin传脚本时，Docker默认交互读取吃掉了后续脚本，现场复查确认仅完成状态记录，旧服务仍运行。改为上传脚本文件执行，并明确Docker的interactive=false后完成全流程；没有把首个退出码0当作部署成功。临时私有端认证检查脚本也已清理。

## 生产验证

- `/api/health` 返回ok、db=ok、release=0b539b9。doctor确认生产Node24.21.0、39项迁移、管理员与会话密钥有效、原采集和模型开关开启。
- 公网 `node scripts/smoke.ts --base https://news.openzoo.ai --public` **43/43**。
- 七频道页面、频道精选与最新RSS、综合RSS、公开频道查询与旧机器人默认查询均通过。公开页面无演示横幅；生产不存在离线演示或真实来源本地回放的source ID。
- 14个新增来源首轮实际采集均health=ok、last_fetch_at与last_ok_at有效。查询快照见 [机器记录](channel-production-check.json)，数量会随正常采集变化，不是编辑准确率。
- 首轮三个非技术频道均已有公开内容。部分频道暂无满足条件的近期精选，保留真实空状态，不降低门槛或用历史材料凑数。

已验证完全非AI真实内容链路：PLOS Biology [原始研究](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3003944) 经真实RSS采集、原有模型预筛/结构化/两次评分/中文理解、事件归组与publication发布，进入biology。原文日期为2026-10-01T14:00:00Z，保留原链接；[正式详情](https://news.openzoo.ai/items/jwypy5aqz48fklo6tbns0n630) 为唯一规范地址。数据库origin=model、primary_channel=biology、relevance=pass，5份llm回执为completed，selected=true、historical=false。这里使用既有真实模型服务，没有本地固定响应；这是单条链路实测，不是分类或中文编辑质量的统计评测。

## 权限与浏览器

- Web只绑定127.0.0.1:18090；API与数据库没有宿主机端口映射。前端环境私有凭据字段为0。
- 公网/admin、编码/大小写变体、管理/认证/导入接口与隐藏文件拒绝访问；公网POST认证404、静态主页POST403。后台继续通过SSH进入。
- 经SSH在私有Web端实测正式密码登录、dev=false、Secure/HttpOnly/SameSite=Lax Cookie、缺CSRF写请求403、退出后旧会话401。新增PLOS来源可在既有鉴权管理入口读取频道提示，全文权限false。没有修改任何生产内容或来源设置来测试CSRF。
- 桌面1440与手机390检查主页和三个非技术频道；生物学页及真实详情宽度390/390，无横向溢出。主站仍使用自托管概念场景和严格self CSP，Cloudflare已有beacon注入尝试被CSP阻止，没有为其放宽策略。

| 线上页面 | 截图 |
|---|---|
| ZooRadar桌面 | [截图](screenshots/zooradar-live-zooradar-desktop.jpg) |
| OpenZoo桌面 | [截图](screenshots/zooradar-live-openzoo-desktop.jpg) |
| OpenZoo手机 | [截图](screenshots/zooradar-live-openzoo-mobile.jpg) |
| 生物学手机 | [截图](screenshots/zooradar-live-biology-mobile.jpg) |
| 自然史手机 | [截图](screenshots/zooradar-live-natural-history-mobile.jpg) |
| 社会学手机 | [截图](screenshots/zooradar-live-sociology-mobile.jpg) |
| 真实生物学详情 | [截图](screenshots/zooradar-live-biology-detail-mobile.jpg) |

## 回滚与后续维护

旧镜像bothot-app:1edefea与完整备份保留。应用回滚可保留0042新增列，不做生产库破坏性down迁移；停止新worker后恢复原环境版本和静态目录，再启动旧镜像。新增非机器人来源应通过原管理流程停用，保留文章及审计，避免旧预筛处理新增领域。只有需要完整恢复数据时，才按原运维说明在空库恢复配对数据库和文件备份；本次未执行恢复。

真实模型分类与摘要仍需人工评估，数值门槛未重新校准。新增来源使用既有服务与预算，未增加模型服务或提高调用上限；费用以提供商实际账单为准。未启用综合日报、长读或新通知平台。
