// src\extension.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import JSZip from "jszip";

import { spawn } from "child_process";
import * as os from "os";

import { grepExcelFile } from "./core/grepExcelFile";
import { parseWorkbookRels } from "./core/workbook/parseWorkbookRels"; // ← relsMap を作る関数
import { parseWorkbook } from "./core/workbook/parseWorkbook"; // ← sheetMap を作る関数
import { FromWebviewMessage } from "./common/message";
import type { ExcelGrepResult } from "./common/types";
import type { Labels } from "./common/labels";
import { collectExcelFiles } from "./fileCollector";
import { getLabels } from "./i18n/i18n";

let cancelRequested = false;
let panel: vscode.WebviewPanel | undefined;
let results: ExcelGrepResult[] = [];

export function activate(context: vscode.ExtensionContext) {

  const disposable = vscode.commands.registerCommand("excelGrep.start", () => {

    // すでに Webview が存在するなら再利用して終了
    if (panel) {
      panel.reveal(vscode.ViewColumn.One);
      return;
    }

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

    panel.onDidDispose(() => {
      panel = undefined;
      results = [];
    });

    const labels = getLabels();
    const lang = getlang(vscode.env.language);

    panel.webview.html = getWebviewContent(context, panel.webview, labels, lang);

    // WebView 初期化時に labels を送る
    panel.webview.postMessage({
      type: "initLabels",
      labels
    });

    panel.webview.onDidReceiveMessage(async (msg: FromWebviewMessage) => {
      switch (msg.type) {

        case "getDefaultFolder":
          panel?.webview.postMessage({
            type: "defaultFolder",
            folder: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? ""

          });
          break;

        case "search": {
          const { folder, keyword, ignoreCase } = msg.payload;

          if (!keyword || keyword.trim() === "") {
            vscode.window.showWarningMessage(labels.alert.keywordRequired);
            panel?.webview.postMessage({
              type: "searchError"
            });

            return;
          }

          if (typeof keyword !== "string") {
            vscode.window.showWarningMessage(labels.alert.keywordTypeError);
            panel?.webview.postMessage({
              type: "searchError"
            });
            return;
          }

          if (keyword.length > 200) {
            vscode.window.showWarningMessage(labels.alert.keywordLength);
            panel?.webview.postMessage({
              type: "searchError"
            });
            return;
          }

          if (!validateFolderPath(folder)) {
            vscode.window.showErrorMessage(labels.alert.folderInvalid);
            panel?.webview.postMessage({
              type: "searchError"
            });
            return;
          }

          cancelRequested = false;
          const safeKeyword = sanitizeKeyword(keyword);

          // 1. フォルダ内の Excel ファイルを再帰的に収集
          const files = await collectExcelFiles(folder);

          results = [];

          // 2. 各ファイルを検索
          for (const file of files) {
            try {

              if (cancelRequested) {
                panel?.webview.postMessage({ type: "searchCancelled" });
                return;
              }

              const uri = vscode.Uri.file(file);
              const fileData = await vscode.workspace.fs.readFile(uri);

              const zip = await JSZip.loadAsync(fileData);
              const relsMap = await parseWorkbookRels(zip);
              const sheetMap = await parseWorkbook(zip, relsMap);

              const fileResults = await grepExcelFile(
                file,
                zip,
                sheetMap,
                safeKeyword,
                ignoreCase
              );

              results.push(...fileResults);
            } catch (err) {
              console.error(`Error reading ${file}:`, err);
              // 読めないファイルはスキップ（~$ など）
            }
          }

          const MAX_RESULTS = 2000;

          const truncated = results.length > MAX_RESULTS;
          const displayResults = truncated ? results.slice(0, MAX_RESULTS) : results;

          // 3. Webview に返す
          panel?.webview.postMessage({
            type: "grepResult",
            payload: displayResults,
            fileCount: files.length,
            keyword: keyword,
            truncated: truncated,
            truncatedNotice: labels.result.truncatedNotice
          });

          break;
        }

        case "cancelSearch": {
          cancelRequested = true;
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
          const folder = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false
          });
          if (folder && folder.length > 0) {
            panel?.webview.postMessage({
              type: "folderSelected",
              folder: folder[0].fsPath
            });
          }
          break;
        }

        case "exportCsv": {
          await exportCsv(labels);
          break;
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

// -----------------------------
// WebView HTML 生成
// -----------------------------
function getWebviewContent(
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

  // XXS対策で文字コードに置き換え
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

      <div id="result-area"></div>

      <script nonce="${nonce}">
        window.labels = ${safeLabels};
      </script>

      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>
  `;
}


function getNonce() {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

// キーワードチェック置換
// 文字列は 式として解釈される可能性があるので
// 検索キーワードのサニタイズ（Excel 式注入対策）
export function sanitizeKeyword(keyword: string): string {

  let k = keyword;

  // Excel 式注入対策
  if (/^[=+\-@]/.test(k)) {
    k = "'" + k;
  }

  // パス操作防止
  k = k.replace(/\.\./g, "");

  // 危険文字のエスケープ
  k = k
    .replace(/\|/g, "\\|")
    .replace(/;/g, "\\;")
    .replace(/"/g, '\\"')
    .replace(/\${/g, "\\${");

  return k;
}

// 不正フォルダチェック
export function validateFolderPath(folder: string): boolean {

  if (!folder) {
    return false;
  }

  // 相対パス禁止
  if (folder.includes("..")) {
    return false;
  }

  // 絶対パスのみ許可
  if (!path.isAbsolute(folder)) {
    return false;
  }

  // 存在チェック
  if (!fs.existsSync(folder)) {
    return false;
  }

  // フォルダであること
  if (!fs.statSync(folder).isDirectory()) {
    return false;
  }

  return true;
}


export function sanitizeForCsv(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}


function quoteSheetNameIfNeeded(sheet: string): string {
  // ASCII 以外 or スペース or 記号がある場合はクォート
  if (/[^A-Za-z0-9_]/.test(sheet)) {
    return `'${sheet}'`;
  }
  return sheet;
}


async function exportCsv(labels: Labels) {

  if (!results || results.length === 0) {
    vscode.window.showWarningMessage(labels.alert.noResultsToExport);
    return;
  }

  const csvLines: string[] = [];

  // ヘッダー
  csvLines.push([
    "target",
    "fileName",
    "sheetName",
    "cellAddress",
    "matchTxt",
    "drawingNumber"
  ].join(","));

  for (const r of results) {
    const filePath = sanitizeForCsv(r.fileName);
    const match = sanitizeForCsv(r.matchTxt);

    // HYPERLINK 式に使うので sanitizeForCsv は使わない
    const sheet = r.sheetName.replace(/"/g, '""');
    const cell = r.cellAddress.replace(/"/g, '""');

    // Excel 用リンク
    const link = `${filePath}#${sheet}!${cell}`;

    // CSV セル用に二重クォートでエスケープ
    const hyperlink = `"=HYPERLINK(""${link}"",""${sheet}!${cell}"")"`;

    csvLines.push([
      `"${r.target}"`,
      `"${filePath}"`,
      `"${sheet}"`,
      hyperlink,          // ← ここだけ特別扱い
      `"${match}"`,
      r.drawingNumber ?? ""
    ].join(","));
  }

  const csvContent = csvLines.join("\n");

  const timestamp = getTimestamp();
  const defaultFileName = `excelGrep_${timestamp}.csv`;

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultFileName),
    filters: { "CSV Files": ["csv"] },
    saveLabel: labels.dialog.saveCsv
  });

  if (!uri) {
    return;
  }

  // UTF-8 with BOM
  const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
  await vscode.workspace.fs.writeFile(
    uri,
    Buffer.concat([bom, Buffer.from(csvContent, "utf8")])
  );

  vscode.window.showInformationMessage(labels.info.csvSaved);

}

export function getlang(lang: string): string {
  if (lang.startsWith("ja")) {
    return "ja";
  }
  if (lang.startsWith("en")) {
    return "en";
  }
  return "en"; // fallback
}


function getTimestamp() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}


export function openExcelFile(filePath: string) {
  const platform = os.platform();

  if (platform === "win32") {
    // Windows: start "" "<path>"
    spawn("cmd", ["/c", "start", "", filePath], {
      windowsHide: true,
      shell: false
    });
  } else if (platform === "darwin") {
    // macOS: open "<path>"
    spawn("open", [filePath]);
  } else {
    // Linux: xdg-open "<path>"
    spawn("xdg-open", [filePath]);
  }
}
