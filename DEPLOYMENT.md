# 部署配置指南

本文档说明如何为生产环境配置和部署 Word 智能补全插件。

## 📋 部署前准备

### 1. 更新版本号

在以下文件中更新版本号：

**package.json**:
```json
{
  "version": "1.0.0"
}
```

**manifest.xml**:
```xml
<Version>1.0.0.0</Version>
```

### 2. 配置生产环境 URL

**方式 A：使用环境变量（推荐）**

创建 `.env.production` 文件：
```bash
PRODUCTION_URL=https://your-domain.com/word-autocomplete/
```

更新 `webpack.config.js`：
```javascript
const urlProd = process.env.PRODUCTION_URL || "https://localhost:3000/";
```

**方式 B：直接修改**

在 `webpack.config.js` 中：
```javascript
const urlProd = "https://your-domain.com/word-autocomplete/";
```

### 3. 生成图标文件

#### Windows Electron 应用

生成 ICO 文件：
```bash
# 使用在线工具或 ImageMagick
convert assets/icon-128.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico
```

更新 `package.json`：
```json
"build": {
  "win": {
    "icon": "assets/icon.ico"
  }
}
```

#### Mac Electron 应用

Mac 已使用 PNG，但可以创建 ICNS 文件以获得更好的效果：
```bash
# 创建 iconset
mkdir -p icon.iconset
sips -z 16 16     icon-128.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon-128.png --out icon.iconset/icon_16x16@2x.png
# ... 更多尺寸
iconutil -c icns icon.iconset
```

## 🌐 Web 服务器部署

### 选项 1：静态文件服务器

#### 使用 Nginx

1. 构建项目：
```bash
npm run build
```

2. 配置 Nginx：
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /path/to/MSWordAutoComplete/dist;
    index taskpane.html;

    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header X-Content-Type-Options "nosniff";
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. 重启 Nginx：
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 使用 Apache

`.htaccess`:
```apache
# 强制 HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 安全头
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# 缓存策略
<FilesMatch "\.(html|xml)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>

<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

### 选项 2：CDN 部署

#### 使用 GitHub Pages

1. 创建 `gh-pages` 分支
2. 推送 dist 文件夹
3. 在 GitHub 设置中启用 Pages

或使用 `gh-pages` 包：
```bash
npm install --save-dev gh-pages

# 在 package.json 添加
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

npm run deploy
```

#### 使用 Netlify

1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 发布目录：`dist`
4. 自动部署

#### 使用 Vercel

```bash
npm install -g vercel
vercel --prod
```

## 🖥️ Electron 应用部署

### 本地构建

```bash
# 安装所有依赖
npm install --save-dev electron electron-builder

# 构建所有平台（需要在相应平台上运行）
npm run electron:build

# 或单独构建
npm run electron:build:win    # Windows
npm run electron:build:mac    # Mac
npm run electron:build:linux  # Linux
```

### CI/CD 自动构建

#### GitHub Actions

创建 `.github/workflows/build.yml`：

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Build Electron app
        run: npm run electron:build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: release/*
```

### 代码签名

#### Windows

1. 获取代码签名证书
2. 更新 `package.json`：

```json
"build": {
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password",
    "signingHashAlgorithms": ["sha256"]
  }
}
```

#### Mac

1. 加入 Apple Developer Program
2. 创建开发者证书
3. 配置公证：

```json
"build": {
  "mac": {
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  },
  "afterSign": "build/notarize.js"
}
```

## 🔄 自动更新配置

### 配置更新服务器

**electron-builder.yml**:
```yaml
publish:
  provider: github
  owner: Eclipse-01
  repo: MSWordAutoComplete
  releaseType: release
```

或使用其他提供商：
```yaml
publish:
  provider: s3
  bucket: my-bucket
  region: us-west-2
```

### 测试更新

```bash
# 发布新版本
git tag v1.0.1
git push origin v1.0.1

# 构建并发布
npm run electron:build -- --publish always
```

## 📦 Office 加载项发布

### Microsoft AppSource（可选）

1. 注册合作伙伴中心账户
2. 准备提交材料：
   - manifest.xml
   - 应用图标
   - 截图
   - 使用说明
   - 隐私政策
   - 支持文档

3. 提交审核

### 企业内部分发

1. 将 manifest.xml 部署到 SharePoint 或文件服务器
2. 用户通过 URL 添加加载项
3. 或使用集中式部署（Microsoft 365 管理中心）

## 🔒 安全配置

### SSL/TLS 证书

**Let's Encrypt**（免费）:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### CSP 头

在 HTML 中添加：
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://appsforoffice.microsoft.com; 
               style-src 'self' 'unsafe-inline' https://res-1.cdn.office.net;
               connect-src 'self' https://api.openai.com https://api.github.com;">
```

## 📊 监控和日志

### 应用监控

集成监控服务（可选）：

```typescript
// 在 taskpane.ts
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: "production"
});
```

### 错误日志

```typescript
window.addEventListener('error', (event) => {
  // 发送到日志服务
  console.error('Error:', event.error);
});
```

## ✅ 部署检查清单

部署前确认：

- [ ] 版本号已更新
- [ ] 生产 URL 已配置
- [ ] 图标文件已优化
- [ ] SSL 证书已配置
- [ ] manifest.xml 已更新
- [ ] 所有依赖已安装
- [ ] 构建成功无错误
- [ ] 在目标环境测试
- [ ] 安全头已配置
- [ ] 备份计划已准备

## 🔧 故障排除

### 常见问题

**问题：加载项无法加载**
- 检查 HTTPS 配置
- 验证 manifest.xml URL
- 查看浏览器控制台错误

**问题：Electron 应用无法启动**
- 检查权限
- 验证路径
- 查看应用日志

**问题：自动更新失败**
- 验证发布配置
- 检查网络连接
- 查看更新日志

## 📞 获取帮助

- GitHub Issues: https://github.com/Eclipse-01/MSWordAutoComplete/issues
- 文档: 查看其他 .md 文件
- 社区: [相关论坛链接]
