/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { initializeIcons } from "@fluentui/react";
import App from "./App";

// Initialize Fluent UI icons
initializeIcons();

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Render the React app
    const container = document.getElementById("container");
    if (container) {
      ReactDOM.render(React.createElement(App), container);
    }
  }
});
