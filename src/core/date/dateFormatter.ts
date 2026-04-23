import * as vscode from "vscode";

export function formatYMD(year: number, month: number, day: number): string {
  const lang = vscode.env.language.toLowerCase();
  const isJapanese = lang.startsWith("ja");

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return isJapanese
    ? `${year}/${mm}/${dd}`   // 日本語環境
    : `${year}-${mm}-${dd}`;  // その他
}
