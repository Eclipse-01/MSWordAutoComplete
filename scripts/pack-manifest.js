#!/usr/bin/env node

/**
 * 打包 Office 加载项为可分发的包
 * 生成一个包含所有必需文件的 zip 文件
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const packageJson = require('../package.json');
const version = packageJson.version;

// 输出目录
const outputDir = path.join(__dirname, '../release');
const outputFile = path.join(outputDir, `MSWordAutoComplete-v${version}.zip`);

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 创建 zip 文件
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // 最高压缩级别
});

output.on('close', function() {
  console.log(`✅ 打包完成！`);
  console.log(`📦 文件大小：${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 输出路径：${outputFile}`);
  console.log(`\n分发说明：`);
  console.log(`1. 将此 zip 文件分发给用户`);
  console.log(`2. 用户解压到本地文件夹`);
  console.log(`3. 按照 DISTRIBUTION.md 中的说明在 Word 中安装`);
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// 添加 dist 目录
console.log('📦 添加构建文件...');
archive.directory('dist/', 'dist');

// 添加 manifest.xml
console.log('📦 添加 manifest.xml...');
archive.file('manifest.xml', { name: 'manifest.xml' });

// 添加文档
console.log('📦 添加文档...');
archive.file('README.md', { name: 'README.md' });
archive.file('DISTRIBUTION.md', { name: 'DISTRIBUTION.md' });
archive.file('USAGE.md', { name: 'USAGE.md' });

// 添加安装说明
const installInstructions = `
# Word 智能补全 - 安装说明

## 快速安装

### Windows 用户

1. 解压此文件到任意文件夹，例如 C:\\MSWordAutoComplete
2. 打开 Microsoft Word
3. 点击 "文件" > "选项" > "信任中心" > "信任中心设置"
4. 选择 "受信任的加载项目录"
5. 点击 "添加新位置"，选择解压后的文件夹
6. 勾选 "此位置的子文件夹也受信任"，点击 "确定"
7. 重启 Word
8. 点击 "插入" > "我的加载项" > "共享文件夹"
9. 选择 "Word 智能补全"

### Mac 用户

1. 解压此文件
2. 打开 Finder，按 Cmd+Shift+G
3. 输入：~/Library/Containers/com.microsoft.Word/Data/Documents/wef
4. 如果 wef 文件夹不存在，创建它
5. 将解压后的文件夹复制到 wef 目录
6. 重启 Word
7. 点击 "插入" > "加载项" > "我的加载项"
8. 选择 "Word 智能补全"

## 配置

首次使用需要配置 API 密钥：

1. 在 Word 中打开插件
2. 点击 "设置" 选项卡
3. 选择您的 AI 提供商（OpenAI、GitHub Copilot 或自定义）
4. 输入相应的 API 密钥
5. 保存设置

详细使用说明请参考 USAGE.md

## 支持

如有问题，请访问：
https://github.com/Eclipse-01/MSWordAutoComplete/issues

---
第三方插件 - 与 Microsoft 官方无关
版本：${version}
`;

archive.append(installInstructions, { name: 'INSTALL.txt' });

// 完成打包
console.log('📦 正在压缩...');
archive.finalize();
