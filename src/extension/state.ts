// src\extension\state.ts

import type { ExcelGrepResult } from "../common/types";

export interface SearchState {
  folder: string | null;
  keyword: string | null;
  ignoreCase: boolean;
  dateSearchEnabled: boolean;
  results: ExcelGrepResult[] | null;
  fileCount: number;
  unreadableMessage: string | null;
  truncated: boolean;
  truncatedNotice: string | null;
}

export const state = {
  lastState: <SearchState>{
    folder: null,
    keyword: null,
    ignoreCase: false,
    dateSearchEnabled: false,
    results: null,
    fileCount: 0,
    unreadableMessage: null,
    truncated: false,
    truncatedNotice: null
  },

  // 実行中フラグ
  isSearching: false,

  // キャンセル要求
  cancelRequested: false,

  // 検索結果（内部用）
  results: <ExcelGrepResult[]>[],
  // resultsRef は、state.results を WebView にリアルタイムで反映させるための参照オブジェクト。
  // 直接 state.results を更新しても WebView には反映されないため、resultsRef.value を更新する形にしている。
  // これにより、検索処理中に見つかった結果を即座に WebView に送ることができる。
  resultsRef: { value: [] as ExcelGrepResult[] }
};
