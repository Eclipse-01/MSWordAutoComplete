/**
 * GitHub Copilot 语言服务器客户端
 * 使用官方的 @github/copilot-language-server
 */

export interface CopilotConfig {
  githubToken?: string;
  proxyUrl?: string;
  gheUrl?: string;
}

export interface InlineCompletionParams {
  uri: string;
  position: { line: number; character: number };
  context: { triggerKind: number };
  version: number;
}

export interface CompletionItem {
  insertText: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  command?: {
    command: string;
    arguments: any[];
  };
}

/**
 * GitHub Copilot 客户端封装
 * 注意：这个实现需要在 Node.js 环境（如 Electron）中运行
 * 在纯浏览器环境中无法使用语言服务器
 */
export class GitHubCopilotClient {
  private isAuthenticated: boolean = false;
  private config: CopilotConfig;

  constructor(config: CopilotConfig) {
    this.config = config;
  }

  /**
   * 检查是否在 Node.js 环境中
   */
  private isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
  }

  /**
   * 初始化 Copilot 连接
   */
  async initialize(): Promise<boolean> {
    if (!this.isNodeEnvironment()) {
      console.warn('GitHub Copilot 语言服务器需要 Node.js 环境（Electron）');
      return false;
    }

    try {
      // 在 Electron 环境中，通过 IPC 与主进程通信
      // 主进程负责管理语言服务器进程
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.initializeCopilot(this.config);
        this.isAuthenticated = result.success;
        return result.success;
      }

      return false;
    } catch (error) {
      console.error('初始化 GitHub Copilot 失败:', error);
      return false;
    }
  }

  /**
   * 登录到 GitHub Copilot
   */
  async signIn(): Promise<{ userCode: string; verificationUri: string }> {
    if (!this.isNodeEnvironment() || !((window as any).electronAPI)) {
      throw new Error('GitHub Copilot 需要 Electron 环境');
    }

    try {
      const result = await (window as any).electronAPI.copilotSignIn();
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async signOut(): Promise<void> {
    if (this.isNodeEnvironment() && (window as any).electronAPI) {
      await (window as any).electronAPI.copilotSignOut();
    }
    this.isAuthenticated = false;
  }

  /**
   * 获取内联补全
   */
  async getInlineCompletion(params: InlineCompletionParams): Promise<CompletionItem[]> {
    if (!this.isAuthenticated) {
      throw new Error('未登录到 GitHub Copilot');
    }

    if (!this.isNodeEnvironment() || !((window as any).electronAPI)) {
      throw new Error('GitHub Copilot 需要 Electron 环境');
    }

    try {
      const result = await (window as any).electronAPI.copilotGetCompletion(params);
      return result.items || [];
    } catch (error) {
      console.error('获取补全失败:', error);
      throw error;
    }
  }

  /**
   * 接受补全（用于遥测）
   */
  async acceptCompletion(completionId: string): Promise<void> {
    if (this.isNodeEnvironment() && (window as any).electronAPI) {
      await (window as any).electronAPI.copilotAcceptCompletion(completionId);
    }
  }

  /**
   * 部分接受补全
   */
  async partiallyAcceptCompletion(completionId: string, acceptedLength: number): Promise<void> {
    if (this.isNodeEnvironment() && (window as any).electronAPI) {
      await (window as any).electronAPI.copilotPartialAccept(completionId, acceptedLength);
    }
  }

  /**
   * 检查认证状态
   */
  isSignedIn(): boolean {
    return this.isAuthenticated;
  }
}

/**
 * 创建 GitHub Copilot 客户端
 */
export function createCopilotClient(config: CopilotConfig): GitHubCopilotClient {
  return new GitHubCopilotClient(config);
}
