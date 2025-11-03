/**
 * GitHub Copilot 语言服务器管理器（Electron 主进程）
 * 使用官方的 @github/copilot-language-server
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

class CopilotLanguageServer {
  constructor() {
    this.serverProcess = null;
    this.isReady = false;
    this.messageId = 0;
    this.pendingRequests = new Map();
    this.rl = null;
  }

  /**
   * 启动语言服务器
   */
  async start() {
    if (this.serverProcess) {
      console.log('Copilot 语言服务器已在运行');
      return;
    }

    try {
      // 查找语言服务器二进制文件
      const serverPath = this.findServerBinary();
      
      console.log('启动 Copilot 语言服务器:', serverPath);
      
      // 启动服务器进程
      this.serverProcess = spawn(serverPath, ['--stdio'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // 设置行读取器
      this.rl = readline.createInterface({
        input: this.serverProcess.stdout,
        crlfDelay: Infinity
      });

      // 处理输出
      let contentLength = 0;
      let buffer = '';

      this.rl.on('line', (line) => {
        if (line.startsWith('Content-Length:')) {
          contentLength = parseInt(line.split(':')[1].trim());
        } else if (line === '') {
          // 空行表示头部结束，接下来是内容
          buffer = '';
        } else if (contentLength > 0 && buffer.length < contentLength) {
          buffer += line;
          if (buffer.length >= contentLength) {
            try {
              const message = JSON.parse(buffer);
              this.handleMessage(message);
            } catch (error) {
              console.error('解析消息失败:', error);
            }
            contentLength = 0;
            buffer = '';
          }
        }
      });

      // 错误处理
      this.serverProcess.stderr.on('data', (data) => {
        console.error('Copilot 服务器错误:', data.toString());
      });

      this.serverProcess.on('close', (code) => {
        console.log(`Copilot 服务器进程退出，代码: ${code}`);
        this.serverProcess = null;
        this.isReady = false;
      });

      // 发送初始化请求
      await this.initialize();

      this.isReady = true;
      console.log('Copilot 语言服务器已就绪');

    } catch (error) {
      console.error('启动 Copilot 语言服务器失败:', error);
      throw error;
    }
  }

  /**
   * 查找语言服务器二进制文件
   */
  findServerBinary() {
    const platform = process.platform;
    const arch = process.arch;
    
    // 根据平台选择合适的二进制文件
    let binaryName;
    if (platform === 'darwin') {
      binaryName = arch === 'arm64' 
        ? '@github/copilot-language-server-darwin-arm64' 
        : '@github/copilot-language-server-darwin-x64';
    } else if (platform === 'win32') {
      binaryName = '@github/copilot-language-server-win32-x64';
    } else {
      binaryName = '@github/copilot-language-server-linux-x64';
    }

    const binaryPath = path.join(
      __dirname,
      'node_modules',
      binaryName,
      'copilot-language-server'
    );

    // 如果找不到，尝试使用 Node.js 版本
    const nodePath = path.join(
      __dirname,
      'node_modules',
      '@github',
      'copilot-language-server',
      'dist',
      'language-server.js'
    );

    const fs = require('fs');
    if (fs.existsSync(binaryPath)) {
      return binaryPath;
    } else if (fs.existsSync(nodePath)) {
      return process.execPath + ' ' + nodePath;
    } else {
      throw new Error('找不到 Copilot 语言服务器');
    }
  }

  /**
   * 发送 LSP 消息
   */
  sendMessage(message) {
    if (!this.serverProcess || !this.serverProcess.stdin.writable) {
      throw new Error('语言服务器未运行');
    }

    const content = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(content, 'utf8')}\r\n\r\n`;
    this.serverProcess.stdin.write(header + content);
  }

  /**
   * 发送请求并等待响应
   */
  async sendRequest(method, params) {
    const id = ++this.messageId;
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.sendMessage(message);

      // 30秒超时
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('请求超时'));
        }
      }, 30000);
    });
  }

  /**
   * 发送通知（不需要响应）
   */
  sendNotification(method, params) {
    const message = {
      jsonrpc: '2.0',
      method,
      params
    };
    this.sendMessage(message);
  }

  /**
   * 处理来自服务器的消息
   */
  handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
    } else if (message.method) {
      // 处理服务器发来的通知或请求
      this.handleNotification(message.method, message.params);
    }
  }

  /**
   * 处理通知
   */
  handleNotification(method, params) {
    console.log('收到通知:', method, params);
    // 可以在这里处理状态通知等
  }

  /**
   * 初始化语言服务器
   */
  async initialize() {
    const result = await this.sendRequest('initialize', {
      processId: process.pid,
      capabilities: {
        workspace: { workspaceFolders: true }
      },
      initializationOptions: {
        editorInfo: {
          name: 'Word智能补全',
          version: '1.0.0'
        },
        editorPluginInfo: {
          name: 'Word智能补全 Electron',
          version: '1.0.0'
        }
      }
    });

    // 发送 initialized 通知
    this.sendNotification('initialized', {});

    return result;
  }

  /**
   * 登录
   */
  async signIn() {
    try {
      const result = await this.sendRequest('signIn', {});
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async signOut() {
    try {
      await this.sendRequest('signOut', {});
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  /**
   * 获取内联补全
   */
  async getInlineCompletion(params) {
    try {
      const result = await this.sendRequest('textDocument/inlineCompletion', params);
      return result;
    } catch (error) {
      console.error('获取补全失败:', error);
      throw error;
    }
  }

  /**
   * 接受补全
   */
  async acceptCompletion(completionId) {
    this.sendNotification('workspace/executeCommand', {
      command: 'github.copilot.didAcceptCompletionItem',
      arguments: [completionId]
    });
  }

  /**
   * 停止语言服务器
   */
  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
      this.isReady = false;
    }
  }
}

module.exports = CopilotLanguageServer;
