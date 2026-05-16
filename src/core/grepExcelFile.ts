// src/core/grepExcelFile.ts

import JSZip from "jszip";
import { grepExcelCells ,CellGrepResult } from "./cells/grepExcelCells";
import { grepExcelShapes, ShapeGrepResult } from "./shapes/grepExcelShapes";
import { ExcelGrepResult, SearchConfig } from "../common/types";
import { DateMask } from "../common/dateTypes";

/**
 * Excel ファイル 1 つに対して、
 * 1. Cells（セル）
 * 2. Shapes（図形）
 * の両方を grep して結果を統合する関数。
 */
export async function grepExcelFile(
  fileName: string,
  zip: JSZip,
  sheetMap: Record<number, string>,
  config: SearchConfig,          // ← keyword / ignoreCase / isRegex
  dateMask: DateMask | null
): Promise<ExcelGrepResult[]> {

  // -----------------------------
  // 1. Cells の grep
  // -----------------------------
  const cellResultsRaw = await grepExcelCells(
    fileName,
    zip,
    sheetMap,
    config,
    dateMask
  );
  const cellResults: ExcelGrepResult[] = cellResultsRaw.map(convertCellResult);

  // -----------------------------
  // 2. Shapes の grep
  // -----------------------------
  const shapeResultsRaw = await grepExcelShapes(
    fileName,
    zip,
    sheetMap,
    config
  );
  const shapeResults: ExcelGrepResult[] = shapeResultsRaw.map(convertShapeResult);

  // -----------------------------
  // 3. 結果を統合して返す
  // -----------------------------
  return [...cellResults, ...shapeResults];
}

function convertCellResult(r: CellGrepResult): ExcelGrepResult {
  return {
    fileName: r.fileName,
    sheetName: r.sheetName,
    cellAddress: r.cellAddress,
    matchTxt: r.matchTxt,
    target: "Cell"
  };
}

function convertShapeResult(r: ShapeGrepResult): ExcelGrepResult {
  return {
    fileName: r.fileName,
    sheetName: r.sheetName,
    cellAddress: r.cellAddress,
    matchTxt: r.matchTxt,
    target: r.autoShapeType,
    drawingNumber: r.drawingNumber
  };
}
