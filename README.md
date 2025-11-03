# Word 智能补全

> **第三方开发的 Microsoft Word 加载项，与 Microsoft 官方无关**

这是一个为 Microsoft Word 提供类似 GitHub Copilot 自动补全功能的第三方插件。支持 GitHub Copilot 模型（通过 GitHub 登录）和自定义 OpenAI 风格接口的模型。

## ✨ 功能特性

- **自动补全**：在文档中键入时获取 AI 驱动的智能补全建议
- **内联聊天**：与 AI 讨论选中的文本或获取写作帮助
- **侧边聊天**：在侧边栏中与 AI 助手进行完整对话
- **自动编辑**：基于指令自动编辑和改进文本
- **Word API 集成**：无缝集成 Word API 进行文档操作
- **多 AI 提供商支持**：
  - GitHub Copilot
  - OpenAI（GPT-3.5、GPT-4）
  - 自定义 OpenAI 兼容 API

## 📋 前置要求

- Microsoft Word 2016 或更新版本（Windows、Mac 或 Web）
- Node.js 14.x 或更高版本
- npm 或 yarn
- API 密钥：
  - GitHub 个人访问令牌（用于 GitHub Copilot）
  - OpenAI API 密钥（用于 OpenAI 模型）
  - 或自定义 API 端点和密钥

## 🚀 安装

### 方式一：直接安装（推荐）

下载最新版本的分发包：

1. 访问 [Releases 页面](https://github.com/Eclipse-01/MSWordAutoComplete/releases)
2. 下载 `MSWordAutoComplete-v{version}.zip`
3. 解压到本地文件夹
4. 按照以下操作系统的说明安装

#### Windows 用户

**自动安装（推荐）**：
1. 右键点击 `install-windows.ps1`
2. 选择"使用 PowerShell 运行"
3. 按照提示操作

**手动安装**：
1. 打开 Word，点击"文件" > "选项" > "信任中心" > "信任中心设置"
2. 选择"受信任的加载项目录"
3. 添加解压文件夹的路径
4. 重启 Word
5. 点击"插入" > "我的加载项" > "共享文件夹"
6. 选择"Word 智能补全"

#### Mac 用户

**自动安装（推荐）**：
1. 在终端中运行：`./install-mac.sh`
2. 按照提示操作

**手动安装**：
1. 将解压的文件夹复制到：`~/Library/Containers/com.microsoft.Word/Data/Documents/wef`
2. 如果 `wef` 文件夹不存在，请创建它
3. 重启 Word
4. 点击"插入" > "加载项" > "我的加载项"
5. 选择"Word 智能补全"

### 方式二：Electron 桌面应用

下载独立桌面应用：

1. 访问 [Releases 页面](https://github.com/Eclipse-01/MSWordAutoComplete/releases)
2. 下载对应平台的安装包：
   - Windows: `Word智能补全-Setup-{version}.exe`
   - Mac: `Word智能补全-{version}.dmg`
   - Linux: `Word智能补全-{version}.AppImage`
3. 安装并运行

Electron 版本提供独立的桌面应用体验，无需在 Word 中安装加载项。

### 方式三：从源码安装（开发者）

1. 克隆此仓库：
```bash
git clone https://github.com/Eclipse-01/MSWordAutoComplete.git
cd MSWordAutoComplete
```

2. 安装依赖：
```bash
npm install
```

3. 构建项目：
```bash
npm run build
```

4. 启动开发服务器：
```bash
npm start
```

这将启动开发服务器并在 Word 中侧载加载项。

## ⚙️ 配置

1. 在 Word 中打开加载项
2. 点击"设置"选项卡
3. 选择您的 AI 提供商（GitHub Copilot、OpenAI 或自定义）
4. 输入相应的 API 密钥或令牌
5. 配置模型参数（温度、最大令牌数等）
6. 保存设置

## 📖 使用方法

### 自动补全

1. 在设置中启用自动补全
2. 在 Word 文档中开始键入
3. 插件将自动建议文本补全
4. 点击"应用建议"将补全插入文档

### 内联聊天

1. 选择文档中的文本
2. 切换到"内联聊天"选项卡
3. 向 AI 询问关于选中文本的问题
4. 将 AI 响应应用到文档

### 侧边聊天

1. 切换到"侧边聊天"选项卡
2. 与 AI 助手进行完整对话
3. 将响应插入到文档中的光标位置

## 🛠️ 开发

### 构建项目
```bash
npm run build
```

### 开发模式（带热重载）
```bash
npm run dev-server
```

### 在 Word 中调试
```bash
npm start
```

### 打包分发

#### 打包 Office 加载项
```bash
npm run pack
```
生成：`release/MSWordAutoComplete-v{version}.zip`

#### 构建 Electron 应用

**所有平台**：
```bash
npm run electron:build
```

**Windows**：
```bash
npm run electron:build:win
```

**Mac**：
```bash
npm run electron:build:mac
```

**Linux**：
```bash
npm run electron:build:linux
```

生成的安装包位于 `release/` 目录。

### 代码检查
```bash
npm run lint
```

### 修复代码风格
```bash
npm run lint:fix
```

## 📦 项目结构

```
MSWordAutoComplete/
├── src/
│   ├── taskpane/
│   │   ├── components/         # React 组件
│   │   │   ├── AutoComplete.tsx
│   │   │   ├── InlineChat.tsx
│   │   │   ├── SidebarChat.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/           # 服务层
│   │   │   └── AIService.ts    # AI API 集成
│   │   ├── App.tsx             # 主应用组件
│   │   ├── taskpane.ts         # 入口文件
│   │   └── taskpane.html       # HTML 模板
│   └── commands/               # Office 命令
├── assets/                     # 图标和资源
├── manifest.xml                # Office 加载项清单
├── package.json
└── webpack.config.js
```

## 🔒 隐私与安全

- 本插件是第三方工具，与 Microsoft 官方无关
- 所有 API 密钥都存储在浏览器的本地存储中
- 您的文档内容仅在您选择使用 AI 功能时发送到所选的 AI 服务
- 我们不会收集或存储任何用户数据或文档内容
- 请妥善保管您的 API 密钥，不要与他人分享

## ⚠️ 免责声明

本项目是第三方开发的扩展工具，与 Microsoft Corporation 无任何官方关联。使用本插件需要您自己的 API 密钥和服务。我们不对 AI 生成的内容负责，请在使用前仔细审查所有生成的内容。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📧 联系方式

如有问题或建议，请在 GitHub 仓库中提交 Issue。

---

**注意**：使用第三方 AI 服务可能会产生费用。请查看您所选 AI 提供商的定价详情。
