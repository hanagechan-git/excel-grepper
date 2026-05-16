// src\webview\main.ts

import { ToWebviewMessage } from "../common/message";
import type { ExcelGrepResult } from "../common/types";
import { renderResultTable } from "./components/resultTable";

let isSearching = false;
let debounceTimer: number | undefined = undefined;
let isRestoring = false; // ★ restoreState 中は post を抑制

// WebView の window に labels を追加する
declare global {
  interface Window {
    labels: any
  }
}

// VS Code Webview API
const vscode = acquireVsCodeApi();

// Webview のルート要素
const app = document.getElementById("app")!;

window.addEventListener("load", () => {
  setupSearchFormEvents();
  setSearching(true);
  vscode.postMessage({ type: "restoreState" });
});

// -----------------------------
// 拡張機能 → Webview のメッセージ受信
// -----------------------------
window.addEventListener("message", (event) => {
  const message = event.data as ToWebviewMessage;

  switch (message.type) {
    case "initLabels":
      window.labels = message.labels;
      break;

    case "progress":
      (document.getElementById("status-area") as HTMLElement).textContent =
        `${message.done} / ${message.total} files scanned\n` +
        `Last completed: ${message.lastCompleted}`;
      break;

    case "searchError":
      // 検索失敗
      isSearching = false;
      setSearching(false);
      break;

    case "searchCancelled":
      // 検索キャンセルした
      isSearching = false;
      setSearching(false);
      break;

    case "searchComplete":
      // 検索完了
      isSearching = false;
      setSearching(false);
      renderGrepResult(message.payload, message.fileCount, message.keyword, message.unreadableMessage, message.isRegex, message.truncated, message.truncatedNotice);
      break;

    case "folderSelected":
      (document.getElementById("folderInput") as HTMLInputElement).value = message.folder;
      break;

    case "restoreState":
      isRestoring = true;

      const s = message.state;
      (document.getElementById("folderInput") as HTMLInputElement).value = s.folder ?? "";
      (document.getElementById("keywordInput") as HTMLInputElement).value = s.keyword ?? "";
      (document.getElementById("ignoreCaseInput") as HTMLInputElement).checked = s.ignoreCase ?? false;
      (document.getElementById("dateSearchInput") as HTMLInputElement).checked = s.dateSearchEnabled ?? false;
      (document.getElementById("regexInput") as HTMLInputElement).checked = s.isRegex ?? false;

      if (message.isSearching) {
        isSearching = true;
        setSearching(true);
      } else {
        isSearching = false;
        setSearching(false);
      }

      if (s.results) {
        renderGrepResult(s.results, s.fileCount, s.keyword ?? "", s.unreadableMessage ?? "", s.isRegex, s.truncated, s.truncatedNotice ?? "");
      }
      isRestoring = false;
      break;

  }
});

// -----------------------------
// 検索フォーム
// -----------------------------
function setupSearchFormEvents() {

  const folderInput = document.getElementById("folderInput") as HTMLInputElement;
  const keywordInput = document.getElementById("keywordInput") as HTMLInputElement;
  const ignoreCaseInput = document.getElementById("ignoreCaseInput") as HTMLInputElement;
  const dateSearchInput = document.getElementById("dateSearchInput") as HTMLInputElement;
  const regexInput = document.getElementById("regexInput") as HTMLInputElement;

  // 入力イベントも保存
  folderInput.addEventListener("blur", postConditionsDebounced);
  keywordInput.addEventListener("blur", postConditionsDebounced);
  ignoreCaseInput.addEventListener("change", postConditionsDebounced);
  dateSearchInput.addEventListener("change", postConditionsDebounced);
  regexInput.addEventListener("change", postConditionsDebounced);

  // ファイル選択ダイアログ
  document.getElementById("fileDialogBtn")!.addEventListener("click", () => {
    vscode.postMessage({ type: "openFolderDialog", currentFolder: folderInput.value });
  });

  // 検索実行（ボタン）
  document.getElementById("searchBtn")!.addEventListener("click", () => {
    runSearch();
  });

  // Enter キーで検索実行
  keywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  });

  // cancel
  document.getElementById("cancelBtn")!.addEventListener("click", () => {
    vscode.postMessage({ type: "cancelSearch" });
  });

  // CSV出力
  document.getElementById("csvBtn")!.addEventListener("click", () => {
    vscode.postMessage({
      type: "exportCsv",
    });
  });

  // 検索処理を関数化（重複防止）
  function runSearch() {

    // 検索中なら無視
    if (isSearching) {
      return;
    }

    isSearching = true;
    setSearching(true);

    const folder = folderInput.value;
    const keyword = keywordInput.value;
    const ignoreCase = ignoreCaseInput.checked;
    const dateSearchEnabled = dateSearchInput.checked;
    const isRegex = regexInput.checked;

    vscode.postMessage({
      type: "search",
      payload: {
        folder,
        keyword,
        ignoreCase,
        dateSearchEnabled,
        isRegex
      }
    });
  }

}

