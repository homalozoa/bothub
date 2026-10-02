// 主分类、内容形态、技术主题和公司实体各自独立。分类 key 与主题 slug 用于公开接口，上线后保持稳定。
// industry 保留为上游日报对未归类资料的 fallback；它在本站表示产品与商业化。
export const CATEGORIES = [
  { key: "hardware", label: "硬件与系统", section: "硬件与系统工程", guide: "机器人计算平台、端侧推理、传感器与同步标定、通信总线、电机与执行器、机构、功耗、BSP、ROS、仿真、可靠性、成本和可采购性；以工程资产与系统变化为核心" },
  { key: "research", label: "研究与开源", section: "机器人研究与开源", guide: "机器人感知、定位导航、腿足控制、操作、模仿学习、强化学习、VLA、世界模型、数据采集、评测和长期自主运行；论文、代码、权重与数据集分别说明开放范围" },
  { key: "industry", label: "产品与商业化", section: "产品与商业化", guide: "消费、伙伴与娱乐、移动、机械臂和人形机器人的发布、交付、定价、体验、销量口径、售后、渠道、供应链和产业变化；融资不等于商业验证" },
] as const;

// 保留上游七种输出类型及其评分权重。机器人硬件发布也使用 product_launch。
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

/** 第一个标签是内容形态，主分类另由 category 表达。 */
export const CATEGORY_TAGS = [
  "产品更新", "模型发布", "论文/研究", "开源/仓库", "教程/实践", "现象/趋势", "观点/分析", "评测/基准", "安全/可靠性", "行业动态", "政策/监管", "其他",
] as const;

export const TOPIC_TAGS = [
  "计算/端侧", "传感器/标定", "执行器/机构", "通信/控制", "ROS/仿真", "部署/工程", "成本/供应链", "感知/导航", "腿足控制", "操作/抓取", "模仿/强化学习", "VLA/世界模型", "数据/训练", "开源生态", "长期自主", "伙伴/娱乐机器人", "移动机器人", "机械臂", "人形机器人", "交付/用户体验",
] as const;

export const ENTITY_TAGS = ["NVIDIA", "Google DeepMind", "Hugging Face", "Open Robotics", "宇树", "Boston Dynamics", "Agility Robotics", "Figure", "Apptronik", "优必选", "Sony", "GROOVE X", "Luxonis", "Orbbec", "ROBOTIS", "Arduino", "GitHub", "arXiv"] as const;

export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  产品: "产品更新", 更新: "产品更新", 模型: "模型发布", "模型更新": "模型发布",
  论文: "论文/研究", 研究: "论文/研究", paper: "论文/研究", papers: "论文/研究",
  "open-source": "开源/仓库", 开源: "开源/仓库", 仓库: "开源/仓库", repo: "开源/仓库",
  教程: "教程/实践", 实践: "教程/实践", 指南: "教程/实践", "教程/玩法": "教程/实践", "技巧/最佳实践": "教程/实践",
  "大佬观点": "观点/分析", 观点: "观点/分析", 分析: "观点/分析", 趋势: "现象/趋势", 现象: "现象/趋势",
  安全: "安全/可靠性", "安全/对齐": "安全/可靠性", 可靠性: "安全/可靠性", 政策: "政策/监管", 监管: "政策/监管", 法规: "政策/监管",
  融资: "行业动态", 并购: "行业动态", 收购: "行业动态", 合作: "行业动态", "融资/收购": "行业动态", "合作/生态": "行业动态", "公司动态": "行业动态",
  端侧: "计算/端侧", "端侧推理": "计算/端侧", 传感器: "传感器/标定", 标定: "传感器/标定", 执行器: "执行器/机构", 电机: "执行器/机构",
  ROS: "ROS/仿真", "ROS 2": "ROS/仿真", 仿真: "ROS/仿真", SLAM: "感知/导航", 导航: "感知/导航", VLA: "VLA/世界模型",
  "伙伴机器人": "伙伴/娱乐机器人", "娱乐机器人": "伙伴/娱乐机器人", "陪伴机器人": "伙伴/娱乐机器人", Unitree: "宇树", "英伟达": "NVIDIA", DeepMind: "Google DeepMind",
};

