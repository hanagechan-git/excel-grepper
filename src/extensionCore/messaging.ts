// src\extension\messaging.ts

import * as vscode from "vscode";
import type { ExcelGrepResult } from "../common/types";

export function postInitLabels(panel: vscode.WebviewPanel | undefined, labels: any) {
  panel?.webview.postMessage({
    type: "initLabels",
    labels
  });
}

export function postRestoreState(
  panel: vscode.WebviewPanel | undefined,
  state: any,
  isSearching: boolean
) {
  panel?.webview.postMessage({
    type: "restoreState",
    state,
    isSearching
  });
}

export function postFolderSelected(
  panel: vscode.WebviewPanel | undefined,
  folder: string
) {
  panel?.webview.postMessage({
    type: "folderSelected",
    folder
  });
}

export function postSearchError(panel: vscode.WebviewPanel | undefined) {
  panel?.webview.postMessage({
    type: "searchError"
  });
}

export function postProgress(
  panel: vscode.WebviewPanel | undefined,
  scanned: number,
  total: number,
  currentFile: string
) {
  panel?.webview.postMessage({
    type: "progress",
    scanned,
    total,
    currentFile
  });
}

export function postSearchCancelled(panel: vscode.WebviewPanel | undefined) {
  panel?.webview.postMessage({
    type: "searchCancelled"
  });
}

export function postSearchComplete(
  panel: vscode.WebviewPanel | undefined,
  results: ExcelGrepResult[],
  fileCount: number,
  keyword: string,
  unreadableMessage: string,
  truncated: boolean,
  truncatedNotice: string
) {
  panel?.webview.postMessage({
    type: "searchComplete",
    payload: results,
    fileCount,
    keyword,
    unreadableMessage,
    truncated,
    truncatedNotice
  });
}
