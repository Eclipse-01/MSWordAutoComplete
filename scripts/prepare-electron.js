#!/usr/bin/env node

/**
 * 为 Electron 构建准备文件
 * 确保所有资源正确复制到 dist 目录
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 准备 Electron 构建...');

const distDir = path.join(__dirname, '../dist');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  console.error('❌ dist 目录不存在！请先运行 npm run build');
  process.exit(1);
}

// 复制 electron-main.js 到 dist
const electronMain = path.join(__dirname, '../electron-main.js');
const electronMainDest = path.join(distDir, 'electron-main.js');

if (fs.existsSync(electronMain)) {
  fs.copyFileSync(electronMain, electronMainDest);
  console.log('✅ 复制 electron-main.js');
}

// 复制 package.json（仅包含必要信息）
const packageJson = require('../package.json');
const minimalPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  author: packageJson.author,
  main: 'electron-main.js',
  license: packageJson.license,
  dependencies: {
    'electron-updater': packageJson.devDependencies['electron-updater']
  }
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(minimalPackageJson, null, 2)
);
console.log('✅ 创建最小化 package.json');

// 创建自述文件
const readmeContent = `
# Word 智能补全 (Electron 版本)

这是 Word 智能补全的独立桌面应用版本。

## 功能

- 自动补全：AI 驱动的智能文本补全
- 内联聊天：与 AI 讨论选中的文本
- 侧边聊天：完整的对话界面
- 多 AI 提供商支持：GitHub Copilot、OpenAI、自定义 API

## 使用说明

1. 启动应用
2. 在设置中配置您的 API 密钥
3. 开始使用各项功能

## 注意

- 本应用是第三方工具，与 Microsoft 官方无关
- 使用需要您自己的 API 密钥
- 请妥善保管您的 API 密钥

## 支持

访问：https://github.com/Eclipse-01/MSWordAutoComplete
`;

fs.writeFileSync(path.join(distDir, 'README.txt'), readmeContent.trim());
console.log('✅ 创建 README.txt');

console.log('✅ Electron 构建准备完成！');
