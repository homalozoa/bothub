# 信源

后台管理来源，配置字段见 [config-keys.ts](../packages/backend/src/sources/config-keys.ts)。未知字段会被拒绝；seed 只新增 ID，不覆盖管理员配置。

| 类型 | 最小配置 | 服务 |
|---|---|---|
| rss | feedUrl | 免费 RSS/Atom |
| web_list | url、itemSelector、linkSelector、titleSelector | HTML；Jina 需显式配置与预算 |
| json_list | url、mode=json_api、itemsPath、titlePaths、urlTemplate | JSON 接口 |
| x_search | query=from:SomeAccount -filter:replies、searchType=Latest | SOCIALDATA_API_KEY |
| mp_account | ghid、nickname | DAJIALA_KEY，不支持预览 |
| external | 通过推送接口接入 | INGEST_TOKEN，不主动抓取 |

## 配置与验证

先选类型，再填写采集配置对象，不包 kind/config。rss、web_list、json_list、x_search 可预览前 20 条，不入库；手动预览仍访问网络，X/Jina 可能收费，经过回执和预算。COLLECT_ENABLED=false 只关闭自动采集。

- HTML 的 itemSelector 选每条新闻，不能选整个列表容器；链接取 href，相对路径按 url/baseUrl 解析。日期依次读 datetime、title、文本；无时区时间默认 +08:00，纯日期按 UTC。detail 可补标题、日期和摘要，路径用 allowUrlPrefixes/denyUrlPrefixes 筛选。
- JSON 字段用点路径，不是 JSONPath；itemsPath 指向数组，省略表示顶层数组。urlTemplate 的 {字段} 编码、{raw:字段} 原样插入，必须生成完整 HTTP(S) 地址。日期支持 ISO、epoch_s、epoch_ms、yyyymmdd；映射全部失败会报错。
- HTML 不执行 JavaScript；没有新闻节点时优先找 RSS/JSON。Jina 地址和 parseMode 必须显式设置，不自动付费回退。
- json_list 仅跟随同源重定向，防止认证信息跨源传递。所有抓取保留 SSRF、逐跳检查与大小限制；密钥只放后端环境，修改后重启 API/worker。

显式联网检查，不调用模型、不写数据库：

~~~bash
node scripts/check-sources.ts --live --ids rss-robot-report,rss-lerobot-releases --out .data/source-validation.json
~~~

新源必须确认同一条目有原文 URL、日期和可读材料，再启用；失败候选留在 source-candidates.json。技术可读不等于事实核验。[机器人记录](sources-robotics.md) · [动物来源](life-focus.md) · [简报补源](robot-briefing-sources.md)

## 本地示例

[HTML](examples/sources/news.html) 和 [JSON](examples/sources/news.json) 各有两条虚构新闻，只供预览，不提供文章正文。只监听本机、仅提供这两个文件：

~~~bash
node --input-type=module -e '
import http from "node:http";
import { readFileSync } from "node:fs";
const files = {
  "/news.html": ["text/html", readFileSync("docs/examples/sources/news.html")],
  "/news.json": ["application/json", readFileSync("docs/examples/sources/news.json")]
};
http.createServer((req, res) => {
  const file = files[req.url];
  res.writeHead(file ? 200 : 404, {"content-type": file ? file[0] : "text/plain"});
  res.end(file ? file[1] : "Not found");
}).listen(8787, "127.0.0.1");'
~~~

仅本机开发 API 临时设 ALLOW_PRIVATE_NETWORK_FETCH=true 并重启，保持模型与推送关闭，不启动 worker；生产拒绝该设置，验证后移除。容器/远端的回环地址不是本机。

~~~json
{"url":"http://127.0.0.1:8787/news.html","parseMode":"html","itemSelector":".news-list > .news-item","linkSelector":"h2 a","titleSelector":"h2 a","publishedAtSelector":"time"}
~~~

~~~json
{"url":"http://127.0.0.1:8787/news.json","mode":"json_api","itemsPath":"data.items","titlePaths":["title"],"urlTemplate":"http://127.0.0.1:8787/posts/{id}","summaryPaths":["summary"],"publishedAtPath":"published_at","externalIdPath":"id"}
~~~

应返回两条，原日期为 2026-10-01 09:00/10:00 +08:00。HTML 选整个 .news-list 只得到第一条；Ctrl-C 停止服务。

## 发布与推送

tier 为 T1/T1_5/T2/EXCLUDE_MP；participation_mode 为 editorial（可公开）、hot_signal（仅热度证据）、isolated（不公开）。first_party 标明当事方；site_fulltext 与 syndicate_fulltext 默认关闭，只有明确许可才开放。公开日期与历史回灌按[领域窗口](selection.md)判断，失败采集不推进位置。

~~~text
POST /api/ingest/items
Authorization: Bearer <INGEST_TOKEN>
Content-Type: application/json

{"sourceId":"my-crawler","sourceName":"外部脚本","items":[{"title":"标题","url":"https://example.com/item","publishedAt":"2026-10-01T08:00:00+08:00"}]}
~~~

接口保留在私有管理边界。token 至少 16 位，未设置返回 401；每次最多 50 条、每客户端每分钟 10 次。非对象条目使整次请求 400 且不写库；缺标题/URL跳过，重复 URL 取第一条。新来源默认 isolated，暂停来源返回 409；raw._aihot.backfill=true 按历史资料处理。
