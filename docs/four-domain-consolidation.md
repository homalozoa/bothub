# 四主频道与五个领域入口

2026-10-03，运营者确认导航收拢为 **综合｜机器人｜AI 与 Agent｜生物学｜社会学**。应用版本 `70e9329` 已发布到 [ZooRadar](https://news.openzoo.ai/) 与 [OpenZoo](https://openzoo.ai/)。此前七频道部署与开发验证保留在原文档中。

## 内容组织与兼容

- 四主频道定义在industry/channels.ts的DOMAINS，模型预筛和结构化只接受ACTIVE_DOMAIN_KEYS。重要基础模型、AI研究、评测、工具和应用可进入AI与Agent，不要求机器人或Agent用途；工程作为主题。
- 自然史并入生物学。人机交互、游戏与角色为跨频道主题；四频道之外的纯游戏发行、引擎小版本和一般优化不再采集。
- 新主题页提供“全部资料”和“精选”，可搜索、分页；频道内可同时筛选主题和内容形态。主题目录包含既有归档，即使原记录没有精选分数仍可阅读。
- `/channels/natural-history`、`/channels/interaction`、`/channels/play`分别308到 `/topics/natural-history`、`/topics/human-interaction`、`/topics/games-and-characters`，原查询参数保留。
- 旧文章、原日期、评分、人工设置和事件身份不批量改写。原自然史记录通过读取层进入生物学，并补充虚拟主题标签；人机交互/游戏旧记录可在对应主题读取。纯旧游戏材料不重新进入四频道综合流。
- 历史domain键仍可用于API/RSS主题范围查询，旧三项RSS保留其规范URL和文章GUID。原机器人订阅、默认API/MCP及日报语义保留。所有读取、撤回和发布时刻仍使用publication层。
- 没有新增数据库迁移、用户体系、模型服务或数值评分门槛；迁移数仍39。既有发现窗口与历史日期规则保留。

## 信源调整

已显式审计停采Godot、Factorio和SocOpen运营博客，历史文章不删除。自然史来源提示收拢为biology，交互来源提示收拢为agents；其他管理员字段、全文许可和配置不变。`scripts/apply-four-channel-sources.ts`默认dry-run，--apply执行审计与版本检查，重复执行changed=0。

新增Sociological Science论文RSS，以官方页面公开feed为入口，经原采集器解析10条、日期与可读摘要验证后导入；不访问论文引用的受限制微数据，site_fulltext/syndicate_fulltext继续false。生产该源enabled=true、health=ok，首次采集已运行。最终32个启用来源、4个停用来源、55个主题；源文件删除配置不代替后台停采，实际停采通过上述CLI完成。

## 验证与发布

类型检查、两站构建、604项后端、39项前端、9项来源检查通过，共652项。新增回归覆盖四频道输出、自然史读取归并、未精选历史主题、空标签不扩大查询、游标/分页/搜索、人工覆盖、时间不变、撤回和旧订阅。

本地浏览器与上线后浏览器均确认领域导航准确为五项。旧自然史和交互地址进入主题；手机生物学主题筛选页和线上自然史主题页宽度390/390，无横向溢出。旧游戏主题仍可阅读6项已收录资料；数量是当时公开查询快照，不是长期产量或编辑准确率。

公网43项smoke、四频道页面及RSS、旧三主题RSS与跳转全部通过。生物学的自然史筛选有12项，原PLOS Biology详情保留2026-10-01T14:00:00Z；机器记录见 [公开检查](four-domain-production-check.json)。

私有Web端真实密码会话检查通过：dev=false、Secure/HttpOnly/SameSite=Lax、缺CSRF403、退出后旧会话401。后台仍经SSH访问，公网私有路径隐藏；没有改变认证、端口、TLS或模型配置。

发布前正常排空worker，并备份数据库、文件卷、旧源码、静态主页与.env。私有备份目录 `${DEPLOY_ROOT}` 为0700，dump约5.1MB、文件包约4.3MB；pg_restore目录及gzip读取验证通过，未做恢复演练。只有BOTHOT_RELEASE/WEB_RELEASE环境值变化，预算表逐项相同，数据库与其他项目容器未重启。seed新增1源、55主题，来源策略修改11项并审计；停采源无待运行的文章处理任务。

## 截图与回滚

[线上桌面](screenshots/zooradar-four-live-desktop.jpg) · [线上手机](screenshots/zooradar-four-live-mobile.jpg) · [自然史主题](screenshots/zooradar-four-live-natural-topic.jpg) · [游戏与角色主题](screenshots/zooradar-four-live-games-topic.jpg)

旧镜像0b539b9、配对备份和来源调整前的数据库保留。应用回滚不需要删除新列；来源策略通过既有后台逐项恢复，保留审计与管理员后续变更。没有对生产库执行恢复或破坏性测试。

真实编辑质量仍需人工复核；运行链路和来源可用不等于统计准确率。此次仅调整结构、收录范围和来源，不改原模型服务或提高预算。
