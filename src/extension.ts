// src\extension.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import { FromWebviewMessage } from "./common/message";
import { getlang, getLabels } from "./i18n/i18n";

import {
  postInitLabels,
  postRestoreState,
  postSearchError,
  postFolderSelected
} from "./extensionCore/messaging";

import {
  createInitialState,
  ExtensionState
} from "./extensionCore/state";

import { validateKeyword } from "./validation/validateKeyword";
import { validateFolderPath } from "./validation/validateFolderPath";
import { validateDateSearch } from "./validation/validateDateSearch";

import { exportCsv } from "./extensionCore/exportCsv";
import { startSearch } from "./search/startSearch";
import { getWebviewContent } from "./ui/getWebviewContent";
import { openExcelFile } from "./extensionCore/openExcelFile";
// import { quoteSheetNameIfNeeded } from "./extension/sanitize";

let panel: vscode.WebviewPanel | undefined;
let state: ExtensionState = createInitialState();

export function activate(context: vscode.ExtensionContext) {

  const disposable = vscode.commands.registerCommand("excelGrep.start", () => {

    // すでに Webview が存在するなら再利用して終了
    if (panel) {
      panel.reveal(vscode.ViewColumn.One);
      return;
    }

    // 初期フォルダ設定
    state.lastState.folder =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";

    panel = vscode.window.createWebviewPanel(
      "excelGrep",
      "Excel Grep",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "out", "webview")
        ]
      }
    );

    // Webview が閉じられたら state を初期化
    panel.onDidDispose(() => {
      panel = undefined;

      // state 初期化
      state = createInitialState();
      state.lastState.folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";

    });

    const labels = getLabels();
    const lang = getlang(vscode.env.language);

    panel.webview.html = getWebviewContent(
      context,
      panel.webview,
      labels,
      lang
    );

    // WebView 初期化時に labels を送る
    postInitLabels(panel, labels);

    panel.webview.onDidReceiveMessage(async (msg: FromWebviewMessage) => {
      if (!panel) {
        return; // panel が undefined の場合は安全に抜ける
      }

      switch (msg.type) {
        case "restoreState": {
          postRestoreState(panel, state.lastState, state.isSearching);
          break;
        }

        case "search": {
          const { folder, keyword, ignoreCase, dateSearchEnabled } = msg.payload;

          // バリデーションまとめて実行
          try {
            // 1. キーワード検証
            validateKeyword(keyword, labels);
            // 2. フォルダパス検証
            validateFolderPath(folder, labels);
            // 3. 日付検索検証（必要なときだけ）
            const dateMask = validateDateSearch(
              keyword,
              dateSearchEnabled,
              labels
            );

            // 4.検索開始
            await startSearch(
              folder,
              keyword,
              ignoreCase,
              dateMask,
              labels,
              panel,
              state
            );

            // 検索完了後、結果を state に反映
            state.results = state.resultsRef.value;
            state.lastState.results = state.resultsRef.value;

          } catch (err: any) {
            vscode.window.showWarningMessage(err.message);
            postSearchError(panel);
          }

          break;
        }

        case "cancelSearch": {
          state.cancelRequestedRef.value = true;
          state.isSearching = false;
          break;
        }

        case "openFile": {
          // TODO:セルジャンプ
          // const file = msg.file.replace(/\//g, "\\"); // Windows形式に
          // const sheet = quoteSheetNameIfNeeded(msg.sheet);
          // const cell = msg.cell;

          openExcelFile(msg.file);

          break;
        }

        case "openFolderDialog": {
          const raw = msg.currentFolder as string | undefined;
          let defaultUri: vscode.Uri | undefined = undefined;

          if (raw && raw.trim() !== "") {
            try {
              const stat = fs.statSync(raw);

              if (stat.isDirectory()) {
                // フォルダ → そのまま使う
                defaultUri = vscode.Uri.file(raw);
              } else if (stat.isFile()) {
                // ファイル → dirname を使う
                const dir = path.dirname(raw);
                defaultUri = vscode.Uri.file(dir);
              }
            } catch {
              // 存在しないパス → defaultUri は undefined のまま
            }
          }

          const folder = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            defaultUri
          });

          if (folder && folder.length > 0) {
            postFolderSelected(panel, folder[0].fsPath);
          }
          break;
        }

        case "exportCsv": {
          exportCsv(state.results, labels);
          break;
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

