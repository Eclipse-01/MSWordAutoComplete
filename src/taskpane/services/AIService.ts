import axios, { AxiosInstance } from "axios";
import { GitHubCopilotClient, createCopilotClient } from "./GitHubCopilotClient";

interface Settings {
  apiProvider: "github" | "openai" | "custom";
  githubToken: string;
  openaiApiKey: string;
  customApiUrl: string;
  customApiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
}

interface Message {
  role: string;
  content: string;
}

export class AIService {
  private settings: Settings;
  private axiosInstance: AxiosInstance;
  private copilotClient: GitHubCopilotClient | null = null;

  constructor() {
    this.loadSettings();
    this.initializeAxios();
  }

  private loadSettings() {
    try {
      const savedSettings = localStorage.getItem("msWordAutoCompleteSettings");
      this.settings = savedSettings
        ? JSON.parse(savedSettings)
        : {
            apiProvider: "openai",
            githubToken: "",
            openaiApiKey: "",
            customApiUrl: "",
            customApiKey: "",
            modelName: "gpt-3.5-turbo",
            temperature: 0.7,
            maxTokens: 500,
          };
    } catch (error) {
      console.error("加载设置时出错:", error);
      this.settings = {
        apiProvider: "openai",
        githubToken: "",
        openaiApiKey: "",
        customApiUrl: "",
        customApiKey: "",
        modelName: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 500,
      };
    }
  }

  private initializeAxios() {
    let baseURL = "";
    let apiKey = "";

    switch (this.settings.apiProvider) {
      case "github":
        // 注意：使用官方的 GitHub Copilot 语言服务器（Electron）
        // 或者作为后备，使用 GitHub API
        baseURL = "https://api.github.com";
        apiKey = this.settings.githubToken;
        break;
      case "openai":
        baseURL = "https://api.openai.com/v1";
        apiKey = this.settings.openaiApiKey;
        break;
      case "custom":
        baseURL = this.settings.customApiUrl;
        apiKey = this.settings.customApiKey;
        break;
    }

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });
  }

  /**
   * 初始化 GitHub Copilot 客户端（仅 Electron）
   */
  private async ensureCopilotClient() {
    if (this.settings.apiProvider === "github" && !this.copilotClient) {
      this.copilotClient = createCopilotClient({
        githubToken: this.settings.githubToken,
      });

      const initialized = await this.copilotClient.initialize();
      if (!initialized) {
        throw new Error("无法初始化 GitHub Copilot 客户端");
      }
    }
  }

  /**
   * 获取给定文本的补全
   */
  async getCompletion(text: string): Promise<string> {
    this.loadSettings();
    this.initializeAxios();

    try {
      if (this.settings.apiProvider === "github") {
        return await this.getGitHubCopilotCompletion(text);
      } else {
        return await this.getOpenAICompletion(text);
      }
    } catch (error) {
      console.error("获取补全时出错:", error);
      throw new Error("从 AI 服务获取补全失败");
    }
  }

  /**
   * 获取带对话历史的聊天补全
   */
  async getChatCompletion(messages: Message[], newMessage: string): Promise<string> {
    this.loadSettings();
    this.initializeAxios();

    try {
      const response = await this.axiosInstance.post("/chat/completions", {
        model: this.settings.modelName,
        messages: [
          ...messages,
          {
            role: "user",
            content: newMessage,
          },
        ],
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("获取聊天补全时出错:", error);
      throw new Error("从 AI 服务获取聊天补全失败");
    }
  }

  /**
   * 从 GitHub Copilot 获取补全
   * 使用官方语言服务器（Electron）或 GitHub API（浏览器）
   */
  private async getGitHubCopilotCompletion(text: string): Promise<string> {
    try {
      // 尝试使用官方 Copilot 语言服务器（Electron）
      if (typeof window !== "undefined" && (window as any).isElectron) {
        await this.ensureCopilotClient();

        if (this.copilotClient && this.copilotClient.isSignedIn()) {
          // 构造补全请求参数
          const lines = text.split("\n");
          const lastLine = lines[lines.length - 1];

          const completions = await this.copilotClient.getInlineCompletion({
            uri: "file:///document.txt",
            position: {
              line: lines.length - 1,
              character: lastLine.length,
            },
            context: { triggerKind: 1 }, // 自动触发
            version: 0,
          });

          if (completions && completions.length > 0) {
            return completions[0].insertText;
          }
        }
      }

      // 后备：如果不在 Electron 中，提示用户
      throw new Error(
        "GitHub Copilot 需要在 Electron 应用中使用。" + "请下载桌面版本，或使用 OpenAI/自定义 API。"
      );
    } catch (error) {
      console.error("GitHub Copilot 错误:", error);
      throw error;
    }
  }

  /**
   * 从 OpenAI 或 OpenAI 兼容 API 获取补全
   */
  private async getOpenAICompletion(text: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post("/chat/completions", {
        model: this.settings.modelName,
        messages: [
          {
            role: "system",
            content:
              "你是一个有用的写作助手。自然且连贯地续写用户的文本。只提供续写部分，不要重复原文。",
          },
          {
            role: "user",
            content: `自然地续写以下文本：\n\n${text}`,
          },
        ],
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI 错误:", error);
      throw error;
    }
  }

  /**
   * 根据指令编辑文本
   */
  async editText(text: string, instruction: string): Promise<string> {
    this.loadSettings();
    this.initializeAxios();

    try {
      const response = await this.axiosInstance.post("/chat/completions", {
        model: this.settings.modelName,
        messages: [
          {
            role: "system",
            content: "你是一个有用的写作助手。根据用户的指令编辑文本。",
          },
          {
            role: "user",
            content: `原文本：\n${text}\n\n指令：${instruction}\n\n请提供编辑后的文本：`,
          },
        ],
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("编辑文本时出错:", error);
      throw new Error("编辑文本失败");
    }
  }

  /**
   * 根据提示生成文本
   */
  async generateText(prompt: string): Promise<string> {
    this.loadSettings();
    this.initializeAxios();

    try {
      const response = await this.axiosInstance.post("/chat/completions", {
        model: this.settings.modelName,
        messages: [
          {
            role: "system",
            content: "你是一个有用的写作助手。根据用户的请求生成高质量的文本。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("生成文本时出错:", error);
      throw new Error("生成文本失败");
    }
  }

  /**
   * GitHub Copilot 登录（仅 Electron）
   */
  async copilotSignIn(): Promise<{ userCode: string; verificationUri: string }> {
    await this.ensureCopilotClient();

    if (!this.copilotClient) {
      throw new Error("GitHub Copilot 客户端未初始化");
    }

    return await this.copilotClient.signIn();
  }

  /**
   * GitHub Copilot 登出（仅 Electron）
   */
  async copilotSignOut(): Promise<void> {
    if (this.copilotClient) {
      await this.copilotClient.signOut();
    }
  }
}
