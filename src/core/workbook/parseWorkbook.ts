// src\core\workbook\parseWorkbook.ts
import JSZip from "jszip";

/**
 * workbook.xml を解析して、
 * sheet番号 → シート名 の対応表を作る。
 * 例: 1 → "Sheet1"
 */
export async function parseWorkbook(
  zip: JSZip,
  relsMap: Record<number, number>
): Promise<Record<number, string>> {

  const file = zip.file("xl/workbook.xml");

  if (!file) {
    return {};
  }

  const xml = await file.async("string");
  const flat = xml.replace(/[\r\n]/g, "");

  const results: Record<number, string> = {};

  let pos = 0;

  while (true) {
    const idx = flat.indexOf("<sheet ", pos);

    if (idx < 0) {
      break;
    }

    // シート名を取得
    const nameStart = flat.indexOf("name=\"", idx) + 6;
    const nameEnd = flat.indexOf("\"", nameStart);
    const sheetName = flat.substring(nameStart, nameEnd);

    // rId を取得
    const ridStart = flat.indexOf("r:id=\"rId", idx) + 9;
    const ridEnd = flat.indexOf("\"", ridStart);
    const rId = parseInt(flat.substring(ridStart, ridEnd));

    // rId → sheet番号 の対応表から sheet番号を取得
    const sheetNumber = relsMap[rId];

    if (sheetNumber) {
      results[sheetNumber] = sheetName;
    }

    pos = nameEnd;
  }

  return results;
}
