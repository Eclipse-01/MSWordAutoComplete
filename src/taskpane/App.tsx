import * as React from "react";
import { Stack, Text, PrimaryButton, DefaultButton, TextField, Toggle, Dropdown, IDropdownOption } from "@fluentui/react";
import { AutoComplete } from "./components/AutoComplete";
import { InlineChat } from "./components/InlineChat";
import { SidebarChat } from "./components/SidebarChat";
import { Settings } from "./components/Settings";

interface AppState {
  activeTab: "autocomplete" | "inline-chat" | "sidebar-chat" | "settings";
  isInitialized: boolean;
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      activeTab: "autocomplete",
      isInitialized: false,
    };
  }

  componentDidMount() {
    this.setState({ isInitialized: true });
  }

  renderActiveTab() {
    switch (this.state.activeTab) {
      case "autocomplete":
        return <AutoComplete />;
      case "inline-chat":
        return <InlineChat />;
      case "sidebar-chat":
        return <SidebarChat />;
      case "settings":
        return <Settings />;
      default:
        return <AutoComplete />;
    }
  }

  render() {
    return (
      <div className="app-container">
        <Stack tokens={{ childrenGap: 10 }} styles={{ root: { padding: 20 } }}>
          <Text variant="xxLarge" styles={{ root: { fontWeight: "bold" } }}>
            Word 智能补全
          </Text>
          <Text variant="medium">类似 GitHub Copilot 的 Word 写作助手</Text>

          <Stack horizontal tokens={{ childrenGap: 5 }} styles={{ root: { marginTop: 20 } }}>
            <DefaultButton
              text="自动补全"
              onClick={() => this.setState({ activeTab: "autocomplete" })}
              primary={this.state.activeTab === "autocomplete"}
            />
            <DefaultButton
              text="内联聊天"
              onClick={() => this.setState({ activeTab: "inline-chat" })}
              primary={this.state.activeTab === "inline-chat"}
            />
            <DefaultButton
              text="侧边聊天"
              onClick={() => this.setState({ activeTab: "sidebar-chat" })}
              primary={this.state.activeTab === "sidebar-chat"}
            />
            <DefaultButton
              text="设置"
              onClick={() => this.setState({ activeTab: "settings" })}
              primary={this.state.activeTab === "settings"}
            />
          </Stack>

          <div style={{ marginTop: 20 }}>{this.renderActiveTab()}</div>
        </Stack>
      </div>
    );
  }
}
