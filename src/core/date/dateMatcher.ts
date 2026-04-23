// src\core\date\dateMatcher.ts

import { DateMask } from "../../common/dateTypes";
import { isLeapYear, getLastDayOfMonth } from "../../dateCheck/dateUtils";

// セルのシリアル値を YYYY, MM, DD に分解する
export function serialToYMD(serial: number): { year: number; month: number; day: number } {

  // Excel の 1900/2/29 バグ対応
  // serial=60 は「存在しない 1900/2/29」
  // serial>=61 は 1 日ずらす必要がある
  let days = serial;
  if (serial >= 60) {
    days -= 1;
  }

  // 1900/1/1 を 1 として扱う
  days -= 1;

  let year = 1900;
  while (true) {
    const yearDays = isLeapYear(year) ? 366 : 365;
    if (days < yearDays) {
      break;
    }
    days -= yearDays;
    year++;
  }

  let month = 1;
  while (true) {
    const lastDay = getLastDayOfMonth(year, month);
    if (days < lastDay) {
      break;
    }
    days -= lastDay;
    month++;
  }

  const day = days + 1;

  return { year, month, day };
}

// -------------------------
// メイン：マスクと一致するか判定
// -------------------------
export function matchDateMask(mask: DateMask, serial: number): boolean {
  const { year, month, day } = mask;
  const ymd = serialToYMD(serial);

  // 年一致
  if (year !== null && Number(year) !== ymd.year) {
    return false;
  }

  // 月一致
  if (month !== null && Number(month) !== ymd.month) {
    return false;
  }

  // 日一致
  if (day !== null && Number(day) !== ymd.day) {
    return false;
  }

  return true;
}
