# 个人运营者与来源偏好更新

2026-10-03（Asia/Singapore），按用户提供的信息更新：个人运营者为 [Homalozoa](https://github.com/homalozoa)，邮箱 [homalozoax@gmail.com](mailto:homalozoax@gmail.com)。已在关于页、隐私/使用规则草稿、网页结构化信息、OpenZoo主页联系入口、llms.txt及security.txt生效。

网页结构化信息以WebSite的Person publisher表达个人运营，没有虚构公司或个人实名。隐私/使用规则的保存期限、服务地区及草稿生效日期仍待完善；本次没有把未确认事项标作已经生效。

默认信息源优先非简体中文原始材料，站内继续中文摘要。量子位 `rss-qbitai` 通过既有 `updateSource` 流程停采，审计原因为运营者的来源语言偏好；当前19源启用，量子位paused，12条历史材料保留。它从默认启用配置移入禁用记录，其他源、评分门槛、许可及已发布内容未批量修改。具体规则见 [来源偏好](source-preference.md)。

发布后端/API/worker版本 `2f03f0c`，网页版本 `d749c97`。worker正常退出后更新，数据库容器ID与启动时间不变，环境只改发布版本，服务密钥和预算保留。发布前私有备份 `${PRIVATE_BACKUP_FILE}` 与 `${PRIVATE_BACKUP_FILE}` 均为0600，文件包gzip检查通过。

验证：类型检查与构建通过；589后端测试、39前端测试、8来源测试通过，本地36项及公网43项smoke通过。实际浏览器验证关于页GitHub和mailto链接，启用信源统计19；privacy/terms正文链接及文本联系端点均已实查。

法律页面的元数据只展示部分字段，并从首个二级标题开始解析正文；联系链接已放入实际渲染正文，元数据保留纯文本姓名。Cloudflare对HTML邮箱链接的地址保护保持启用，浏览器解码后可正常点击；没有为了检查邮件链接关闭保护。

[线上截图](screenshots/personal-operator-live.jpg)。剩余事项见 [待办](launch-todos.md)。

## X 联系入口

2026-10-03（Asia/Singapore），按运营者提供的账号，在 OpenZoo 首页页脚加入 [X · @homalozoa](https://x.com/homalozoa)，与 GitHub 和邮箱并列。普通链接在新标签页打开，使用 `noopener noreferrer`。

本次仅原子替换静态首页 HTML，保留线上 CSS/JS 的版本参数。旧首页保存在服务器私有目录 `${PRIVATE_BACKUP_FILE}`，可用于回滚；公开文件权限保持0644。应用镜像和发布版本沿用现有配置。

验证：类型检查、网页构建、589后端测试、39前端测试与43项公网smoke通过。线上浏览器确认链接目标为 `https://x.com/homalozoa`；1280桌面及390手机页脚可读，页面宽度分别为1280与390，无横向溢出。检查没有发送X帖子。
