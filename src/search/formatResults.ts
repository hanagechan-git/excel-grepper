// src/search/formatResults.ts

import { ExcelGrepResult } from "../common/types";

/**
 * 検索結果を UI 表示用に整形する。
 * - MAX_RESULTS を超える場合は先頭 maxResults 件だけ返す
 * - truncated フラグで上限超過を通知
 */
export function formatResults(
  results: ExcelGrepResult[],
  maxResults: number
) {
  const truncated = results.length > maxResults;

  const displayResults = truncated
    ? results.slice(0, maxResults)
    : results;

  return {
    truncated,
    displayResults
  };
}
