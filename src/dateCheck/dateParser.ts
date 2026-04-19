// src\dateCheck\dateParser.ts

import { DateMask } from "../common/dateTypes";

export function parseDateMask(input: string): DateMask {

  // 1. 長さチェック（8桁固定）
  if (input.length !== 8) {
    throw new Error("InvalidLengthError");
  }

  // 2. 許可文字チェック（数字 or * のみ）
  if (!/^[0-9*]{8}$/.test(input)) {
    throw new Error("InvalidCharacterError");
  }

  // 3. 全部 * はエラー
  if (input === "********") {
    throw new Error("AllAsterisksError");
  }

  // 4. 年月日ごとに分割
  const yearRaw = input.substring(0, 4);
  const monthRaw = input.substring(4, 6);
  const dayRaw = input.substring(6, 8);

  // 5. 年月日単位のワイルドカード判定
  const year = parseUnit(yearRaw, 4);
  const month = parseUnit(monthRaw, 2);
  const day = parseUnit(dayRaw, 2);

  return { year, month, day };
}

// 年・月・日単位のパース
function parseUnit(raw: string, length: number): string | null {

  // 完全ワイルドカード（例：**** or **）
  if (/^\*+$/.test(raw)) {
    return null;
  }

  // 完全数字（例：2026, 05, 13）
  if (/^[0-9]+$/.test(raw)) {
    if (raw.length !== length) {
      throw new Error("InvalidWildcardPatternError");
    }
    return raw;
  }

  // それ以外は桁単位の * が混ざっている → エラー
  throw new Error("InvalidWildcardPatternError");
}
