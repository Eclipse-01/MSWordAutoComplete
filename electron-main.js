const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const CopilotLanguageServer = require('./electron-copilot-server');

let mainWindow;
let copilotServer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Word 智能补全',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'electron-preload.js'),
    },
    icon: path.join(__dirname, 'assets/icon-128.png'),
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('https://localhost:3000/taskpane.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/taskpane.html'));
  }

  // 窗口关闭事件
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // 检查更新
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 所有窗口关闭
app.on('window-all-closed', function () {
  if (copilotServer) {
    copilotServer.stop();
  }
  if (process.platform !== 'darwin') app.quit();
});

// 自动更新事件
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '发现新版本',
    message: '发现新版本，正在后台下载...',
    buttons: ['确定']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '更新就绪',
    message: '新版本已下载完成。应用将在重启后更新。',
    buttons: ['立即重启', '稍后']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// GitHub Copilot IPC 处理

// 初始化 Copilot
ipcMain.handle('copilot-initialize', async (event, config) => {
  try {
    if (!copilotServer) {
      copilotServer = new CopilotLanguageServer();
      await copilotServer.start();
    }
    return { success: true };
  } catch (error) {
    console.error('初始化 Copilot 失败:', error);
    return { success: false, error: error.message };
  }
});

// 登录
ipcMain.handle('copilot-sign-in', async () => {
  try {
    if (!copilotServer) {
      throw new Error('Copilot 服务器未初始化');
    }
    const result = await copilotServer.signIn();
    return result;
  } catch (error) {
    console.error('Copilot 登录失败:', error);
    throw error;
  }
});

// 登出
ipcMain.handle('copilot-sign-out', async () => {
  try {
    if (copilotServer) {
      await copilotServer.signOut();
    }
  } catch (error) {
    console.error('Copilot 登出失败:', error);
    throw error;
  }
});

// 获取补全
ipcMain.handle('copilot-get-completion', async (event, params) => {
  try {
    if (!copilotServer) {
      throw new Error('Copilot 服务器未初始化');
    }
    const result = await copilotServer.getInlineCompletion(params);
    return result;
  } catch (error) {
    console.error('获取 Copilot 补全失败:', error);
    throw error;
  }
});

// 接受补全
ipcMain.handle('copilot-accept-completion', async (event, completionId) => {
  try {
    if (copilotServer) {
      await copilotServer.acceptCompletion(completionId);
    }
  } catch (error) {
    console.error('接受补全失败:', error);
  }
});

// 通用 IPC 处理
ipcMain.on('get-app-version', (event) => {
  event.reply('app-version', app.getVersion());
});

ipcMain.on('open-external-link', (event, url) => {
  require('electron').shell.openExternal(url);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // 开发环境允许自签名证书
  if (process.env.NODE_ENV === 'development') {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
