# GitHub Actions 工作流总结

## 📋 已添加的文件

### 工作流文件
1. `.github/workflows/build-and-release.yml` - 自动构建和发布
2. `.github/workflows/ci.yml` - 持续集成
3. `.github/workflows/quick-build.yml` - 快速构建
4. `.github/workflows/README.md` - 工作流使用文档

### 更新的文件
- `README.md` - 添加 GitHub Actions 徽章和下载说明

## 🎯 实现的功能

### 1. Build and Release（build-and-release.yml）

**触发条件：**
- 推送版本标签（如 `v1.0.0`）
- 手动触发（workflow_dispatch）

**构建平台：**
- ✅ Office 加载项（Ubuntu）
- ✅ Windows Electron 应用
- ✅ Mac Electron 应用
- ✅ Linux Electron 应用

**自动化流程：**
1. 检出代码
2. 安装 Node.js 20
3. 安装依赖（npm ci）
4. 构建项目
5. 打包应用
6. 上传 Artifacts
7. 创建 GitHub Release（仅 tag）
8. 上传所有构建产物到 Release

**产物：**
- `MSWordAutoComplete-Office-Addin-{version}.zip`
- `Word智能补全-Setup-{version}.exe`
- `Word智能补全-{version}.dmg`
- `Word智能补全-{version}.AppImage`
- `install-windows.ps1` / `install-mac.sh`
- `manifest.xml`
- 相关文档

### 2. CI - 持续集成（ci.yml）

**触发条件：**
- Pull Request 到 main/develop
- 推送到 main/develop

**检查项：**
- ✅ 代码格式（Prettier）
- ✅ 代码质量（ESLint）
- ✅ TypeScript 编译
- ✅ 构建验证
- ✅ 包大小检查
- ✅ 安全扫描（npm audit）
- ✅ manifest.xml 验证
- ✅ Electron 构建测试（所有平台）

**目的：**
确保代码质量，在合并前发现问题。

### 3. Quick Build（quick-build.yml）

**触发条件：**
- 仅手动触发

**选项：**
- 平台选择：all / office-addin / electron-windows / mac / linux
- 是否上传 Artifacts

**特点：**
- ✅ 按需构建
- ✅ 快速测试
- ✅ 短期保存（3天）
- ✅ 构建摘要

**用途：**
开发测试、快速获取特定平台的构建包。

## 📊 工作流比较

| 特性 | Build & Release | CI | Quick Build |
|------|----------------|-----|-------------|
| 触发方式 | Tag / 手动 | 自动 | 仅手动 |
| 构建平台 | 全部 | 全部 | 可选 |
| 创建 Release | ✅ | ❌ | ❌ |
| Artifacts 保留 | 永久（Release） | 7天 | 3天 |
| 主要用途 | 正式发布 | 质量检查 | 开发测试 |

## 🚀 使用场景

### 场景 1：开发中测试

```bash
# 推送代码
git push origin feature-branch

# CI 工作流自动运行
# 检查代码质量和构建
```

### 场景 2：快速获取测试包

1. 访问 Actions 页面
2. 选择 Quick Build
3. 选择需要的平台
4. 下载 Artifacts

### 场景 3：正式发布

```bash
# 更新版本号
# 编辑 package.json 和 manifest.xml

# 提交并创建 tag
git add .
git commit -m "chore: bump version to 1.0.0"
git tag v1.0.0
git push origin main --tags

# 自动构建并发布
# 访问 Releases 页面获取下载链接
```

## 📈 优势

### 自动化
- ✅ 无需手动构建
- ✅ 多平台并行构建
- ✅ 自动发布到 Release

### 质量保证
- ✅ 自动代码检查
- ✅ 构建验证
- ✅ 安全扫描

### 便捷性
- ✅ 一键触发
- ✅ 按需构建
- ✅ 快速下载

### 可追溯性
- ✅ 构建历史
- ✅ 版本管理
- ✅ 产物归档

## 🔧 配置说明

### Node.js 版本
所有工作流使用 Node.js 20，确保兼容性。

### 缓存
使用 npm 缓存加速依赖安装。

### 权限
需要仓库的 Actions 写权限（自动配置）。

### Secrets
可选配置（用于代码签名）：
- `WINDOWS_CSC_LINK`
- `WINDOWS_CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_ID_PASSWORD`

## 📝 维护建议

### 定期检查
- 每月检查工作流运行状态
- 更新过时的 Action 版本
- 清理旧的 Artifacts

### 优化
- 根据需要调整 Artifacts 保留时间
- 添加新的检查项
- 优化构建速度

### 文档
- 保持文档同步
- 记录重要变更
- 提供使用示例

## 🎓 学习资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 文档](https://www.electron.build/)
- [工作流语法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## ✅ 验证检查清单

- [x] 工作流文件创建完成
- [x] README 更新
- [x] 文档完整
- [x] 本地构建测试通过
- [x] 提交并推送

## 📊 统计

- **工作流数量**：3
- **总代码行数**：~500 行 YAML
- **支持平台**：4（Office + Windows + Mac + Linux）
- **自动化程度**：100%

---

**创建日期**：2024年11月3日  
**提交哈希**：952f47f  
**状态**：✅ 完成并可用
