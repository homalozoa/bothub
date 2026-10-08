# 贡献

[Issues](https://github.com/homalozoa/bothub/issues) 接收可复现问题与明确场景；安全问题按 [SECURITY.md](SECURITY.md) 私密报告。

1. 阅读 [AGENTS.md](AGENTS.md)，从 main 建分支，一次 PR 解决一个问题。
2. 使用[独立环境](docs/robotics.md)，关闭采集、付费模型和推送，不使用生产库测试。
3. 代码执行类型、后端、网页与来源检查；纯文档核对链接和展示。PR 写实际结果与兼容影响，页面改动附截图。
4. 小步提交，使用 Conventional Commits；main 经 PR、check/docker 检查并采用 squash 合并。

行业配置放 industry/，通用改进放应用或后端；大幅架构变化先说明具体场景。质量结论需要人工复核材料，演示不能替代。

不要提交 .env、密钥、密码、Cookie、生产数据或未授权素材；日志和截图先脱敏。保留 [LICENSE](LICENSE)、[NOTICE](NOTICE) 与第三方许可。[定制](docs/customize.md) · [信源](docs/sources.md)
