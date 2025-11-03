# 安全注意事项

## ⚠️ 重要安全提示

本插件处理敏感的 API 密钥和文档内容。请仔细阅读以下安全注意事项。

## 🔐 API 密钥存储

### 当前实现
- API 密钥存储在浏览器的 `localStorage` 中
- 适用于个人使用和开发环境

### 安全风险
1. **XSS 攻击**：如果页面存在 XSS 漏洞，攻击者可能窃取密钥
2. **持久化存储**：密钥会一直保存直到手动清除
3. **无加密**：密钥以明文形式存储

### 建议的安全措施

#### 个人用户
- ✅ 定期轮换 API 密钥
- ✅ 在 API 提供商处设置使用限额
- ✅ 不在公共或共享计算机上保存密钥
- ✅ 定期清理浏览器数据

#### 企业部署
考虑实现以下增强：

1. **使用 sessionStorage 替代 localStorage**
```typescript
// 在 AIService.ts 中
sessionStorage.setItem("msWordAutoCompleteSettings", JSON.stringify(settings));
```

2. **实现密钥加密**
```typescript
// 示例：使用 Web Crypto API
async function encryptApiKey(key: string): Promise<string> {
  // 实现加密逻辑
}
```

3. **使用后端代理**
- 不在客户端存储密钥
- 通过后端服务器代理 API 调用
- 在服务器端管理密钥

4. **使用环境变量（Electron 应用）**
```javascript
// electron-main.js
const API_KEY = process.env.OPENAI_API_KEY;
```

## 🔒 Electron 安全配置

### 当前配置（开发便利性）
```javascript
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
  enableRemoteModule: true,
}
```

### 安全风险
- 渲染进程可以完全访问 Node.js API
- 可能受到远程代码执行攻击

### 生产环境建议

更新 `electron-main.js`：

```javascript
webPreferences: {
  nodeIntegration: false,        // 禁用 Node.js 集成
  contextIsolation: true,        // 启用上下文隔离
  enableRemoteModule: false,     // 禁用远程模块
  preload: path.join(__dirname, 'preload.js')  // 使用预加载脚本
}
```

创建 `preload.js`：

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露需要的功能
  openExternal: (url) => ipcRenderer.send('open-external', url),
  getVersion: () => ipcRenderer.invoke('get-version')
});
```

## 🌐 网络安全

### HTTPS 要求
- ✅ 所有 API 调用都使用 HTTPS
- ✅ Office 加载项要求 HTTPS 部署

### 生产环境部署

#### 更新 webpack.config.js
```javascript
const urlProd = process.env.PRODUCTION_URL || "https://your-domain.com/";
```

#### 设置环境变量
```bash
# Linux/Mac
export PRODUCTION_URL=https://your-domain.com/

# Windows
set PRODUCTION_URL=https://your-domain.com/
```

#### 更新 manifest.xml
发布前确保所有 URL 使用您的实际域名。

## 📋 安全检查清单

### 部署前
- [ ] 更新所有默认配置
- [ ] 使用环境变量管理敏感信息
- [ ] 启用 Electron 安全最佳实践
- [ ] 配置 HTTPS
- [ ] 实施 API 密钥加密（如需要）
- [ ] 设置 CSP（内容安全策略）

### 运行时
- [ ] 验证所有输入
- [ ] 清理用户生成的内容
- [ ] 限制 API 调用频率
- [ ] 记录安全事件
- [ ] 监控异常活动

### 用户教育
- [ ] 说明密钥的重要性
- [ ] 提供密钥管理最佳实践
- [ ] 警告共享计算机风险
- [ ] 提供定期审查建议

## 🛡️ 数据隐私

### 数据流向
1. **文档内容**：
   - 仅在用户主动使用功能时发送
   - 直接发送到所选的 AI 提供商
   - 本插件不存储或记录

2. **API 密钥**：
   - 存储在本地（localStorage）
   - 不会发送到任何服务器（除了 AI 提供商）

3. **使用数据**：
   - 不收集任何使用统计
   - 不发送遥测数据
   - 完全离线运行（AI 调用除外）

### 合规性考虑
- **GDPR**：用户数据保留在本地
- **企业政策**：可能需要审查 AI 提供商的政策
- **数据驻留**：取决于 AI 提供商的服务器位置

## 🔧 配置示例

### 高安全环境配置

1. **使用自托管 API**
```typescript
// settings.tsx
apiProvider: "custom"
customApiUrl: "https://your-internal-api.company.com/v1"
```

2. **禁用敏感功能**
```typescript
// 在组件中添加访问控制
if (!isInternalNetwork()) {
  // 禁用某些功能
}
```

3. **审计日志**
```typescript
// 记录所有 API 调用
function logApiCall(endpoint: string, timestamp: Date) {
  // 实现审计逻辑
}
```

## 📞 报告安全问题

如发现安全漏洞，请：

1. **不要**在公开的 Issue 中报告
2. 发送邮件到：[安全邮箱地址]
3. 包含详细的重现步骤
4. 允许合理的披露时间

## 🔄 定期更新

- 定期检查依赖更新：`npm audit`
- 更新 Office.js 库
- 关注 Electron 安全公告
- 更新 AI 提供商的 SDK

## 📚 相关资源

- [Office Add-ins 安全最佳实践](https://learn.microsoft.com/office/dev/add-ins/concepts/privacy-and-security)
- [Electron 安全指南](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP 安全指南](https://owasp.org/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**免责声明**：本文档提供的是建议和指导。具体的安全实施应根据您的具体需求和环境进行调整。作者不对因使用本软件而产生的安全问题负责。