function postConditionsDebounced() {
  if (isRestoring) {
    return; // ★ restoreState 中は絶対に送らない
  }

  clearTimeout(debounceTimer);

  debounceTimer = window.setTimeout(() => {
    vscode.postMessage({
      type: "updateSearchConditions",
      payload: collectCurrentConditions()
    });
  }, 500); // ★ 500ms デバウンス
}

function collectCurrentConditions() {
  return {
    folder: (document.getElementById("folderInput") as HTMLInputElement).value,
    keyword: (document.getElementById("keywordInput") as HTMLInputElement).value,
    ignoreCase: (document.getElementById("ignoreCaseInput") as HTMLInputElement).checked,
    dateSearchEnabled: (document.getElementById("dateSearchInput") as HTMLInputElement).checked,
    isRegex: (document.getElementById("regexInput") as HTMLInputElement).checked
  };
}


// -----------------------------
// grep 結果の描画
// -----------------------------
function renderGrepResult(
  results: ExcelGrepResult[],
  fileCount: number,
  keyword: string,
  unreadableMessage: string,
  isRegex: boolean,
  truncated:boolean,
  truncatedNotice: string) {

  if (!window.labels) {
    console.warn("Labels not loaded yet");
    return;
  }

  const resultArea = document.getElementById("result-area")!;

  resultArea.innerHTML = "";

  if (!results || results.length === 0) {
    resultArea.innerHTML = `
      <div class="no-result">
        <h3>${window.labels.result.noResult}</h3>
      </div>
    `;
    return;
  }

  const header = document.createElement("div");
  header.className = "result-header";

  if (unreadableMessage) {
    const warn = document.createElement("div");
    warn.className = "warning";
    warn.textContent = unreadableMessage;
    header.appendChild(warn);
  }

  if (truncated) {
    const notice = document.createElement("div");
    notice.className = "truncate-notice";
    notice.textContent = truncatedNotice;
    header.appendChild(notice);
  }

  resultArea.appendChild(header);

  // resultTable.ts を使って描画
  const tableHtml = renderResultTable(results, fileCount, keyword, window.labels);
  resultArea.insertAdjacentHTML("beforeend", tableHtml);

  // ハイパーリンク
  attachFileLinkEvents();

}


// 検索条件によるトグル
function setSearching(isSearching: boolean) {

  const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;

  const folderInput = document.getElementById("folderInput") as HTMLInputElement;
  const keywordInput = document.getElementById("keywordInput") as HTMLInputElement;
  const ignoreCaseInput = document.getElementById("ignoreCaseInput") as HTMLInputElement;
  const dateSearchInput = document.getElementById("dateSearchInput") as HTMLInputElement;
  const regexInput = document.getElementById("regexInput") as HTMLInputElement;
  const fileDialogBtn = document.getElementById("fileDialogBtn") as HTMLButtonElement;
  const csvBtn = document.getElementById("csvBtn") as HTMLButtonElement;

  searchBtn.disabled = isSearching;
  cancelBtn.disabled = !isSearching;

  folderInput.disabled = isSearching;
  keywordInput.disabled = isSearching;
  ignoreCaseInput.disabled = isSearching;
  dateSearchInput.disabled = isSearching;
  regexInput.disabled = isSearching;
  fileDialogBtn.disabled = isSearching;
  csvBtn.disabled = isSearching;


  if (isSearching) {
    searchBtn.classList.add("loading");
    searchBtn.disabled = true;
  } else {
    searchBtn.classList.remove("loading");
    searchBtn.disabled = false;
  }
}


// -----------------------------
// ファイル名クリック → Excel を開く
// -----------------------------
function attachFileLinkEvents() {
  document.querySelectorAll(".file-link").forEach(el => {
    el.addEventListener("click", () => {
      const file = el.getAttribute("data-file");
      const sheet = el.getAttribute("data-sheet");
      const cell = el.getAttribute("data-cell");
      vscode.postMessage({
        type: "openFile",
        file: file,
        sheet: sheet,
        cell: cell
      });
    });
  });
}


