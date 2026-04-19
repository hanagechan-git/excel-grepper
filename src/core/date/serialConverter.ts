// src\core\date\serialConverter.ts

import { isLeapYear, getLastDayOfMonth } from "../../dateCheck/dateUtils";

// シリアル値に変換する
// Excel のシリアル値は 1900/1/1 = 1
// ただし Excel は「1900年はうるう年」と誤認している（2/29 が存在する扱い）
// そのため 1900/3/1 以降は +1 ずれる。
// 今回は 1900 年以前を扱わないので、標準的な計算で問題なし。

export function toSerial(year: number, month: number, day: number): number {
  // JS の Date は 1970 基準なので、自前で日数計算する
  const days = daysSince1900(year, month, day);

  // Excel の仕様では 1900/1/1 = 1
  return days + 1;
}

export function getMonthRangeSerial(year: number, month: number): { start: number; end: number } {
  const start = toSerial(year, month, 1);
  const endDay = getLastDayOfMonth(year, month);
  const end = toSerial(year, month, endDay);
  return { start, end };
}

// -------------------------
// 内部ユーティリティ
// -------------------------

function daysSince1900(year: number, month: number, day: number): number {
  // 1900/1/1 からの経過日数を計算する
  let days = 0;

  // 年ごとの日数を加算
  for (let y = 1900; y < year; y++) {
    days += isLeapYear(y) ? 366 : 365;
  }

  // 月ごとの日数を加算
  for (let m = 1; m < month; m++) {
    days += getLastDayOfMonth(year, m);
  }

  // 日を加算
  days += day - 1;

  return days;
}