export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  model_release: "模型发布", product_launch: "产品更新", tool_or_prompt: "教程/实践", research_paper: "论文/研究",
  industry_event: "行业动态", opinion_analysis: "观点/分析", tutorial_explainer: "教程/实践",
};

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[] }> = {
  nvidia: { name: "NVIDIA", displayTag: "NVIDIA", aliases: ["NVIDIA", "英伟达", "Jetson", "Isaac"] },
  google: { name: "Google DeepMind", displayTag: "Google DeepMind", aliases: ["Google DeepMind", "DeepMind", "Google", "谷歌"] },
  "hugging-face": { name: "Hugging Face", displayTag: "Hugging Face", aliases: ["Hugging Face", "LeRobot"] },
  "open-robotics": { name: "Open Robotics", displayTag: "Open Robotics", aliases: ["Open Robotics", "OSRF", "Gazebo"] },
  unitree: { name: "宇树", displayTag: "宇树", aliases: ["Unitree", "宇树", "宇树科技"] },
  "boston-dynamics": { name: "Boston Dynamics", displayTag: "Boston Dynamics", aliases: ["Boston Dynamics", "波士顿动力"] },
  agility: { name: "Agility Robotics", displayTag: "Agility Robotics", aliases: ["Agility Robotics"] },
  figure: { name: "Figure", displayTag: "Figure", aliases: ["Figure AI", "Figure Robotics", "Figure"] },
  apptronik: { name: "Apptronik", displayTag: "Apptronik", aliases: ["Apptronik"] },
  ubtech: { name: "优必选", displayTag: "优必选", aliases: ["UBTECH", "优必选"] },
  sony: { name: "Sony", displayTag: "Sony", aliases: ["Sony", "索尼", "aibo"] },
  "groove-x": { name: "GROOVE X", displayTag: "GROOVE X", aliases: ["GROOVE X", "GROOVE-X", "LOVOT"] },
  luxonis: { name: "Luxonis", displayTag: "Luxonis", aliases: ["Luxonis", "DepthAI"] },
  orbbec: { name: "Orbbec", displayTag: "Orbbec", aliases: ["Orbbec", "奥比中光"] },
  robotis: { name: "ROBOTIS", displayTag: "ROBOTIS", aliases: ["ROBOTIS", "DYNAMIXEL"] },
  arduino: { name: "Arduino", displayTag: "Arduino", aliases: ["Arduino"] },
};

