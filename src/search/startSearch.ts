// src/search/startSearch.ts

import * as vscode from "vscode";
import { runParallel } from "../core/parallel/workerPool";

import { processOneFile } from "./processOneFile";
import { formatResults } from "./formatResults";
import { buildUnreadableMessage } from "./buildUnreadableMessage";
import { updateProgress } from "./updateProgress";

import { sanitizeKeyword } from "../extensionCore/sanitize";
import { DateMask } from "../common/dateTypes";
import { ExcelGrepResult } from "../common/types";
import { collectExcelFiles } from "../extensionCore/fileCollector";

import type { ExtensionState } from "../extensionCore/state";

export async function startSearch(
  folder: string,
  keyword: string,
  ignoreCase: boolean,
  dateMask: DateMask | null,
  labels: any,
  panel: vscode.WebviewPanel,
  state: ExtensionState
) {
  // --- 1. 検索準備 ---
  const safeKeyword = sanitizeKeyword(keyword);

  // 参照型の共有状態
  const resultsRef = state.resultsRef;
  const cancelRequestedRef = state.cancelRequestedRef;

  // 内部状態初期化
  resultsRef.value = [];
  cancelRequestedRef.value = false;
  state.isSearching = true;

  const unreadableFiles: string[] = [];

  // --- 2. ファイル一覧取得 ---
  const files = await collectExcelFiles(folder);

  // --- 3. 並列処理 ---
  await runParallel(
    files,
    async (file, index) => {
      await processOneFile(
        file,
        folder,
        safeKeyword,
        ignoreCase,
        dateMask,
        unreadableFiles,
        resultsRef,
        cancelRequestedRef
      );
    },
    {
      onProgress: (done, total) => {
        updateProgress(done, total, files, folder, panel);
      }
    }
  );

  // --- 4. 結果整形 ---
  const MAX_RESULTS = 2000;
  const { truncated, displayResults } = formatResults(
    resultsRef.value,
    MAX_RESULTS
  );

  const unreadableMessage = buildUnreadableMessage(
    unreadableFiles,
    labels
  );

  // --- 5. 状態更新 ---
  state.isSearching = false;
  state.results = resultsRef.value;
  state.fileCount = files.length;
  state.truncated = truncated;
  state.unreadableMessage = unreadableMessage;

  // UI 復元用
  state.lastState.results = displayResults;
  state.lastState.fileCount = files.length;
  state.lastState.unreadableMessage = unreadableMessage;
  state.lastState.truncated = truncated;

  // --- 6. WebView に通知 ---
  panel.webview.postMessage({
    type: "searchComplete",
    payload: displayResults,
    fileCount: files.length,
    keyword,
    unreadableMessage,
    truncated,
    truncatedNotice: labels.result.truncatedNotice
  });
}
