# 定制行业

主要修改 industry/，通常无需改应用和后端。

| 文件 | 用途 |
|---|---|
| site.ts | 站名、中文文案、运营者、联系信息、抓取身份；域名用 SITE_URL |
| channels.ts、topic-navigation.ts | 内部分类、阅读入口、小分类与形态 |
| taxonomy.ts、topics.json | 标签、主体、主题与身份安全词典 |
| sources.json | 已验证来源，见[信源](sources.md) |
| prompts/、selection.ts | 编辑规则与[人工校准](selection.md) |
| features.ts | 模型榜与重置监控开关，当前均关闭 |
| brand/、branding.ts | 自有标记与导出资源 |
| pages/、changelog.json | 运营草稿与更新日志 |

上线后的分类 key、主题 slug、MCP 前缀和文章 ID 保持兼容。新增源先检查 URL、日期、可读材料和许可，再 seed；已有来源由后台修改，seed 不覆盖管理员配置，全文默认不公开。

评分保留内容类型、五轴权重、噪声压制、安全与身份词典，先替换行业例子，再用人工复核材料校准。60/65/76 为未校准起点；示例 gold 和 Agent 暂标不能证明准确率。

提示词用 {{siteName}}、{{> 文件名}} 复用；新规则影响后续任务，旧判断不自动重算。更换行业不移除认证、回执、预算、日期、撤回或许可保护。

~~~bash
node industry/brand/generate.ts
node scripts/nameplates.ts
~~~

图标读取共享矢量路径，报头使用仓库字体；保留字体及第三方许可，不使用 AIHOT 名称或 Logo。法律草稿按实际服务、地区和保存期限完善。

完成后执行[检查](robotics.md#演示与检查)，查看首页、频道、详情、日报、空状态与后台来源。开发关闭采集、付费模型和推送；更新按[部署](deploy.md)处理。