/** 原文没有对应身份时，保留上游防止模型补写公司的安全检查。 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达|\bjetson\b|\bisaac\b/i, /nvidia|英伟达|\bnemotron\b|\bnemo\b|\bblackwell\b|\brubin(?:\s+ultra)?\b|\bcuda\b/i] },
  { id: "google", name: "Google DeepMind", patterns: [/google|deepmind|谷歌|\bgemini\b/i, /google|deepmind|\bgemini\b|notebooklm|\bveo\s?\d|\bAlphaFold\b|\bAMIE\b/i] },
  { id: "hugging-face", name: "Hugging Face", patterns: [/hugging\s?face|\blerobot\b/i, /hugging\s?face/i] },
  { id: "open-robotics", name: "Open Robotics", patterns: [/open\srobotics|\bosrf\b|\bgazebo\b/i] },
  { id: "unitree", name: "宇树", patterns: [/unitree|宇树/i] },
  { id: "boston-dynamics", name: "Boston Dynamics", patterns: [/boston\sdynamics|波士顿动力/i] },
  { id: "agility", name: "Agility Robotics", patterns: [/agility\srobotics/i] },
  { id: "figure", name: "Figure", patterns: [/\bfigure\s(?:ai|robotics|0[1-9])\b|\bhelix\b/i, /\bFigure\b/] },
  { id: "apptronik", name: "Apptronik", patterns: [/apptronik/i] },
  { id: "ubtech", name: "优必选", patterns: [/ubtech|优必选/i] },
  { id: "sony", name: "Sony", patterns: [/\bsony\b|索尼|\baibo\b/i] },
  { id: "groove-x", name: "GROOVE X", patterns: [/groove[\s-]?x|\blovot\b/i] },
  { id: "luxonis", name: "Luxonis", patterns: [/luxonis|\bdepthai\b/i] },
  { id: "orbbec", name: "Orbbec", patterns: [/orbbec|奥比中光/i] },
  { id: "robotis", name: "ROBOTIS", patterns: [/robotis|dynamixel/i] },
  { id: "arduino", name: "Arduino", patterns: [/arduino/i] },
  // 普通 AI 消息不收录；原有身份安全词典仍保留，防止模型在机器人材料里补写其他公司。
  { id: "deepseek", name: "DeepSeek", patterns: [/deepseek|深度求索/i] },
  { id: "xai", name: "xAI / Grok", patterns: [/\bxai\b|\bgrok\b/i] },
  { id: "microsoft", name: "Microsoft / Copilot", patterns: [/microsoft|copilot|微软/i] },
  { id: "qwen", name: "千问 Qwen", patterns: [/\bqwen|通义|千问/i] },
  { id: "cursor", name: "Cursor", patterns: [/\bCursor\b/] },
  { id: "kimi", name: "Kimi / 月之暗面", patterns: [/\bkimi\b|月之暗面|\bmoonshot\s?ai\b/i] },
  { id: "openrouter", name: "OpenRouter", patterns: [/openrouter/i] },
  { id: "minimax", name: "MiniMax", patterns: [/minimax/i] },
  { id: "zhipu", name: "智谱 GLM", patterns: [/智谱|\bglm-?[4-9]/i] },
  { id: "hunyuan", name: "腾讯混元", patterns: [/混元|hunyuan/i] },
  { id: "doubao", name: "字节豆包", patterns: [/豆包|doubao|字节跳动|bytedance/i] },
  { id: "mistral", name: "Mistral", patterns: [/mistral/i] },
  { id: "perplexity", name: "Perplexity", patterns: [/\bPerplexity\b/] },
  { id: "runway", name: "Runway", patterns: [/\brunway\b/i] },
  { id: "suno", name: "Suno", patterns: [/\bsuno\b/i] },
  { id: "midjourney", name: "Midjourney", patterns: [/midjourney/i] },
  { id: "stability-ai", name: "Stability AI", patterns: [/stability\s?ai/i] },
  { id: "elevenlabs", name: "ElevenLabs", patterns: [/eleven\s?labs/i] },
  { id: "vllm", name: "vLLM", patterns: [/\bvllm\b/i] },
  { id: "ollama", name: "Ollama", patterns: [/\bollama\b/i] },
  { id: "windsurf", name: "Windsurf", patterns: [/windsurf/i] },
  { id: "devin", name: "Devin", patterns: [/\bdevin\b/i] },
  { id: "manus", name: "Manus", patterns: [/\bmanus\b/i] },
  { id: "apple", name: "Apple AI", patterns: [/\bapple\s?(intelligence|silicon|ai)\b|苹果(智能|\s?AI)/i] },
  { id: "amazon", name: "Amazon / AWS", patterns: [/amazon|\baws\b|亚马逊/i] },
  { id: "baidu", name: "百度文心", patterns: [/百度|baidu|文心|\bernie\s?bot\b/i] },
  { id: "openai", name: "OpenAI", patterns: [/openai|chatgpt|\bgpt-?\d|\bcodex\b/i, /openai|chatgpt|\bgpt-?[o\d]|\bsora\b|\bcodex\b/i] },
  { id: "anthropic", name: "Anthropic", patterns: [/anthropic|\bclaude\b/i, /anthropic|\bclaude\b/i, /\b(?:opus|sonnet|haiku)\s*\d+(?:[.\-]\d+)*\b/i, /\bfable\s*\d+(?:[.\-]\d+)*\b|\bmythos\b/i] },
  { id: "meta", name: "Meta", patterns: [/\bMeta\b|\bllama\b/, /\bMeta\b/, /\bmeta\s?ai\b|\bllama\b/i] },
];

/** 托管平台 GitHub / arXiv 不映射为作者或发布方。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "google", domains: ["deepmind.google", "ai.google", "blog.google"] },
  { entityId: "hugging-face", domains: ["huggingface.co"] },
  { entityId: "open-robotics", domains: ["openrobotics.org", "gazebosim.org"] },
  { entityId: "unitree", domains: ["unitree.com"] },
  { entityId: "boston-dynamics", domains: ["bostondynamics.com"] },
  { entityId: "agility", domains: ["agilityrobotics.com"] },
  { entityId: "figure", domains: ["figure.ai"] },
  { entityId: "apptronik", domains: ["apptronik.com"] },
  { entityId: "ubtech", domains: ["ubtrobot.com"] },
  { entityId: "sony", domains: ["sony.com", "sony.jp", "aibo.sony.jp"] },
  { entityId: "groove-x", domains: ["groove-x.com", "lovot.life"] },
  { entityId: "luxonis", domains: ["luxonis.com"] },
  { entityId: "orbbec", domains: ["orbbec.com"] },
  { entityId: "robotis", domains: ["robotis.com"] },
  { entityId: "arduino", domains: ["arduino.cc"] },
  { entityId: "openai", domains: ["openai.com"] },
  { entityId: "anthropic", domains: ["anthropic.com", "claude.com"] },
  { entityId: "deepseek", domains: ["deepseek.com"] },
  { entityId: "xai", domains: ["x.ai"] },
  { entityId: "meta", domains: ["ai.meta.com"] },
  { entityId: "microsoft", domains: ["microsoft.com"] },
  { entityId: "qwen", domains: ["qwen.ai"] },
  { entityId: "cursor", domains: ["cursor.com"] },
  { entityId: "openrouter", domains: ["openrouter.ai"] },
];

export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "hugging-face", pattern: /@huggingface\b/i },
  { entityId: "unitree", pattern: /@UnitreeRobotics\b/i },
  { entityId: "meta", pattern: /@AIatMeta\b/i },
  { entityId: "zhipu", pattern: /\bZhipu(?:\s+AI\b|['’]s\b)/i },
];
