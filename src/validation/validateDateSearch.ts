// src\validation\validateDateSearch.ts

import { DateMask } from "../common/dateTypes";
import { parseDateMask } from "../dateCheck/dateParser";
import { validateDateMask } from "../dateCheck/dateValidator";

export function validateDateSearch(
  keyword: string,
  dateSearchEnabled: boolean,
  labels: any
): DateMask | null {

  if (!dateSearchEnabled) {
    return null;
  }

  let mask: DateMask;

  try {
    mask = parseDateMask(keyword);
  } catch (err: any) {
    throw new Error(labels.alert[err.message] ?? labels.alert.dateMaskInvalid);
  }

  try {
    validateDateMask(mask);
  } catch (err: any) {
    throw new Error(labels.alert[err.message] ?? labels.alert.dateMaskInvalid);
  }

  return mask;
}
