import * as React from "react";
import { Stack, Text, TextField, PrimaryButton, DefaultButton, Spinner } from "@fluentui/react";
import { AIService } from "../services/AIService";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface SidebarChatState {
  messages: Message[];
  inputText: string;
  isLoading: boolean;
}

export class SidebarChat extends React.Component<{}, SidebarChatState> {
  private aiService: AIService;
  private messagesEndRef: React.RefObject<HTMLDivElement>;

  constructor(props: {}) {
    super(props);
    this.state = {
      messages: [
        {
          role: "system",
          content: "您好！我是您的 AI 写作助手。今天我能如何帮助您处理文档？",
          timestamp: new Date(),
        },
      ],
      inputText: "",
      isLoading: false,
    };
    this.aiService = new AIService();
    this.messagesEndRef = React.createRef();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  sendMessage = async () => {
    if (!this.state.inputText.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: this.state.inputText,
      timestamp: new Date(),
    };

    this.setState({
      messages: [...this.state.messages, userMessage],
      inputText: "",
      isLoading: true,
    });

    try {
      // 获取文档上下文
      let documentContext = "";
      await Word.run(async (context) => {
        const selection = context.document.getSelection();
        selection.load("text");
        await context.sync();
        documentContext = selection.text || "";
      });

      const contextPrompt = documentContext
        ? `文档上下文："${documentContext}"\n\n用户：${userMessage.content}`
        : userMessage.content;

      const response = await this.aiService.getChatCompletion(
        this.state.messages.map((m) => ({ role: m.role, content: m.content })),
        contextPrompt
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      this.setState({
        messages: [...this.state.messages, userMessage, assistantMessage],
        isLoading: false,
      });
    } catch (error) {
      console.error("发送消息时出错:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "抱歉，遇到了错误。请检查您的 API 设置后重试。",
        timestamp: new Date(),
      };
      this.setState({
        messages: [...this.state.messages, errorMessage],
        isLoading: false,
      });
    }
  };

  insertIntoDocument = async (text: string) => {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertText(text, Word.InsertLocation.end);
      await context.sync();
    });
  };

  clearChat = () => {
    this.setState({
      messages: [
        {
          role: "system",
          content: "聊天已清空。我能如何帮助您？",
          timestamp: new Date(),
        },
      ],
    });
  };

  render() {
    return (
      <Stack tokens={{ childrenGap: 15 }} styles={{ root: { height: "100%" } }}>
        <Stack horizontal horizontalAlign="space-between">
          <Text variant="xLarge">侧边聊天</Text>
          <DefaultButton text="清空" onClick={this.clearChat} />
        </Stack>

        <Stack
          tokens={{ childrenGap: 10 }}
          styles={{ root: { flexGrow: 1, maxHeight: 400, overflowY: "auto", padding: 10, border: "1px solid #ddd" } }}
        >
          {this.state.messages.map((msg, index) => (
            <Stack
              key={index}
              tokens={{ childrenGap: 5 }}
              styles={{
                root: {
                  padding: 10,
                  backgroundColor:
                    msg.role === "user" ? "#e3f2fd" : msg.role === "assistant" ? "#f5f5f5" : "#fff3e0",
                  borderRadius: 5,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                },
              }}
            >
              <Text styles={{ root: { fontSize: 10, color: "#666" } }}>
                {msg.role === "user" ? "您" : msg.role === "assistant" ? "AI" : "系统"} •{" "}
                {msg.timestamp.toLocaleTimeString()}
              </Text>
              <Text>{msg.content}</Text>
              {msg.role === "assistant" && (
                <PrimaryButton
                  text="插入到文档"
                  onClick={() => this.insertIntoDocument(msg.content)}
                  styles={{ root: { marginTop: 5 } }}
                />
              )}
            </Stack>
          ))}
          <div ref={this.messagesEndRef} />
        </Stack>

        {this.state.isLoading && <Spinner label="AI 正在思考..." />}

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <TextField
            placeholder="输入您的消息..."
            value={this.state.inputText}
            onChange={(_, newValue) => this.setState({ inputText: newValue || "" })}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
              }
            }}
            multiline
            rows={2}
            styles={{ root: { flexGrow: 1 } }}
          />
          <PrimaryButton text="发送" onClick={this.sendMessage} disabled={this.state.isLoading} />
        </Stack>
      </Stack>
    );
  }
}
