// src\core\cells\grepExcelCells.ts
import JSZip from "jszip";
import { grepSharedStrings } from "./grepSharedStrings";
import { findCells } from "./findCells";

export interface CellGrepResult {
  fileName: string;   // 後で複数ファイル対応するときに使う
  sheetName: string;
  cellAddress: string;
  matchTxt: string;
}

/**
 * Excel のセルを検索する統合関数。
 * sharedStrings → sheet.xml の順に解析して、
 * キーワードに一致するセルだけを返す。
 */
export async function grepExcelCells(
  fileName: string,
  zip: JSZip,
  sheetMap: Record<number, string>,
  keyword: string,
  ignoreCase: boolean,
  limitedSheetName?: string
): Promise<CellGrepResult[]> {

  const results: CellGrepResult[] = [];

  // sharedStrings.xml を検索して辞書を作る
  const sharedStrings = await grepSharedStrings(zip, keyword, ignoreCase);

  // 全シートを走査
  for (const sheetNumberStr of Object.keys(sheetMap)) {

    const sheetNumber = parseInt(sheetNumberStr);
    const sheetName = sheetMap[sheetNumber];

    // シート名フィルタ（指定されている場合）
    if (limitedSheetName && sheetName !== limitedSheetName) {
      continue;
    }

    // sheet.xml を解析してセルを検索
    const cells = await findCells(
      zip,
      sheetNumber,
      sharedStrings,
      keyword,
      ignoreCase
    );

    // 結果をまとめる
    for (const c of cells) {

      results.push({
        fileName: fileName,
        sheetName,
        cellAddress: c.cellAddress,
        matchTxt: c.matchTxt
      });
    }
  }

  return results;
}
