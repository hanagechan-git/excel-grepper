// src/search/processOneFile.ts

import * as vscode from "vscode";
import * as path from "path";
import JSZip from "jszip";

import { parseWorkbookRels } from "../core/workbook/parseWorkbookRels";
import { parseWorkbook } from "../core/workbook/parseWorkbook";
import { grepExcelFile } from "../core/grepExcelFile";

import { DateMask } from "../common/dateTypes";
import { ExcelGrepResult, SearchConfig } from "../common/types";

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
  config: SearchConfig,
  dateMask: DateMask | null,
  unreadableFiles: { path: string; reason: string }[],
  resultsRef: { value: ExcelGrepResult[] },
  cancelRequestedRef: { value: boolean }
) {
  // キャンセルされたら即終了
  if (cancelRequestedRef.value) {
    return;
  }

  const relativePath = path.relative(folder, file).replace(/\//g, "\\");

  try {
    // VSCode API でファイル読み込み
    const uri = vscode.Uri.file(file);
    const fileData = await vscode.workspace.fs.readFile(uri);

    // --- ZIP 展開（PW 付きはここで落ちる） ---
    let zip;
    try {
      zip = await JSZip.loadAsync(fileData);
    } catch (e) {
      // ここに来るのはほぼ PW 付き Excel
      unreadableFiles.push({
        path: relativePath,
        reason: "encrypted"
      });
      return;
    }

    // --- 暗号化（パスワード保護）Excel 判定（念のため） ---
    const isEncrypted =
      !zip.file("xl/workbook.xml") &&
      !zip.file("xl/sharedStrings.xml") &&
      !zip.file("xl/worksheets/sheet1.xml");

    if (isEncrypted) {
      unreadableFiles.push({
        path: relativePath,
        reason: "encrypted"
      });
      return;
    }

    // --- 内部 XML サイズチェック（innerLarge） ---
    const sheet1 = zip.file("xl/worksheets/sheet1.xml");
    const shared = zip.file("xl/sharedStrings.xml");

    const sheet1Size = sheet1 ? (sheet1 as any)._data?.uncompressedSize ?? 0 : 0;
    const sharedSize = shared ? (shared as any)._data?.uncompressedSize ?? 0 : 0;

    const XML_LIMIT = 80 * 1024 * 1024; // 50MB

    if (sheet1Size > XML_LIMIT || sharedSize > XML_LIMIT) {
      unreadableFiles.push({
        path: relativePath,
        reason: "innerLarge"
      });
      return;
    }

    // --- workbook の構造を読む（シート一覧など） ---
    const relsMap = await parseWorkbookRels(zip);
    const sheetMap = await parseWorkbook(zip, relsMap);

    // キャンセルチェック（重い処理の後にもう一度）
    if (cancelRequestedRef.value) {
      return;
    }

    // --- grep 実行（セル + 図形） ---
    const fileResults = await grepExcelFile(
      file,
      zip,
      sheetMap,
      config,
      dateMask
    );

    // 結果を push（複数ワーカーから同時に来る可能性あり）
    resultsRef.value.push(...fileResults);

  } catch (e) {
    // 壊れたファイルは unreadableFiles に追加
    unreadableFiles.push({
      path: relativePath,
      reason: "corrupted"
    });
  }
}
