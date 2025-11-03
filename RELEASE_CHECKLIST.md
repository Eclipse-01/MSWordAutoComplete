# 发布检查清单

在发布新版本之前，请确保完成以下步骤：

## 📋 发布前检查

### 1. 代码质量

- [ ] 所有功能正常工作
- [ ] 运行 `npm run lint` 无错误
- [ ] 运行 `npm run build` 成功
- [ ] 在 Word 中测试所有功能
- [ ] 测试 API 集成（OpenAI、GitHub Copilot、自定义）

### 2. 文档更新

- [ ] 更新 README.md
- [ ] 更新 USAGE.md
- [ ] 更新 DISTRIBUTION.md
- [ ] 检查所有链接是否有效
- [ ] 确保版本号一致

### 3. 版本管理

- [ ] 更新 package.json 中的版本号
- [ ] 更新 manifest.xml 中的版本号
- [ ] 创建 Git tag: `git tag v{version}`
- [ ] 推送 tag: `git push origin v{version}`

### 4. 构建和打包

#### Office 加载项

- [ ] 运行 `npm run build`
- [ ] 运行 `npm run pack`
- [ ] 测试生成的 zip 包
- [ ] 验证安装脚本（Windows 和 Mac）

#### Electron 应用

- [ ] 运行 `npm run electron:build:win`
- [ ] 运行 `npm run electron:build:mac`
- [ ] 运行 `npm run electron:build:linux`
- [ ] 测试每个平台的安装包
- [ ] 验证自动更新功能

### 5. 发布到 GitHub

1. 创建新的 Release：
   ```bash
   gh release create v{version} \
     release/MSWordAutoComplete-v{version}.zip \
     release/Word智能补全-Setup-{version}.exe \
     release/Word智能补全-{version}.dmg \
     release/Word智能补全-{version}.AppImage \
     --title "v{version}" \
     --notes "发布说明..."
   ```

2. 或通过 GitHub 网页界面：
   - 访问 https://github.com/Eclipse-01/MSWordAutoComplete/releases/new
   - 选择 tag
   - 填写发布标题和说明
   - 上传所有构建产物
   - 发布

### 6. 发布说明模板

```markdown
## 新功能
- 功能1
- 功能2

## 改进
- 改进1
- 改进2

## 修复
- 修复1
- 修复2

## 安装方式

### Office 加载项（推荐）
下载 `MSWordAutoComplete-v{version}.zip` 并按照 README 中的说明安装。

### Electron 桌面应用
- Windows: 下载 `Word智能补全-Setup-{version}.exe`
- Mac: 下载 `Word智能补全-{version}.dmg`
- Linux: 下载 `Word智能补全-{version}.AppImage`

## 注意事项
- 需要自己的 API 密钥
- 第三方插件，与 Microsoft 官方无关

完整文档：https://github.com/Eclipse-01/MSWordAutoComplete
```

### 7. 发布后

- [ ] 验证 Release 页面显示正确
- [ ] 测试从 Release 下载和安装
- [ ] 更新项目主页（如有）
- [ ] 通知用户（如适用）
- [ ] 监控 Issues 和反馈

## 🔢 版本号规则

使用语义化版本控制（Semantic Versioning）：

- **主版本号（Major）**：不兼容的 API 更改
- **次版本号（Minor）**：向后兼容的功能新增
- **修订号（Patch）**：向后兼容的问题修复

示例：
- `1.0.0` - 首次稳定发布
- `1.1.0` - 添加新功能
- `1.1.1` - 修复 bug
- `2.0.0` - 重大更新，可能破坏兼容性

## 🚀 快速发布命令

```bash
# 1. 更新版本（会自动更新 package.json）
npm version patch  # 或 minor / major

# 2. 构建所有包
npm run build
npm run pack
npm run electron:build

# 3. 创建并推送 tag
git push origin main --tags

# 4. 创建 GitHub Release
# 手动上传 release/ 目录中的所有文件
```

## 📝 注意事项

1. **测试环境**：在发布前在干净的环境中测试
2. **备份**：确保有代码备份
3. **回滚计划**：如果出现问题，准备好回滚到前一版本
4. **用户通知**：如果有重大变更，提前通知用户
5. **文档同步**：确保所有文档与代码同步

## ⚠️ 常见问题

### 构建失败
- 检查 Node.js 版本
- 清除缓存：`npm cache clean --force`
- 重新安装依赖：`rm -rf node_modules && npm install`

### Electron 构建失败
- 检查是否有足够的磁盘空间
- 确保有稳定的网络连接（下载依赖）
- 查看 electron-builder 日志

### 签名问题
- Windows: 需要代码签名证书（可选）
- Mac: 需要 Apple Developer 账户进行公证（可选）

## 📞 获取帮助

如有问题，请：
1. 查看构建日志
2. 搜索已知问题
3. 在 GitHub Issues 中提问
