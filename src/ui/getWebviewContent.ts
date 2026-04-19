// src\ui\getWebviewContent.ts
// -----------------------------
// WebView HTML 生成
// -----------------------------
import * as vscode from "vscode";
import type { Labels } from "../common/labels";
import { getNonce } from "../extension/getNonce";

export function getWebviewContent(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  labels: Labels,
  lang: string
): string {

  const nonce = getNonce();

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview", "main.js")
  );

  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview", "style.css")
  );

  const safeLabels = JSON.stringify(labels).replace(/</g, "\\u003c");

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Security-Policy"
        content="
          default-src 'none';
          img-src ${webview.cspSource} https:;
          style-src ${webview.cspSource} 'unsafe-inline';
          script-src 'nonce-${nonce}';
          font-src ${webview.cspSource};
        ">
      <link rel="stylesheet" href="${styleUri}">
      <title>Excel Grep</title>
    </head>

    <body>
      <div id="search-area">
        <div class="search-header">
          <h2>Excel Grepper</h2>

          <div class="form-row">
            <label>${labels.search.filePath}</label>
            <input id="folderInput" type="text">
            <button id="fileDialogBtn">${labels.search.select}</button>
          </div>

          <div class="form-row">
            <label>${labels.search.keyword}</label>
            <input id="keywordInput" type="text">
          </div>

          <div class="checkbox-row">
            <label>
              <input id="ignoreCaseInput" type="checkbox">
              ${labels.search.ignoreCase}
            </label>
            <label style="margin-left: 20px;">
              <input id="dateSearchInput" type="checkbox">
              ${labels.search.dateSearch}
            </label>
          </div>

          <div class="button-row">
            <div class="left-buttons">
              <button id="searchBtn">${labels.search.search}</button>
              <button id="cancelBtn" disabled>${labels.search.cancel}</button>
            </div>
            <div class="right-buttons">
              <button id="csvBtn" disabled>${labels.search.csv}</button>
            </div>
          </div>
        </div>
      </div>

      <div id="status-area" class="status-area"></div>
      <div id="result-area"></div>

      <script nonce="${nonce}">
        window.labels = ${safeLabels};
      </script>

      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>
  `;
}
