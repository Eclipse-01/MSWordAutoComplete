import * as React from "react";
import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  DefaultButton,
  Toggle,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";

interface SettingsState {
  apiProvider: "github" | "openai" | "custom";
  githubToken: string;
  openaiApiKey: string;
  customApiUrl: string;
  customApiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  saveMessage: string;
  saveMessageType: MessageBarType;
}

const modelOptions: IDropdownOption[] = [
  { key: "gpt-4", text: "GPT-4" },
  { key: "gpt-4-turbo", text: "GPT-4 Turbo" },
  { key: "gpt-3.5-turbo", text: "GPT-3.5 Turbo" },
  { key: "copilot", text: "GitHub Copilot" },
  { key: "custom", text: "自定义模型" },
];

export class Settings extends React.Component<{}, SettingsState> {
  constructor(props: {}) {
    super(props);

    // 从 localStorage 加载设置
    const savedSettings = this.loadSettings();

    this.state = {
      apiProvider: savedSettings.apiProvider || "openai",
      githubToken: savedSettings.githubToken || "",
      openaiApiKey: savedSettings.openaiApiKey || "",
      customApiUrl: savedSettings.customApiUrl || "",
      customApiKey: savedSettings.customApiKey || "",
      modelName: savedSettings.modelName || "gpt-3.5-turbo",
      temperature: savedSettings.temperature || 0.7,
      maxTokens: savedSettings.maxTokens || 500,
      saveMessage: "",
      saveMessageType: MessageBarType.success,
    };
  }

  loadSettings = (): Partial<SettingsState> => {
    try {
      const settings = localStorage.getItem("msWordAutoCompleteSettings");
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error("加载设置时出错:", error);
      return {};
    }
  };

  saveSettings = () => {
    try {
      const settings = {
        apiProvider: this.state.apiProvider,
        githubToken: this.state.githubToken,
        openaiApiKey: this.state.openaiApiKey,
        customApiUrl: this.state.customApiUrl,
        customApiKey: this.state.customApiKey,
        modelName: this.state.modelName,
        temperature: this.state.temperature,
        maxTokens: this.state.maxTokens,
      };

      localStorage.setItem("msWordAutoCompleteSettings", JSON.stringify(settings));
      this.setState({
        saveMessage: "设置保存成功！",
        saveMessageType: MessageBarType.success,
      });

      // 3秒后清除消息
      setTimeout(() => {
        this.setState({ saveMessage: "" });
      }, 3000);
    } catch (error) {
      console.error("保存设置时出错:", error);
      this.setState({
        saveMessage: "保存设置时出错，请重试。",
        saveMessageType: MessageBarType.error,
      });
    }
  };

  resetSettings = () => {
    localStorage.removeItem("msWordAutoCompleteSettings");
    this.setState({
      apiProvider: "openai",
      githubToken: "",
      openaiApiKey: "",
      customApiUrl: "",
      customApiKey: "",
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 500,
      saveMessage: "设置已重置为默认值。",
      saveMessageType: MessageBarType.warning,
    });
  };

  render() {
    return (
      <Stack tokens={{ childrenGap: 15 }}>
        <Text variant="xLarge">设置</Text>
        <Text>配置您的 AI 提供商和模型设置。</Text>

        {this.state.saveMessage && (
          <MessageBar messageBarType={this.state.saveMessageType} onDismiss={() => this.setState({ saveMessage: "" })}>
            {this.state.saveMessage}
          </MessageBar>
        )}

        <Dropdown
          label="API 提供商"
          selectedKey={this.state.apiProvider}
          options={[
            { key: "github", text: "GitHub Copilot" },
            { key: "openai", text: "OpenAI" },
            { key: "custom", text: "自定义 OpenAI 兼容 API" },
          ]}
          onChange={(_, option) => this.setState({ apiProvider: option?.key as any })}
        />

        {this.state.apiProvider === "github" && (
          <Stack tokens={{ childrenGap: 10 }}>
            <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
              GitHub Copilot 设置
            </Text>
            <TextField
              label="GitHub Token"
              type="password"
              value={this.state.githubToken}
              onChange={(_, newValue) => this.setState({ githubToken: newValue || "" })}
              description="输入您拥有 Copilot 访问权限的 GitHub 个人访问令牌"
            />
            <Text variant="small">
              要获取具有 Copilot 访问权限的 GitHub token，请访问{" "}
              <a href="https://github.com/settings/tokens" target="_blank">
                GitHub 设置
              </a>
            </Text>
          </Stack>
        )}

        {this.state.apiProvider === "openai" && (
          <Stack tokens={{ childrenGap: 10 }}>
            <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
              OpenAI 设置
            </Text>
            <TextField
              label="OpenAI API Key"
              type="password"
              value={this.state.openaiApiKey}
              onChange={(_, newValue) => this.setState({ openaiApiKey: newValue || "" })}
              description="输入您的 OpenAI API 密钥"
            />
          </Stack>
        )}

        {this.state.apiProvider === "custom" && (
          <Stack tokens={{ childrenGap: 10 }}>
            <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
              自定义 API 设置
            </Text>
            <TextField
              label="API URL"
              value={this.state.customApiUrl}
              onChange={(_, newValue) => this.setState({ customApiUrl: newValue || "" })}
              description="输入您的 OpenAI 兼容 API 的基础 URL"
              placeholder="https://api.example.com/v1"
            />
            <TextField
              label="API Key"
              type="password"
              value={this.state.customApiKey}
              onChange={(_, newValue) => this.setState({ customApiKey: newValue || "" })}
              description="输入您的 API 密钥"
            />
          </Stack>
        )}

        <Dropdown
          label="模型"
          selectedKey={this.state.modelName}
          options={modelOptions}
          onChange={(_, option) => this.setState({ modelName: option?.key as string })}
        />

        <TextField
          label="温度值"
          type="number"
          value={this.state.temperature.toString()}
          onChange={(_, newValue) => {
            const val = parseFloat(newValue || "0.7");
            this.setState({ temperature: Math.max(0, Math.min(2, val)) });
          }}
          description="控制随机性 (0.0 - 2.0)。较低值更专注，较高值更有创造性。"
        />

        <TextField
          label="最大 Token 数"
          type="number"
          value={this.state.maxTokens.toString()}
          onChange={(_, newValue) => this.setState({ maxTokens: parseInt(newValue || "500") })}
          description="生成文本的最大长度"
        />

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton text="保存设置" onClick={this.saveSettings} />
          <DefaultButton text="恢复默认值" onClick={this.resetSettings} />
        </Stack>

        <Stack tokens={{ childrenGap: 5 }} styles={{ root: { marginTop: 20, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 5 } }}>
          <Text variant="small" styles={{ root: { fontWeight: "bold" } }}>
            声明
          </Text>
          <Text variant="small">
            本插件是第三方开发的扩展工具，与 Microsoft 官方无关。使用本插件需要您自己的 API 密钥和服务。
          </Text>
        </Stack>
      </Stack>
    );
  }
}
