# 快速开始指南

本指南将帮助您在 5 分钟内开始使用 Word 智能补全。

## 📦 第一步：获取软件

### 选项 A：下载预构建包（最简单）

1. 访问 [Releases 页面](https://github.com/Eclipse-01/MSWordAutoComplete/releases)
2. 下载最新版本的 `MSWordAutoComplete-v{version}.zip`
3. 解压到您选择的文件夹

### 选项 B：下载 Electron 应用

1. 访问 [Releases 页面](https://github.com/Eclipse-01/MSWordAutoComplete/releases)
2. 下载您的操作系统对应的安装包：
   - Windows: `Word智能补全-Setup-{version}.exe`
   - Mac: `Word智能补全-{version}.dmg`
   - Linux: `Word智能补全-{version}.AppImage`

## 🔧 第二步：安装

### Office 加载项安装

#### Windows（自动）
1. 在解压的文件夹中，右键点击 `install-windows.ps1`
2. 选择"使用 PowerShell 运行"
3. 等待安装完成

#### Mac（自动）
1. 打开终端
2. cd 到解压的文件夹
3. 运行：`./install-mac.sh`

#### 手动安装（所有平台）
详见 [DISTRIBUTION.md](DISTRIBUTION.md)

### Electron 应用安装

直接运行下载的安装包即可。

## 🔑 第三步：配置 API 密钥

### 1. 获取 API 密钥

选择以下之一：

**OpenAI（推荐新手）**
1. 访问 https://platform.openai.com/
2. 注册/登录
3. 创建 API 密钥

**GitHub Copilot**
1. 确保有 GitHub Copilot 订阅
2. 访问 https://github.com/settings/tokens
3. 创建具有 Copilot 权限的令牌

**自定义 API**
- 准备您的 API URL 和密钥

### 2. 在插件中配置

1. 打开 Word（Office 加载项）或启动应用（Electron）
2. 点击"设置"选项卡
3. 选择您的 API 提供商
4. 粘贴 API 密钥
5. 点击"保存设置"

## ✨ 第四步：开始使用

### 自动补全

1. 切换到"自动补全"选项卡
2. 开启"启用自动补全"
3. 在 Word 中输入一些文字
4. 查看 AI 的建议
5. 点击"应用建议"插入文本

### 聊天功能

1. 切换到"侧边聊天"选项卡
2. 在输入框中输入问题，例如：
   - "帮我写一封感谢信"
   - "总结这段文字的要点"
   - "改善这段话的表达"
3. 点击"发送"
4. 将回复插入到文档

## 💡 使用提示

### 获得更好的结果

**提供清晰的上下文**
```
❌ "写点东西"
✅ "为新产品写一段营销文案，突出环保和创新特点"
```

**使用具体的指令**
```
❌ "改进"
✅ "将这段话改写得更正式，适合商务邮件"
```

**分步骤处理复杂任务**
```
第一步："生成文章大纲：如何提高工作效率"
第二步："详细展开第一个要点"
第三步："添加具体例子"
```

### 节省 API 费用

1. **手动触发**：在自动补全中使用手动模式
2. **合适的长度**：设置合理的"最大 Token 数"
3. **批量处理**：一次性处理多个相关问题

### 常见应用场景

**写作辅助**
- 扩展要点
- 改善措辞
- 检查语法
- 调整语气

**内容创作**
- 生成创意
- 起草大纲
- 续写故事
- 创建对话

**文档编辑**
- 总结长文
- 精简内容
- 翻译文本
- 格式化输出

## ❓ 遇到问题？

### 常见问题

**Q: 提示"无法连接 AI 服务"**
A: 检查您的 API 密钥是否正确，网络是否畅通

**Q: 建议质量不高**
A: 尝试提供更多上下文，或调整温度值（设置中）

**Q: 响应很慢**
A: 可能是 API 服务繁忙或网络问题，稍后重试

更多问题请查看 [USAGE.md](USAGE.md) 或访问 [Issues](https://github.com/Eclipse-01/MSWordAutoComplete/issues)

## 📚 进一步学习

- **完整文档**：[README.md](README.md)
- **详细使用指南**：[USAGE.md](USAGE.md)
- **分发说明**：[DISTRIBUTION.md](DISTRIBUTION.md)

## 🎉 享受使用！

现在您已经准备好了！开始享受 AI 驱动的写作体验吧！

---

**免责声明**：
- 本插件是第三方工具，与 Microsoft 官方无关
- 使用需要您自己的 API 密钥和服务
- API 使用可能产生费用，请查看提供商的定价

**隐私保护**：
- API 密钥存储在本地
- 文档内容仅在您使用功能时发送到 AI 服务
- 我们不收集任何用户数据
