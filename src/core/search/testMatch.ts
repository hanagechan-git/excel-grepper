// src/core/search/testMatch.ts

import { SearchConfig } from "../../common/types";

export function testMatch(text: string, config: SearchConfig): boolean {
  const { keyword, ignoreCase, isRegex } = config;

  if (isRegex) {
    try {
      const flags = ignoreCase ? "i" : "";
      const regex = new RegExp(keyword, flags);
      return regex.test(text);
    } catch {
      // 不正な正規表現は「マッチしない」と扱う
      return false;
    }
  }

  // プレーン検索
  if (ignoreCase) {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }

  return text.includes(keyword);
}
