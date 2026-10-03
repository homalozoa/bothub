# ZooRadar 七频道改造

2026-10-03 已正式部署到 openzoo.ai 与 news.openzoo.ai，应用版本0b539b9，见 [生产记录](zooradar-deployment.md)。以下“未部署”和本地固定响应说明是此前开发阶段的实测记录，生产结果另列，保留原测试边界。

## 审计与实现范围

2026-10-03 检查到 OpenZoo 品牌主页与 news.openzoo.ai 资讯站，源码为 React Router 8 + React 19、Node 24、PostgreSQL、既有 worker / publication / RSS / API / MCP。改造前网页为机器人视觉、三类导航，资讯名称机闻 / OpenZoo News。截图保存在 output/playwright/before-*.png。Git 工作区起始无未提交改动。

按运营者的新指令重构两站页面与信息架构，资讯命名 ZooRadar；保留 OpenZoo 品牌、折页 Z、暖纸紫色配色、明暗主题、原文入口、详情身份、机器人订阅和 SSH 管理边界。news.openzoo.ai 域名暂时沿用，名称变化不要求 DNS 迁移。

新增独立领域字段 primary_channel / related_channels；既有 channel=news/x/firstParty 仍表示来源方式，category / tags 仍表示方向和形态。七频道共用采集、预筛、结构化、评分、归组和发布，归组身份不随领域改变。预筛和结构化调用承担路由，不增加七次逐频道模型调用。各领域规则进入原有提示词，数值门槛保持，真实质量仍须人工校准。

已完成页面：OpenZoo 保留品牌主页和概念机器人，加入七领域入口；ZooRadar 综合页提供频道精选入口，/channels/:slug 提供精选和最新、频道搜索、来源/内容形态筛选与独立 RSS。综合订阅单独提供，原机器人订阅及日报不扩大范围。不显示尚未实现的长读或综合简报按钮。

## 迁移与发布

0042 只增加可空字段、默认空数组和查询索引，不批量推断历史频道。旧 worker 仍可写原列；旧应用可忽略新增列。备份数据库及文件卷后，停止旧 API / worker / web，执行迁移，检查历史分类 dry-run，再运行新应用。回滚应用可保留新增列；分类回填须保留人工编辑并用同一工具撤销，不改原日期、不发推送、不重跑模型。禁止直接在生产库运行测试。

本轮实现与测试在本机隔离数据库完成，未修改生产环境。正式发布使用既有备份、预算、SSH 后台和容器流程。

## 页面、查询与兼容

已实现七个 `/channels/<slug>` 页面与 `/channels` 目录。频道页复用模板，提供精选、最新、频道搜索、内容形态、一手/资讯/X来源和起始日期。`view`、`q`、`tag`、`channel`、`since`、`page`保存在URL；分页和缓存键均含领域上下文。最新列表按原始发表日期排序，未知时退回首次收录；历史资料明确标记。综合页保留七个频道精选入口，整体动态按时间排列，不混排各领域原始评分。没有长读内容形态或综合日报按钮。

- 综合精选 RSS：`/feed/channels/all.xml`。
- 独立频道精选：`/feed/channels/biology.xml`，其他频道替换 slug。
- 独立频道最新：`/feed/channels/biology/latest.xml`。
- 原 `/feed.xml`、`/feed/full.xml`、`/feed/all.xml`、分类订阅、选中集同步及机器人日报范围保留。
- `/api/v1/items` 与现有 MCP latest/search 可选 `domain=biology` 等 slug 或 `domain=all`；省略仍是机器人。工具名前缀保持 bothot，OpenAPI 已更新。
- 已发布详情继续使用 `/items/<id>`，事件关系与规范身份不随频道变化。人工主/关联频道在原后台修正，信源候选频道在原信源编辑页调整；鉴权、审计、版本冲突处理均沿用。

发现/资讯窗口沿用既有时效检查并按主频道配置：机器人和Agent为2天/7天，交互、游戏、生物为7天/30天，自然史、社会学为14天/60天。这些是初始编排配置，不是测得的质量阈值；不同领域评分也不是全站统一标尺。未知日期、旧回灌和未来日期仍按原安全边界处理。

## 信源与编辑质量

在20个已有来源上新增14个经原采集器核验的唯一来源，合计34项。核验包括真实条目、URL、日期、合法可读材料，不等同于同行评审、事实核验或全文质量评测。记录见 [新增验证](channel-source-validation.json)。

- Agent与工程：GitHub、Hugging Face，以及共享Microsoft Research。
- 人机交互：Nielsen Norman Group、Microsoft Research、共享Pew Research。
- 游戏与角色：Godot、Factorio。目前只有两个独立可用来源，后续仍需补充游戏设计与虚拟生命原始材料。
- 生物与自然史：PLOS Biology、eLife生态/演化、ZooKeys、Biodiversity Heritage Library；OWID可能提供跨领域材料。
- 社会学：Pew Research、SocOpen、Our World in Data。Pew两个分类feed经检查返回同一综合条目集，因此统一成一个来源，不重复抓取。

OpenAI摘要不足、arXiv cs.HC空feed、Pew互联网入口403、BMC返回非RSS内容，四项保持禁用候选。来源提示不构成独占分类；宽来源可能有不相关稿件，必须通过预筛。默认仍只公开摘要及原文链接，不因来源开放访问而擅自展示全文。

34项最终配置已在隔离演示数据库实际seed，第二次新增0项；原信源管理读取确认PLOS的biology/natural-history提示与全文权限false。没有同步到生产数据库。18项新增频道正例/反例/边界候选索引在 `industry/evaluation/channel-candidates.jsonl`，均为Agent暂拟、待人工确认、gold=either，复用现有人工复核导出及SelectBench。

