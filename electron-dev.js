const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let devServer;

function startDevServer() {
  return new Promise((resolve, reject) => {
    devServer = spawn('npm', ['run', 'dev-server'], {
      shell: true,
      stdio: 'inherit'
    });

    devServer.on('error', reject);
    
    // 等待服务器启动
    setTimeout(resolve, 5000);
  });
}

async function createWindow() {
  // 启动开发服务器
  await startDevServer();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Word 智能补全 - 开发模式',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets/icon-128.png'),
  });

  mainWindow.loadURL('https://localhost:3000/taskpane.html');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
    if (devServer) {
      devServer.kill();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (devServer) {
    devServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

process.on('SIGTERM', () => {
  if (devServer) {
    devServer.kill();
  }
  app.quit();
});
