// src\dateCheck\dateUtils.ts

// うるう年判定（西暦の標準ルール）
export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  return year % 4 === 0;
}

// 月末日を返す
export function getLastDayOfMonth(year: number, month: number): number {
  switch (month) {
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 31;
  }
}