## 实测结果与限制

本机使用Node24.19与隔离PostgreSQL。最终全套603项后端测试、39项前端测试、9项来源/候选检查通过，共651项；类型检查、资讯站构建、静态主页构建和本地36项smoke通过。随后订阅调整补跑17项发布回归通过。没有放宽安全、撤回、回执或日期断言。

关键回归覆盖非AI生物/化石/照护材料完整处理、五次共享分析调用、关联频道唯一详情、类别与论文形态独立、分页/游标/搜索/时间范围、人工修正和幂等、旧RSS/API/MCP默认范围、机器人日报、撤回及鉴权。历史CLI还验证了dry-run→apply→rollback的日期、队列与同步数量不变，和日期投影不一致时先失败。网页返回快照最长5分钟；RSS沿用现有300秒缓存及stale策略，第三方已下载副本无法远程删除。

完全非AI真实来源回放：原RSS采集器解析PLOS Biology的30项资料，选取 [蝙蝠病毒ACE2受体研究](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3003944)，保留2026-10-01T14:00:00Z原日期与URL，经过分析、归组和发布进入biology。该回放使用5次本地固定模型响应、外部模型调用0次；它证明程序链路，不能证明真实分类、评分或中文写作质量。合成七频道演示共9项，重跑新增0项，网站明确显示演示横幅。没有付费服务调用，也没有生产预算、密钥或采集开关调整；真实编辑费用未知。

浏览器检查：改造前线上两站1440×1000/390×844，改造后本地两站、三个非技术频道、跨频道详情、搜索刷新、返回、空状态和深浅主题。生物学手机页与搜索页宽度390/390，社会学桌面1440/1440。代表截图见下表；改造后内容为本地固定响应，不能作为生产链路或筛选质量证据。

| 页面 | 改造前线上 | 改造后本地 |
|---|---|---|
| OpenZoo桌面 | [截图](screenshots/zooradar-before-openzoo-desktop.jpg) | [截图](screenshots/zooradar-after-openzoo-desktop.jpg) |
| OpenZoo手机 | [截图](screenshots/zooradar-before-openzoo-mobile.jpg) | [截图](screenshots/zooradar-after-openzoo-mobile.jpg) |
| 资讯桌面 | [截图](screenshots/zooradar-before-radar-desktop.jpg) | [截图](screenshots/zooradar-after-radar-desktop.jpg) |
| 资讯手机 | [截图](screenshots/zooradar-before-radar-mobile.jpg) | [截图](screenshots/zooradar-after-radar-mobile.jpg) |
| 生物学手机 | — | [截图](screenshots/zooradar-after-biology-mobile.jpg) |
| 自然史桌面 | — | [截图](screenshots/zooradar-after-natural-history-desktop.jpg) |
| 社会学桌面 | — | [截图](screenshots/zooradar-after-sociology-desktop.jpg) |
| 跨频道详情 | — | [截图](screenshots/zooradar-after-cross-channel-detail.jpg) |
| 暗色主题 | — | [截图](screenshots/zooradar-after-radar-dark-desktop.jpg) |
| 空状态 | — | [截图](screenshots/zooradar-after-empty-mobile.jpg) |

## 本地复验与正式更新

当前运行预览：ZooRadar http://localhost:3300，品牌主页 http://localhost:3302。品牌主页外链保留正式news域名，尚未部署的新频道应直接在3300查看。

```bash
# 自行设置已迁移的独立本机 *_test / *_ci 数据库；不指向生产
npm run typecheck
DATABASE_URL=postgres://你的本机连接/zooradar_ci node scripts/migrate.ts
DATABASE_URL=postgres://你的本机连接/zooradar_ci npm test
npm run test:sources
npm run build -w @aihot/web
npm run build:home
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3300
```

七频道演示复用原工具，数据库名仍须满足bothot_demo*_test或*_ci且环境不是production：先迁移，再执行 `MULTICHANNEL_DEMO=true node scripts/demo.ts`，以 `SITE_DEMO=true`启动web。不得用演示库替换生产库。

历史回填先核对来源实际标题、原始日期与人工状态，不能把示范AI内容或其他内容一律归机器人：

```bash
node scripts/backfill-channels.ts --sources 已人工检查的来源ID
node scripts/backfill-channels.ts --sources 已人工检查的来源ID --apply --out .data/channel-backfill.json
node scripts/backfill-channels.ts --rollback .data/channel-backfill.json
```

CLI使用普通事务、后台审计与版本号；后续人工修改会使回滚失败，避免覆盖新决定。不调用模型，不改变事件身份；回滚文件0600，不提交Git。原文与发布层时间不一致时停止，先另行处理日期投影问题。

本轮没有部署、改DNS、重启生产服务或写生产数据。正式发布前按 [运维说明](server-deployment.md) 备份数据库与文件卷，构建新镜像，正常停止旧worker/API/web，执行0042迁移，幂等seed仅新增来源，再启动新版本。新增来源会扩大真实采集工作量，应沿用既有模型预算、回执与熔断并先小范围启用；不更换服务或擅自提高预算。旧应用回滚可保留0042列；新频道停用与文章撤回分别处理，机器人原订阅不会扩大。

最终兼容复查还覆盖了关联频道：原RSS/API/MCP默认流与原同步都保留“主频道机器人或未分类历史记录”的范围；新频道入口可显式读取关联领域，避免一个biology主频道的条目仅因关联robotics而静默进入原订阅或采用更长时效窗口。显式API查询在query中回传domain。该修正补跑28项频道/发布/Agent回归及类型检查通过；频道测试可独立创建自己的队列环境。
