// src\common\dateTypes.ts

export interface DateMask {
  year: string | null;   // "2026" or null (＝ワイルドカード)
  month: string | null;  // "05" or null
  day: string | null;    // "13" or null
}
