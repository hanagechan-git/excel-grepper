// src/core/shapes/findDrawingInfos.ts

import JSZip from "jszip";

export interface DrawingInfo {
  drawingNumber: number;
  path: string;
}

/**
 * sheetN.xml.rels を解析して、
 * そのシートが参照している drawing.xml の一覧を返す。
 */
export async function findDrawingInfos(
  zip: JSZip,
  sheetNumber: number
): Promise<DrawingInfo[]> {

  const relsPath = `xl/worksheets/_rels/sheet${sheetNumber}.xml.rels`;
  const file = zip.file(relsPath);
  if (!file) {
    return [];
  }

  const xml = await file.async("string");
  const results: DrawingInfo[] = [];

  // Relationship タグを全部抽出
  const rels = xml.match(/<Relationship[^>]+>/g) || [];

  for (const rel of rels) {
    // drawing の参照だけ対象
    const match = rel.match(/Target="(\.\.\/)?drawings\/drawing(\d+)\.xml"/);
    if (!match) {
      continue;
    }

    const drawingNumber = parseInt(match[2]);

    results.push({
      drawingNumber,
      path: `xl/drawings/drawing${drawingNumber}.xml`
    });
  }

  return results;
}
