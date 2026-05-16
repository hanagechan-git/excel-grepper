// src/core/shapes/utils.ts

/**
 * Excel の列番号（0-based）を A/B/C... の列名に変換する。
 * 例: 0 → A, 25 → Z, 26 → AA
 * 図形の <xdr:col> は 0-based なので、この変換が必須。
 */
export function columnNumberToName(col: number): string {
  let name = "";
  let n = col;

  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }

  return name;
}

/**
 * twoCellAnchor の <from> からセル番地 (A1形式) を抽出する。
 */
export function extractShapeCellAddress(anchorXml: string): string {
  // col（0-based）
  const colMatch = anchorXml.match(/<xdr:col>(\d+)<\/xdr:col>/);
  // row（0-based）
  const rowMatch = anchorXml.match(/<xdr:row>(\d+)<\/xdr:row>/);

  if (!colMatch || !rowMatch) {
    return ""; // 取れない場合は空文字（Cells と同じ思想）
  }

  const colIndex = parseInt(colMatch[1], 10);
  const rowIndex = parseInt(rowMatch[1], 10);

  const colLetter = columnNumberToName(colIndex);
  const rowNumber = rowIndex + 1; // Excel は 1-based

  return `${colLetter}${rowNumber}`;
}


/**
 * 図形内のテキスト（<a:t>）をすべて結合して 1 つの文字列にする。
 * Excel の図形は複数の <a:t> に分割されるため、join が必須。
 */
export function extractShapeText(anchorXml: string): string {
  // 1. <a:pPr> ... </a:pPr> を丸ごと削除（吹き出しの余計なタグ対策）
  const cleaned = anchorXml.replace(/<a:pPr[\s\S]*?<\/a:pPr>/g, "");

  // 2. <a:t> の中身だけを抽出
  const matches = [...cleaned.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
  if (matches.length === 0) {
    return "";
  }

  return matches.map(m => m[1]).join("");
}


/**
 * 図形の種類（AutoShapeType）を取得する。
 * <xdr:cNvPr name="四角形 3"> の name 属性をそのまま返す。
 * 図形の種類を厳密に判定する用途ではなく、表示用の補助情報。
 */
export function extractAutoShapeType(anchorXml: string): string {
  // <a:prstGeom prst="rect"> の prst="◯◯" を抽出
  const match = anchorXml.match(/<a:prstGeom[^>]*prst="([^"]+)"/);
  if (!match) {
    return "";
  }

  return match[1]; // rect, roundRect, ellipse など
}

/**
 * drawing.xml から <xdr:twoCellAnchor> をすべて抽出する。
 * 図形は基本的に twoCellAnchor の中に格納されている。
 * グループ化された図形も XML パーサーが自然に処理してくれる。
 */
export function parseTwoCellAnchors(drawingXml: string): string[] {

  const anchors = drawingXml.match(/<[^:]+:twoCellAnchor[\s\S]*?<\/[^:]+:twoCellAnchor>/g);
  return anchors || [];

}

