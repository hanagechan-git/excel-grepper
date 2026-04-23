// src/core/date/findDateCells.ts

import JSZip from "jszip";
import { DateMask } from "../../common/dateTypes";
import { matchDateMask , serialToYMD } from "./dateMatcher";
import { formatYMD } from "./dateFormatter";

export interface FoundDateCell {
  cellAddress: string;
  matchTxt: string; // シリアル値を文字列化して返す（他と形式を揃える）
}

export async function findDateCells(
  zip: JSZip,
  sheetNumber: number,
  mask: DateMask
): Promise<FoundDateCell[]> {

  const sheetPath = `xl/worksheets/sheet${sheetNumber}.xml`;
  const file = zip.file(sheetPath);

  if (!file) {
    return [];
  }

  const xml = await file.async("string");
  const flat = xml.replace(/[\r\n]/g, "");

  const results: FoundDateCell[] = [];
  let pos = 0;

  while (true) {
    const cStart = flat.indexOf("<c ", pos);
    if (cStart < 0) {
      break;
    }
    const cEnd = flat.indexOf("</c>", cStart);
    if (cEnd < 0) {
      break;
    }
    const cellBlock = flat.substring(cStart, cEnd + 4);

    // セルアドレス取得
    const rPos = cellBlock.indexOf(" r=\"");
    if (rPos < 0) {
      pos = cEnd + 4;
      continue;
    }
    const rStart = rPos + 4;
    const rEnd = cellBlock.indexOf("\"", rStart);
    const cellAddress = cellBlock.substring(rStart, rEnd);

    // -------------------------
    // 文字列セルはスキップ
    // -------------------------
    if (
      cellBlock.includes(" t=\"s\"") ||
      cellBlock.includes(" t=\"inlineStr\"") ||
      cellBlock.includes(" t=\"str\"")
    ) {
      pos = cEnd + 4;
      continue;
    }

    // -------------------------
    // 数値セル（t 属性なし）
    // -------------------------
    const vStart = cellBlock.indexOf("<v>");
    const vEnd = cellBlock.indexOf("</v>");
    if (vStart < 0 || vEnd < vStart) {
      pos = cEnd + 4;
      continue;
    }

    const raw = cellBlock.substring(vStart + 3, vEnd);
    const serial = Number(raw);

    if (!Number.isFinite(serial)) {
      pos = cEnd + 4;
      continue;
    }

    // -------------------------
    // 日付マスクと一致判定
    // -------------------------
    if (matchDateMask(mask, serial)) {

      const ymd = serialToYMD(serial);
      const formatted = formatYMD(ymd.year, ymd.month, ymd.day);
      results.push({
        cellAddress,
        matchTxt: formatted // 他の grep と同じく文字列で返す
      });
    }

    pos = cEnd + 4;
  }

  return results;
}
