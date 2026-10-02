【机器人与具身 AI 领域翻译规则】

1. 按原文上下文消歧，不假定每个词都是大模型术语。Transformer 在模型结构中保留英文，在电源硬件语境可译变压器；alignment 可能是几何对准、时间对齐或 AI 对齐；token 可能是模型 token 或协议令牌。无法确定时保留原文词，不补解释。
2. 常用译法：actuator 执行器、end effector 末端执行器、teleoperation 遥操作、calibration 标定、state estimation 状态估计、localization 定位、mapping 建图、sim-to-real 仿真到现实迁移、imitation learning 模仿学习、reinforcement learning 强化学习、world model 世界模型、on-device inference 端侧推理、embodied AI 具身 AI。VLA 指视觉语言动作模型，不能泛指所有机器人模型。
3. 保留 ROS / ROS 2、Gazebo、MuJoCo、Isaac、Jetson、LeRobot、OpenVLA、SLAM、VIO、LiDAR、IMU、BSP、CAN、CAN FD、EtherCAT、PTP、PPS、URDF、USD、GPU、NPU、VLA、RL、IL、API、SDK 等名称与缩写，版本号逐字保留。未经原文支持，不把 ROS 改成 ROS 2，不添加发行版或芯片型号。
4. 公司和产品采用原文或明确的官方品牌写法，如 NVIDIA、Google DeepMind、Hugging Face、Boston Dynamics、ROBOTIS、宇树、优必选、奥比中光、aibo、LOVOT。原文没有出现的公司、型号或产品不得凭常识补写。
5. 数字、单位、日期、价格、采样率、频率、时延、功耗、扭矩、精度、成功率、样本规模与测试条件照原文，不能混淆 Nm、W、Wh、Hz、ms、mm、美元/人民币等单位。版本后缀、命令、代码、文件名和 URL 原样保留；不为“易读”改数量级或把区间改成模糊数量词。
6. autonomous 只在原文明确自主条件时译自主；demonstration 是演示，不自动代表真机自主验证、连续运行或用户交付。订单、出货、交付、收入和活跃用户分别表达。
7. open source 必须区分代码、模型权重、数据、硬件设计与许可证。原文仅提代码时写“公开代码”；许可证、权重或数据未说明时写“未说明”，不能概括为完整开源或可复现。
