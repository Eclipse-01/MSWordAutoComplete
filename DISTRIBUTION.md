# 分发指南

本项目提供两种分发方式：

## 方式一：Office 加载项直接安装（推荐）

这是最简单的分发方式，用户可以直接在 Word 中侧载加载项。

### 准备分发包

1. 构建项目：
```bash
npm run build
```

2. 分发包包含：
   - `dist/` 文件夹（构建后的所有文件）
   - `manifest.xml`（加载项清单文件）

### 用户安装步骤

#### Windows 版 Word

1. 下载并解压分发包到本地文件夹，例如 `C:\MSWordAutoComplete`
2. 打开 Word
3. 点击"文件" > "选项" > "信任中心" > "信任中心设置"
4. 在"受信任的加载项目录"中添加包含 `manifest.xml` 的文件夹路径
5. 重启 Word
6. 点击"插入" > "我的加载项" > "共享文件夹"
7. 选择"Word 智能补全"

#### Mac 版 Word

1. 下载并解压分发包
2. 将文件夹复制到 `/Users/{用户名}/Library/Containers/com.microsoft.Word/Data/Documents/wef`
3. 如果 `wef` 文件夹不存在，请创建它
4. 重启 Word
5. 点击"插入" > "加载项" > "我的加载项"
6. 选择"Word 智能补全"

#### Web 版 Word

1. 上传 `dist/` 文件夹到您的 Web 服务器（支持 HTTPS）
2. 更新 `manifest.xml` 中的 URL
3. 在 Word Online 中：
   - 点击"插入" > "Office 加载项"
   - 点击"上传我的加载项"
   - 上传修改后的 `manifest.xml`

## 方式二：Electron 桌面应用

将插件打包为独立的桌面应用，提供更好的用户体验。

### 安装 Electron 依赖

```bash
npm install --save-dev electron electron-builder
```

### 配置和构建

已包含 Electron 配置文件，直接运行：

```bash
# 开发模式
npm run electron:dev

# 构建 Windows 安装包
npm run electron:build:win

# 构建 Mac 安装包
npm run electron:build:mac

# 构建 Linux 安装包
npm run electron:build:linux
```

### 生成的安装包

- **Windows**: `release/Word智能补全-Setup-{version}.exe`
- **Mac**: `release/Word智能补全-{version}.dmg`
- **Linux**: `release/Word智能补全-{version}.AppImage`

用户只需下载并安装相应平台的安装包即可使用。

## 方式三：Microsoft AppSource 发布（企业级）

如果需要在 Microsoft AppSource 上发布：

1. 注册 Microsoft 合作伙伴中心账户
2. 提交加载项以供审核
3. 通过审核后，用户可以直接从 Word 中的 Store 安装

详细步骤请参考：https://learn.microsoft.com/office/dev/store/

## 自动更新

### Office 加载项
- 修改服务器上的文件即可，用户下次打开 Word 时自动获取更新

### Electron 应用
- 已配置 electron-updater
- 应用会自动检查并提示更新

## 授权与激活

如需要授权管理，请参考 `LICENSE_MANAGEMENT.md`

## 技术支持

如有问题，请访问：https://github.com/Eclipse-01/MSWordAutoComplete/issues
