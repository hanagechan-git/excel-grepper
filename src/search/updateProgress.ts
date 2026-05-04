// src/search/updateProgress.ts

import * as path from "path";

/**
 * 並列処理中の進捗を UI に送信する。
 * - done: 完了したファイル数
 * - total: 全ファイル数
 * - files[done - 1] が「最後に完了したファイル」
 */
export function updateProgress(
  done: number,
  total: number,
  files: string[],
  folder: string,
  panel: any
) {
  // まだ1件も終わっていない場合
  let lastCompleted = "";

  if (done > 0 && done <= files.length) {
    const file = files[done - 1];
    lastCompleted = path.relative(folder, file).replace(/\//g, "\\");
  }

  panel.webview.postMessage({
    type: "progress",
    done,
    total,
    lastCompleted
  });
}
