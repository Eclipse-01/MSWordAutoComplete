import * as React from "react";
import { Stack, Text, PrimaryButton, TextField, Spinner, Toggle } from "@fluentui/react";
import { AIService } from "../services/AIService";

interface AutoCompleteState {
  isEnabled: boolean;
  isLoading: boolean;
  suggestion: string;
  currentText: string;
  autoTrigger: boolean;
}

export class AutoComplete extends React.Component<{}, AutoCompleteState> {
  private aiService: AIService;
  private textChangeListener: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      isEnabled: false,
      isLoading: false,
      suggestion: "",
      currentText: "",
      autoTrigger: true,
    };
    this.aiService = new AIService();
  }

  componentDidMount() {
    if (this.state.isEnabled) {
      this.setupAutoComplete();
    }
  }

  componentWillUnmount() {
    this.cleanupAutoComplete();
  }

  setupAutoComplete = async () => {
    try {
      await Word.run(async (context) => {
        const contentControls = context.document.contentControls;
        context.load(contentControls);
        await context.sync();

        // 设置文本变化监听器
        Office.context.document.addHandlerAsync(
          Office.EventType.DocumentSelectionChanged,
          this.handleSelectionChange
        );
      });
    } catch (error) {
      console.error("设置自动补全时出错:", error);
    }
  };

  cleanupAutoComplete = () => {
    Office.context.document.removeHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      this.handleSelectionChange
    );
  };

  handleSelectionChange = async () => {
    if (!this.state.isEnabled || !this.state.autoTrigger) return;

    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load("text");
      await context.sync();

      if (selection.text && selection.text.length > 10) {
        this.getSuggestion(selection.text);
      }
    });
  };

  getSuggestion = async (text: string) => {
    this.setState({ isLoading: true, currentText: text });

    try {
      const suggestion = await this.aiService.getCompletion(text);
      this.setState({ suggestion, isLoading: false });
    } catch (error) {
      console.error("获取建议时出错:", error);
      this.setState({ isLoading: false, suggestion: "获取建议时出错" });
    }
  };

  applySuggestion = async () => {
    if (!this.state.suggestion) return;

    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertText(this.state.suggestion, Word.InsertLocation.end);
      await context.sync();
      this.setState({ suggestion: "" });
    });
  };

  toggleAutoComplete = () => {
    const newState = !this.state.isEnabled;
    this.setState({ isEnabled: newState });

    if (newState) {
      this.setupAutoComplete();
    } else {
      this.cleanupAutoComplete();
    }
  };

  manualTrigger = async () => {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load("text");
      await context.sync();

      if (selection.text) {
        this.getSuggestion(selection.text);
      }
    });
  };

  render() {
    return (
      <Stack tokens={{ childrenGap: 15 }}>
        <Text variant="xLarge">自动补全</Text>
        <Text>在您键入文档时获取 AI 驱动的补全建议。</Text>

        <Toggle
          label="启用自动补全"
          checked={this.state.isEnabled}
          onChange={this.toggleAutoComplete}
          onText="开启"
          offText="关闭"
        />

        <Toggle
          label="自动触发"
          checked={this.state.autoTrigger}
          onChange={() => this.setState({ autoTrigger: !this.state.autoTrigger })}
          onText="自动"
          offText="手动"
          disabled={!this.state.isEnabled}
        />

        {!this.state.autoTrigger && (
          <PrimaryButton text="获取建议" onClick={this.manualTrigger} disabled={!this.state.isEnabled} />
        )}

        {this.state.isLoading && (
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <Spinner label="正在获取建议..." />
          </Stack>
        )}

        {this.state.suggestion && (
          <Stack tokens={{ childrenGap: 10 }}>
            <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
              建议内容：
            </Text>
            <TextField
              multiline
              rows={6}
              value={this.state.suggestion}
              readOnly
              styles={{ root: { backgroundColor: "#f5f5f5" } }}
            />
            <PrimaryButton text="应用建议" onClick={this.applySuggestion} />
          </Stack>
        )}
      </Stack>
    );
  }
}
