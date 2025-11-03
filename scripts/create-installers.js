#!/usr/bin/env node

/**
 * Windows 自动安装脚本生成器
 * 生成一个 PowerShell 脚本用于自动安装
 */

const fs = require('fs');
const path = require('path');

const installScript = `# Word 智能补全 - 自动安装脚本
# 此脚本将自动配置 Word 加载项

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Word 智能补全 - 自动安装程序" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 获取当前脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "安装目录: $ScriptDir" -ForegroundColor Green

# 检查 manifest.xml 是否存在
$ManifestPath = Join-Path $ScriptDir "manifest.xml"
if (-Not (Test-Path $ManifestPath)) {
    Write-Host "错误: 找不到 manifest.xml 文件！" -ForegroundColor Red
    Write-Host "请确保此脚本与 manifest.xml 在同一目录下。" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ 找到 manifest.xml" -ForegroundColor Green

# 获取 Word 的信任目录注册表路径
$RegPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\WEF\\TrustedCatalogs"

# 创建注册表项（如果不存在）
if (-Not (Test-Path $RegPath)) {
    Write-Host "创建注册表项..." -ForegroundColor Yellow
    New-Item -Path $RegPath -Force | Out-Null
}

# 添加当前目录到信任目录
$TrustedPath = "file:///$($ScriptDir.Replace('\\\\', '/').Replace('\\\\', '/'))"
$KeyName = [Guid]::NewGuid().ToString()

try {
    New-Item -Path "$RegPath\\$KeyName" -Force | Out-Null
    New-ItemProperty -Path "$RegPath\\$KeyName" -Name "Id" -Value $KeyName -PropertyType String -Force | Out-Null
    New-ItemProperty -Path "$RegPath\\$KeyName" -Name "Url" -Value $TrustedPath -PropertyType String -Force | Out-Null
    New-ItemProperty -Path "$RegPath\\$KeyName" -Name "Flags" -Value 1 -PropertyType DWord -Force | Out-Null
    
    Write-Host "✓ 已添加到信任目录" -ForegroundColor Green
} catch {
    Write-Host "警告: 添加信任目录失败" -ForegroundColor Yellow
    Write-Host "您可能需要手动在 Word 中添加此目录：$ScriptDir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "安装完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host "1. 打开 Microsoft Word" -ForegroundColor White
Write-Host "2. 点击 '插入' > '我的加载项'" -ForegroundColor White
Write-Host "3. 选择 '共享文件夹'" -ForegroundColor White
Write-Host "4. 选择 'Word 智能补全'" -ForegroundColor White
Write-Host ""
Write-Host "如需配置 API 密钥，请在插件中点击 '设置' 选项卡" -ForegroundColor Yellow
Write-Host ""
Write-Host "支持：https://github.com/Eclipse-01/MSWordAutoComplete" -ForegroundColor Cyan
Write-Host ""

pause
`;

const outputPath = path.join(__dirname, '../release/install-windows.ps1');

// 确保 release 目录存在
const releaseDir = path.join(__dirname, '../release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

fs.writeFileSync(outputPath, installScript, { encoding: 'utf8' });
console.log('✅ 已生成 Windows 安装脚本：release/install-windows.ps1');

// 生成 Mac 安装脚本
const macInstallScript = `#!/bin/bash

# Word 智能补全 - Mac 自动安装脚本

echo "================================"
echo "Word 智能补全 - 自动安装程序"
echo "================================"
echo ""

# 获取脚本目录
SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
echo "安装目录: $SCRIPT_DIR"

# 检查 manifest.xml
if [ ! -f "$SCRIPT_DIR/manifest.xml" ]; then
    echo "❌ 错误: 找不到 manifest.xml 文件！"
    echo "请确保此脚本与 manifest.xml 在同一目录下。"
    exit 1
fi

echo "✓ 找到 manifest.xml"

# Word 的 wef 目录
WEF_DIR="$HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef"

# 创建 wef 目录（如果不存在）
if [ ! -d "$WEF_DIR" ]; then
    echo "创建 wef 目录..."
    mkdir -p "$WEF_DIR"
fi

# 创建符号链接或复制文件
ADDON_NAME="MSWordAutoComplete"
TARGET_DIR="$WEF_DIR/$ADDON_NAME"

if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  目标目录已存在，将覆盖..."
    rm -rf "$TARGET_DIR"
fi

echo "复制文件到 $TARGET_DIR ..."
cp -R "$SCRIPT_DIR" "$TARGET_DIR"

echo ""
echo "================================"
echo "✓ 安装完成！"
echo "================================"
echo ""
echo "下一步操作："
echo "1. 打开 Microsoft Word"
echo "2. 点击 '插入' > '加载项' > '我的加载项'"
echo "3. 选择 'Word 智能补全'"
echo ""
echo "如需配置 API 密钥，请在插件中点击 '设置' 选项卡"
echo ""
echo "支持：https://github.com/Eclipse-01/MSWordAutoComplete"
echo ""

read -p "按任意键继续..."
`;

const macOutputPath = path.join(__dirname, '../release/install-mac.sh');
fs.writeFileSync(macOutputPath, macInstallScript, { encoding: 'utf8', mode: 0o755 });
console.log('✅ 已生成 Mac 安装脚本：release/install-mac.sh');

console.log('\n使用说明：');
console.log('Windows: 右键 install-windows.ps1，选择 "使用 PowerShell 运行"');
console.log('Mac: 在终端中运行 ./install-mac.sh');
