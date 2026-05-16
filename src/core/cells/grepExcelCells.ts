// src/core/cells/grepExcelCells.ts
import JSZip from "jszip";
import { grepSharedStrings } from "./grepSharedStrings";
import { findCells } from "./findCells";
import { DateMask } from "../../common/dateTypes";
import { findDateCells } from "../date/findDateCells";
import { SearchConfig } from "../../common/types";

export interface CellGrepResult {
  fileName: string;   // 後で複数ファイル対応するときに使う
  sheetName: string;
  cellAddress: string;
  matchTxt: string;
}

/**
 * Excel のセルを検索する統合関数。
 * sharedStrings → sheet.xml の順に解析して、
 * 検索条件に一致するセルだけを返す。
 */
export async function grepExcelCells(
  fileName: string,
  zip: JSZip,
  sheetMap: Record<number, string>,
  config: SearchConfig,          // ← keyword / ignoreCase / isRegex
  dateMask: DateMask | null,
  limitedSheetName?: string,
): Promise<CellGrepResult[]> {

  const results: CellGrepResult[] = [];

  // SearchConfig を使って sharedStrings.xml を検索して辞書を作る
  const sharedStrings = await grepSharedStrings(zip, config);

  // 全シートを走査
  for (const sheetNumberStr of Object.keys(sheetMap)) {

    const sheetNumber = parseInt(sheetNumberStr);
    const sheetName = sheetMap[sheetNumber];

    // シート名フィルタ
    if (limitedSheetName && sheetName !== limitedSheetName) {
      continue;
    }

    // 日付検索か文字列検索かを分岐
    if (dateMask === null) {
      // 文字列検索（正規表現含む）
      const found = await findCells(zip, sheetNumber, sharedStrings, config);

      results.push(...found.map(f => ({
        fileName,
        sheetName,
        cellAddress: f.cellAddress,
        matchTxt: f.matchTxt
      })));

    } else {
      // 日付検索
      const found = await findDateCells(zip, sheetNumber, dateMask);

      results.push(...found.map(f => ({
        fileName,
        sheetName,
        cellAddress: f.cellAddress,
        matchTxt: f.matchTxt
      })));
    }
  }

  return results;
}
