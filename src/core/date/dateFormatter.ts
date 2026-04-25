// src\core\date\dateFormatter.ts

import * as vscode from "vscode";

export function formatYMD(year: number, month: number, day: number): string {
  const lang = vscode.env.language.toLowerCase();

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  if (lang.startsWith("ja")) {
    return `${year}/${mm}/${dd}`;
  }
  if (lang.startsWith("en-us")) {
    return `${mm}/${dd}/${year}`;
  }
  if (lang.startsWith("en-gb")) {
    return `${dd}/${mm}/${year}`;
  }
  if (lang.startsWith("de") || lang.startsWith("pl") || lang.startsWith("ru") ||
      lang.startsWith("uk") || lang.startsWith("ka")) {
    return `${dd}.${mm}.${year}`;
  }
  if (lang.startsWith("vi") || lang.startsWith("id")) {
    return `${dd}/${mm}/${year}`;
  }
  if (lang.startsWith("zh-cn") || lang.startsWith("zh-tw")) {
    return `${year}/${mm}/${dd}`;
  }

  return `${year}-${mm}-${dd}`; // その他は ISO
}
