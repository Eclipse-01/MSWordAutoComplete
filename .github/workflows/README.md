# GitHub Actions 工作流说明

本项目配置了多个 GitHub Actions 工作流，用于自动化构建、测试和发布。

## 📋 可用的工作流

### 1. Build and Release（构建和发布）

**触发条件：**
- 推送 tag（如 `v1.0.0`）
- 手动触发

**功能：**
- ✅ 构建 Office 加载项（ZIP 包）
- ✅ 构建 Electron 应用（Windows/Mac/Linux）
- ✅ 自动创建 GitHub Release
- ✅ 上传所有构建产物到 Release

**使用方法：**

```bash
# 创建 tag 并推送
git tag v1.0.0
git push origin v1.0.0

# 或在 GitHub Actions 页面手动触发
```

**产物：**
- `MSWordAutoComplete-Office-Addin-*.zip` - Office 加载项
- `Word智能补全-Setup-*.exe` - Windows 安装程序
- `Word智能补全-*.dmg` - Mac 磁盘映像
- `Word智能补全-*.AppImage` - Linux 应用
- `install-windows.ps1` / `install-mac.sh` - 自动安装脚本

### 2. CI - 持续集成

**触发条件：**
- Pull Request 到 main/develop 分支
- 推送到 main/develop 分支

**功能：**
- ✅ 代码格式检查（Prettier）
- ✅ 代码质量检查（ESLint）
- ✅ TypeScript 编译检查
- ✅ 构建验证
- ✅ 安全检查（npm audit）
- ✅ Office 清单验证
- ✅ Electron 构建测试（所有平台）

**用途：**
确保代码质量和构建稳定性，在合并前发现问题。

### 3. Quick Build（快速构建）

**触发条件：**
- 仅手动触发

**功能：**
- ✅ 按需构建特定平台
- ✅ 快速生成测试包
- ✅ 短期保存（3天）

**使用方法：**

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Quick Build - 快速构建"
4. 点击 "Run workflow"
5. 选择要构建的平台：
   - `all` - 构建所有平台
   - `office-addin` - 仅 Office 加载项
   - `electron-windows` - 仅 Windows 版本
   - `electron-mac` - 仅 Mac 版本
   - `electron-linux` - 仅 Linux 版本
6. 选择是否上传构建产物
7. 点击 "Run workflow" 按钮

**下载产物：**
- 工作流完成后，在 Actions 页面点击相应的运行
- 滚动到底部的 "Artifacts" 部分
- 点击下载相应的构建产物

## 🚀 快速使用指南

### 开发测试

当你想测试构建是否正常：

```bash
# 推送代码后，CI 工作流自动运行
git push origin your-branch

# 或使用 Quick Build 手动构建
# 在 GitHub Actions 页面手动触发
```

### 发布新版本

完整的发布流程：

```bash
# 1. 更新版本号
# 编辑 package.json 和 manifest.xml

# 2. 提交更改
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. 创建 tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# 4. 推送
git push origin main
git push origin v1.0.0

# 5. 等待 GitHub Actions 完成构建
# 6. 检查 Release 页面获取下载链接
```

### 快速生成测试包

如果只需要测试某个平台的构建：

1. 访问：`https://github.com/Eclipse-01/MSWordAutoComplete/actions/workflows/quick-build.yml`
2. 点击 "Run workflow"
3. 选择平台（如 `electron-windows`）
4. 等待构建完成
5. 下载 Artifacts

## 📊 工作流状态徽章

可以在 README.md 中添加这些徽章：

```markdown
[![Build and Release](https://github.com/Eclipse-01/MSWordAutoComplete/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/Eclipse-01/MSWordAutoComplete/actions/workflows/build-and-release.yml)

[![CI](https://github.com/Eclipse-01/MSWordAutoComplete/actions/workflows/ci.yml/badge.svg)](https://github.com/Eclipse-01/MSWordAutoComplete/actions/workflows/ci.yml)
```

## ⚙️ 配置选项

### 环境变量

工作流支持以下环境变量：

- `GH_TOKEN` - GitHub token（自动提供）
- `CSC_IDENTITY_AUTO_DISCOVERY` - Mac 代码签名（设为 false 禁用）

### Secrets

如需代码签名，可在仓库设置中添加：

- `WINDOWS_CSC_LINK` - Windows 签名证书
- `WINDOWS_CSC_KEY_PASSWORD` - 证书密码
- `APPLE_ID` - Apple ID（Mac 公证）
- `APPLE_ID_PASSWORD` - Apple ID 密码

## 🔧 故障排除

### 构建失败

**问题：** npm install 失败

**解决：**
- 检查 package.json 依赖是否正确
- 确保 Node.js 版本兼容（需要 20.x）

**问题：** Electron 构建失败

**解决：**
- 检查 electron-builder 配置
- 确保平台特定的依赖已安装
- 查看详细日志

### 无法创建 Release

**问题：** Permission denied

**解决：**
- 检查仓库的 Actions 权限设置
- Settings > Actions > General > Workflow permissions
- 选择 "Read and write permissions"

### Artifacts 过期

**问题：** 无法下载构建产物

**解决：**
- CI 产物保留 7 天
- Quick Build 产物保留 3 天
- 如需长期保存，使用 Release

## 📝 自定义工作流

### 修改保留时间

编辑工作流文件中的 `retention-days`:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    retention-days: 30  # 改为 30 天
```

### 添加新平台

在 `build-and-release.yml` 的 matrix 中添加：

```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        platform: linux-arm64
        arch: arm64
```

### 修改构建命令

在相应的步骤中修改：

```yaml
- name: 构建项目
  run: npm run build -- --production
```

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 文档](https://www.electron.build/)
- [项目 RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md)
- [项目 DEPLOYMENT.md](../DEPLOYMENT.md)

## 💡 最佳实践

1. **本地测试**
   - 在推送前本地运行 `npm run build`
   - 确保本地构建成功

2. **渐进式发布**
   - 先用 Quick Build 测试
   - 然后创建预发布版本
   - 最后发布正式版本

3. **版本管理**
   - 遵循语义化版本
   - tag 与 package.json 版本一致
   - 在 CHANGELOG.md 中记录变更

4. **监控构建**
   - 订阅 Actions 通知
   - 定期检查失败的构建
   - 及时修复问题

---

**提示：** 所有工作流都可以在 `.github/workflows/` 目录中找到和修改。
