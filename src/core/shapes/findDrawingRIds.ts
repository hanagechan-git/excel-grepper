// src\core\shapes\findDrawingRIds.ts
import JSZip from "jszip";

/**
 * sheet.xml の中から、図形(drawing)が使われている rId をすべて取り出す関数。
 *
 * 例:
 *   <drawing r:id="rId3"/>
 *   <drawing r:id="rId7"/>
 *
 * これらの rId を使って、どの drawing.xml を読むべきか判断する。
 */
export async function findDrawingRIds(
  zip: JSZip,
  sheetNumber: number
): Promise<number[]> {

  const sheetPath = `xl/worksheets/sheet${sheetNumber}.xml`;
  const file = zip.file(sheetPath);

  if (!file) {
    return [];
  }

  const xml = await file.async("string");

  // 改行を除去して検索しやすくする
  const flat = xml.replace(/[\r\n]/g, "");

  const results: number[] = [];
  let pos = 0;

  while (true) {
    // <drawing r:id="rIdX"> を探す
    const idx = flat.indexOf("<drawing r:id=", pos);

    if (idx < 0) {
      break;
    }

    const start = flat.indexOf("r:id=\"rId", idx) + 9;
    const end = flat.indexOf("\"", start);

    const rId = parseInt(flat.substring(start, end));

    results.push(rId);

    pos = end;
  }

  return results;
}
