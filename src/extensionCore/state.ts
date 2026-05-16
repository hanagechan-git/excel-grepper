// src/extensionCore/state.ts

import type { ExcelGrepResult } from "../common/types";

//
// UI 復元用の最終検索状態
//
export interface SearchState {
  folder: string | null;
  keyword: string | null;
  ignoreCase: boolean;
  dateSearchEnabled: boolean;
  isRegex: boolean;
  results: ExcelGrepResult[] | null;
  fileCount: number;
  unreadableMessage: string | null;
  truncated: boolean;
  truncatedNotice: string | null;
}

//
// 拡張機能全体の状態（内部 + UI）
//
export interface ExtensionState {
  // UI 復元用
  lastState: SearchState;

  // 検索中フラグ
  isSearching: boolean;

  // キャンセル要求（参照で共有）
  cancelRequestedRef: { value: boolean };

  // 検索結果（内部用・全件）
  results: ExcelGrepResult[];

  // WebView にリアルタイム反映するための参照
  resultsRef: { value: ExcelGrepResult[] };

  // UI 用の値（startSearch が更新）
  fileCount: number;
  truncated: boolean;
  unreadableMessage: string;
}

//
// 初期状態を生成する関数
//
export function createInitialState(): ExtensionState {
  return {
    lastState: {
      folder: null,
      keyword: null,
      ignoreCase: false,
      dateSearchEnabled: false,
      isRegex: false,
      results: null,
      fileCount: 0,
      unreadableMessage: null,
      truncated: false,
      truncatedNotice: null
    },

    isSearching: false,

    cancelRequestedRef: { value: false },

    results: [],
    resultsRef: { value: [] },

    fileCount: 0,
    truncated: false,
    unreadableMessage: ""
  };
}

export function updateSearchConditions(extState: ExtensionState, partial: Partial<SearchState>) {
  // lastState の UI 部分だけ更新する
  extState.lastState = {
    ...extState.lastState,
    ...partial
  };
}
