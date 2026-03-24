// src\common\types.ts

export interface ExcelGrepResult {
  target: string;          // "Cell" or autoShapeType
  fileName: string;
  sheetName: string;
  cellAddress: string;
  matchTxt: string;
  drawingNumber?: number;  // 図形のみ
}
