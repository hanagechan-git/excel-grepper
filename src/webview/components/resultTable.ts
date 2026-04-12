// src\webview\components\resultTable.ts
import { ExcelGrepResult } from "../../common/types";

/**
 * Excel Grep の結果をテーブルとして描画するコンポーネント。
 * main.ts から呼び出され、HTML 文字列を返す。
 */
export function renderResultTable(results: ExcelGrepResult[], fileCount: number, keyword: string, labels: any): string {
  const rows = results
    .map((r) => {
      return `
        <tr>
          <td class="col-target">${escapeHtml(r.target)}</td>
          <td class="col-file">
            <span class="file-link"
              data-file="${escapeHtml(r.fileName)}"
              data-sheet="${escapeHtml(r.sheetName)}"
              data-cell="${escapeHtml(r.cellAddress)}"
            >
              ${escapeHtml(r.fileName)}
            </span>
          </td>
          <td class="col-sheet">${escapeHtml(r.sheetName)}</td>
          <td class="col-cell">${escapeHtml(r.cellAddress)}</td>
          <td  class="col-text">${highlightKeyword(r.matchTxt, keyword)}</td>
          <td class="col-shape">${r.drawingNumber ?? ""}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-container">
      <table class="grep-table">
        <thead>
          <tr>
            <th class="col-target">${labels.result.target}</th>
            <th class="col-file">${labels.result.filename}</th>
            <th class="col-sheet">${labels.result.sheet}</th>
            <th class="col-cell">${labels.result.cell}</th>
            <th class="col-text">${labels.result.text}</th>
            <th class="col-shape">${labels.result.shape}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * HTML エスケープ（XSS 対策）
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// キーワード強調のhighlight<span>の差し込み
// まず正規表現の記号エスケープ
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// highlight<span>の差し込み
function highlightKeyword(text: string, keyword: string): string {

  if (!keyword) {
    return escapeHtml(text);
  }

  const escaped = escapeRegExp(keyword);
  const regex = new RegExp(escaped, "gi");

  // escapeHtml → highlight の順で安全に処理
  const safe = escapeHtml(text);

  return safe.replace(regex, (match) => {
    return `<span class="highlight">${match}</span>`;
  });
}

