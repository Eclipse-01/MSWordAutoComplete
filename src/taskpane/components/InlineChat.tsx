import * as React from "react";
import { Stack, Text, TextField, PrimaryButton, Spinner } from "@fluentui/react";
import { AIService } from "../services/AIService";

interface InlineChatState {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  inputText: string;
  isLoading: boolean;
  selectedText: string;
}

export class InlineChat extends React.Component<{}, InlineChatState> {
  private aiService: AIService;

  constructor(props: {}) {
    super(props);
    this.state = {
      messages: [],
      inputText: "",
      isLoading: false,
      selectedText: "",
    };
    this.aiService = new AIService();
  }

  componentDidMount() {
    this.getSelectedText();
  }

  getSelectedText = async () => {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load("text");
      await context.sync();

      this.setState({ selectedText: selection.text || "" });
    });
  };

  sendMessage = async () => {
    if (!this.state.inputText.trim()) return;

    const userMessage = this.state.inputText;
    const newMessages = [...this.state.messages, { role: "user" as const, content: userMessage }];

    this.setState({
      messages: newMessages,
      inputText: "",
      isLoading: true,
    });

    try {
      const context = this.state.selectedText
        ? `选中的文本："${this.state.selectedText}"\n\n用户请求：${userMessage}`
        : userMessage;

      const response = await this.aiService.getCompletion(context);
      this.setState({
        messages: [...newMessages, { role: "assistant", content: response }],
        isLoading: false,
      });
    } catch (error) {
      console.error("发送消息时出错:", error);
      this.setState({
        messages: [
          ...newMessages,
          { role: "assistant", content: "错误：无法从 AI 服务获取响应。" },
        ],
        isLoading: false,
      });
    }
  };

  applyToDocument = async (text: string) => {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      if (this.state.selectedText) {
        // 替换选中的文本
        selection.insertText(text, Word.InsertLocation.replace);
      } else {
        // 在光标处插入
        selection.insertText(text, Word.InsertLocation.end);
      }
      await context.sync();
    });
  };

  render() {
    return (
      <Stack tokens={{ childrenGap: 15 }}>
        <Text variant="xLarge">内联聊天</Text>
        <Text>与 AI 讨论您选中的文本或获得写作帮助。</Text>

        {this.state.selectedText && (
          <Stack tokens={{ childrenGap: 5 }}>
            <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
              选中的文本：
            </Text>
            <TextField
              multiline
              rows={3}
              value={this.state.selectedText}
              readOnly
              styles={{ root: { backgroundColor: "#f0f0f0" } }}
            />
            <PrimaryButton text="刷新选择" onClick={this.getSelectedText} />
          </Stack>
        )}

        <Stack tokens={{ childrenGap: 10 }} styles={{ root: { maxHeight: 300, overflowY: "auto" } }}>
          {this.state.messages.map((msg, index) => (
            <Stack
              key={index}
              tokens={{ childrenGap: 5 }}
              styles={{
                root: {
                  padding: 10,
                  backgroundColor: msg.role === "user" ? "#e3f2fd" : "#f5f5f5",
                  borderRadius: 5,
                },
              }}
            >
              <Text styles={{ root: { fontWeight: "bold" } }}>
                {msg.role === "user" ? "您：" : "AI："}
              </Text>
              <Text>{msg.content}</Text>
              {msg.role === "assistant" && (
                <PrimaryButton text="应用到文档" onClick={() => this.applyToDocument(msg.content)} />
              )}
            </Stack>
          ))}
        </Stack>

        {this.state.isLoading && <Spinner label="思考中..." />}

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <TextField
            placeholder="向 AI 请求帮助..."
            value={this.state.inputText}
            onChange={(_, newValue) => this.setState({ inputText: newValue || "" })}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
              }
            }}
            styles={{ root: { flexGrow: 1 } }}
          />
          <PrimaryButton text="发送" onClick={this.sendMessage} disabled={this.state.isLoading} />
        </Stack>
      </Stack>
    );
  }
}
