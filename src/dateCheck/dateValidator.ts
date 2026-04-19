// src\dateCheck\dateValidator.ts

import { DateMask } from "../common/dateTypes";
import { isLeapYear } from "./dateUtils";

export function validateDateMask(mask: DateMask): void {
  const { year, month, day } = mask;

  // 月チェック
  if (month !== null) {
    if (!/^[0-9]{2}$/.test(month)) {
      throw new Error("InvalidMonthError");
    }
    const m = Number(month);
    if (m < 1 || m > 12) {
      throw new Error("InvalidMonthError");
    }
  }

  // 日チェック
  if (day !== null) {
    if (!/^[0-9]{2}$/.test(day)) {
      throw new Error("InvalidDayError");
    }
    const d = Number(day);
    if (d < 1 || d > 31) {
      throw new Error("InvalidDayError");
    }
  }

  // 月日組み合わせチェック
  if (month !== null && day !== null) {
    const m = Number(month);
    const d = Number(day);

    if ([4, 6, 9, 11].includes(m) && d > 30) {
      throw new Error("InvalidMonthDayError");
    }

    if (m === 2 && d > 29) {
      throw new Error("InvalidMonthDayError");
    }
  }

  // うるう年チェック
  if (year !== null && month !== null && day !== null) {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    if (m === 2 && d === 29 && !isLeapYear(y)) {
      throw new Error("InvalidLeapDayError");
    }
  }
}
