// src\core\cells\findCells.ts
import JSZip from "jszip";
import { SearchConfig } from "../../common/types";
import { testMatch } from "../search/testMatch";

export interface FoundCell {
  cellAddress: string; // 例: "A1"
  matchTxt: string;    // 実際の文字列
}

/**
  * sheet.xml を解析して、セルの値を sharedStrings から逆引きする。
  * 検索条件に一致するセルだけを返す。
  */
export async function findCells(
  zip: JSZip,
  sheetNumber: number,
  sharedStrings: Record<number, string>,
  config: SearchConfig
): Promise<FoundCell[]> {

  const sheetPath = `xl/worksheets/sheet${sheetNumber}.xml`;
  const file = zip.file(sheetPath);

  // シートが存在しない場合は空配列
  if (!file) {
    return [];
  }

  // XML を読み込み、改行を除去して検索しやすくする
  const xml = await file.async("string");
  const flat = xml.replace(/[\r\n]/g, "");

  const results: FoundCell[] = [];
  let pos = 0;

  while (true) {
    // <c r="A1"> のようなセルタグを探す
    const cStart = flat.indexOf("<c ", pos);
    if (cStart < 0) {
      break;
    }

    const cEnd = flat.indexOf("</c>", cStart);
    if (cEnd < 0) {
      break;
    }

    const cellBlock = flat.substring(cStart, cEnd + 4);

    // セルアドレス
    const rPos = cellBlock.indexOf(" r=\"");
    if (rPos < 0) {
      pos = cEnd + 4;
      continue;
    }
    const rStart = rPos + 4;
    const rEnd = cellBlock.indexOf("\"", rStart);
    const cellAddress = cellBlock.substring(rStart, rEnd);

    let text: string | undefined;

    // ① sharedStrings 方式
    if (cellBlock.includes(" t=\"s\"")) {
      const vStart = cellBlock.indexOf("<v>");
      const vEnd = cellBlock.indexOf("</v>");
      if (vStart >= 0 && vEnd > vStart) {
        const idx = parseInt(cellBlock.substring(vStart + 3, vEnd));
        text = sharedStrings[idx];
      }
    }

    // ② inlineStr 方式
    else if (cellBlock.includes(" t=\"inlineStr\"")) {
      const tMatch = cellBlock.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/);
      if (tMatch) {
        text = tMatch[1];
      }
    }

    // ③ 数式文字列（t="str"）
    else if (cellBlock.includes(" t=\"str\"")) {
      const vStart = cellBlock.indexOf("<v>");
      const vEnd = cellBlock.indexOf("</v>");
      if (vStart >= 0 && vEnd > vStart) {
        text = cellBlock.substring(vStart + 3, vEnd);
      }
    }

    // ④ 数値セル（t 属性なし）
    else {
      const vStart = cellBlock.indexOf("<v>");
      const vEnd = cellBlock.indexOf("</v>");
      if (vStart >= 0 && vEnd > vStart) {
        text = cellBlock.substring(vStart + 3, vEnd);
      }
    }

    // 文字列が取れたら検索（sharedStrings 方式もコードシンプルにするためにやっとく）
    if (text && testMatch(text, config)) {
      results.push({ cellAddress, matchTxt: text });
    }

    // 次のセルを探すために位置を進める
    pos = cEnd + 4;
  }

  return results;
}
