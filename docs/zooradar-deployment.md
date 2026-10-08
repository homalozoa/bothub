# 七频道部署（历史）· 2026-10-03

0b539b9 上线，两站保留域名、TLS、SSH后台与原预算。正常排空 worker 后执行增量迁移 0042，迁移 38→39，来源 20→34，主题 43→52；幂等 seed 保留管理员设置，不批量重跑或回填历史资料。

新增 14 源首次采集均正常，查询快照见[机器记录](channel-production-check.json)。PLOS Biology 原研究经真实 RSS、5 份完成模型回执、归组与 publication 进入 biology，保留 2026-10-01T14:00:00Z 和唯一详情地址；这是单条链路，非统计编辑质量评测。

公开 smoke 43/43、频道/RSS/旧默认接口、私有登录/Cookie/CSRF/注销通过；桌面/390px无溢出，无生产演示数据。静态同源 CSP、只读权限及前后端网络隔离保留。

配对备份、旧镜像与代码可读，未恢复演练。应用回滚可保留新列，停用新源走后台审计；不做破坏性 down 迁移。初次远程脚本被 Docker stdin 消耗，复核后改文件执行并完成部署，不以退出码推断成功。

[真实生物学详情](screenshots/zooradar-live-biology-detail-mobile.jpg) · [开发记录](multichannel.md) · [当前范围](life-focus.md)
