// src/core/shapes/grepExcelShapes.ts

import JSZip from "jszip";
import { findDrawingInfos } from "./findDrawingInfos";
import {
  parseTwoCellAnchors,
  extractShapeText,
  extractShapeCellAddress,
  extractAutoShapeType
} from "./utils";

import { SearchConfig } from "../../common/types";
import { testMatch } from "../search/testMatch";

/**
 * 図形検索の結果を表すデータ構造。
 * Cells と同じ構造に揃えることで、後の統合処理が簡単になる。
 */
export interface ShapeGrepResult {
  fileName: string;
  sheetName: string;
  drawingNumber: number;
  matchTxt: string;
  cellAddress: string;
  autoShapeType: string;
}

/**
 * Excel ファイル内の図形（AutoShape）を検索するメイン関数。
 *
 * - sheetMap（sheetNumber → sheetName）を受け取り
 * - 各シートごとに sheetN.xml.rels を解析し drawing.xml を取得
 * - drawing.xml 内の anchor → text → keyword → cellAddress を抽出
 */
export async function grepExcelShapes(
  fileName: string,
  zip: JSZip,
  sheetMap: Record<number, string>,
  config: SearchConfig          // ← ★ keyword / ignoreCase の代わりに SearchConfig
): Promise<ShapeGrepResult[]> {

  const results: ShapeGrepResult[] = [];

  // sheetMap をループ
  for (const sheetNumberStr of Object.keys(sheetMap)) {
    const sheetNumber = parseInt(sheetNumberStr);
    const sheetName = sheetMap[sheetNumber];

    // sheetN.xml.rels → drawing.xml の一覧を取得
    const drawingInfos = await findDrawingInfos(zip, sheetNumber);
    if (drawingInfos.length === 0) {
      continue;
    }

    // drawing.xml を読み込んで shape を抽出
    for (const info of drawingInfos) {

      const xml = await zip.file(info.path)?.async("string");
      if (!xml) {
        continue;
      }

      // 図形の anchor をすべて取得
      const anchors = parseTwoCellAnchors(xml);

      for (const anchor of anchors) {
        const matchTxt = extractShapeText(anchor);

        if (!testMatch(matchTxt, config)) {
          continue;
        }

        // 図形のセル位置を取得
        const cellAddress = extractShapeCellAddress(anchor);
        // 図形の種類（AutoShapeType）を取得
        const autoShapeType = extractAutoShapeType(anchor);

        // 結果を追加
        results.push({
          fileName,
          sheetName,
          drawingNumber: info.drawingNumber,
          matchTxt,
          cellAddress,
          autoShapeType
        });
      }
    }
  }

  return results;
}
