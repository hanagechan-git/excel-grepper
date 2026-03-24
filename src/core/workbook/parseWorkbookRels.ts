// src\core\workbook\parseWorkbookRels.ts
import JSZip from "jszip";

/**
 * workbook.xml.rels を解析して、
 * rId → sheet番号 の対応表を作る。
 * 例: rId3 → 2（sheet2.xml）
 */
export async function parseWorkbookRels(zip: JSZip): Promise<Record<number, number>> {

  const file = zip.file("xl/_rels/workbook.xml.rels");

  if (!file) {
    return {};
  }

  const xml = await file.async("string");

  const map: Record<number, number> = {};

  // Relationship タグを全部抜き出す
  const rels = xml.match(/<Relationship[^>]+>/g) || [];

  for (const rel of rels) {
    // worksheets のみ対象
    if (!rel.includes("worksheets/")) {
      continue;
    }

    // rId を抽出
    const idMatch = rel.match(/Id="rId(\d+)"/);
    if (!idMatch) {
      continue;
    }
    const rId = parseInt(idMatch[1]);

    // sheet番号を抽出
    const sheetMatch = rel.match(/worksheets\/sheet(\d+)\.xml/);
    if (!sheetMatch) {
      continue;
    }
    const sheetNumber = parseInt(sheetMatch[1]);

    map[rId] = sheetNumber;
  }

  return map;
}
