// src/search/processOneFile.ts

import * as vscode from "vscode";
import * as path from "path";
import JSZip from "jszip";

import { parseWorkbookRels } from "../core/workbook/parseWorkbookRels";
import { parseWorkbook } from "../core/workbook/parseWorkbook";
import { grepExcelFile } from "../core/grepExcelFile";

import { DateMask } from "../common/dateTypes";
import { ExcelGrepResult } from "../common/types";

/**
 * 1つの Excel ファイルを処理する関数。
 * 並列処理（runParallel）の中でワーカーとして呼ばれる。
 *
 * - ファイル読み込み
 * - ZIP 展開
 * - workbook パース
 * - grep 実行
 * - 結果 push
 * - 壊れたファイルの記録
 */
export async function processOneFile(
  file: string,
  folder: string,
  safeKeyword: string,
  ignoreCase: boolean,
  dateMask: DateMask | null,
  unreadableFiles: string[],
  resultsRef: { value: ExcelGrepResult[] },
  cancelRequestedRef: { value: boolean }
) {
  // キャンセルされたら即終了
  if (cancelRequestedRef.value) {
    return;
  }

  try {
    // VSCode API でファイル読み込み
    const uri = vscode.Uri.file(file);
    const fileData = await vscode.workspace.fs.readFile(uri);

    // ZIP 展開（Excel は ZIP 形式）
    const zip = await JSZip.loadAsync(fileData);

    // workbook の構造を読む（シート一覧など）
    const relsMap = await parseWorkbookRels(zip);
    const sheetMap = await parseWorkbook(zip, relsMap);

    // キャンセルチェック（重い処理の後にもう一度）
    if (cancelRequestedRef.value) {
      return;
    }

    // grep 実行（セル + 図形）
    const fileResults = await grepExcelFile(
      file,
      zip,
      sheetMap,
      safeKeyword,
      ignoreCase,
      dateMask
    );

    // 結果を push（複数ワーカーから同時に来る可能性あり）
    resultsRef.value.push(...fileResults);

  } catch {
    // 壊れたファイルは unreadableFiles に追加
    unreadableFiles.push(path.relative(folder, file).replace(/\//g, "\\"));
  }
}
