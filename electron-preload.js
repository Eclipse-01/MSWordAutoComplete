/**
 * Electron Preload 脚本
 * 安全地暴露 Copilot API 到渲染进程
 */

const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // Copilot 相关
  initializeCopilot: (config) => ipcRenderer.invoke('copilot-initialize', config),
  copilotSignIn: () => ipcRenderer.invoke('copilot-sign-in'),
  copilotSignOut: () => ipcRenderer.invoke('copilot-sign-out'),
  copilotGetCompletion: (params) => ipcRenderer.invoke('copilot-get-completion', params),
  copilotAcceptCompletion: (id) => ipcRenderer.invoke('copilot-accept-completion', id),
  copilotPartialAccept: (id, length) => ipcRenderer.invoke('copilot-partial-accept', id, length),
  
  // 通用功能
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => ipcRenderer.send('open-external-link', url),
});

// 标记为 Electron 环境
contextBridge.exposeInMainWorld('isElectron', true);
