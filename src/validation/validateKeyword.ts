// src\validation\validateKeyword.ts

import type { Labels } from "../common/labels";

export function validateKeyword(keyword: string, labels: Labels): void {
  if (!keyword || keyword.trim() === "") {
    throw new Error(labels.alert.keywordRequired);
  }

  if (typeof keyword !== "string") {
    throw new Error(labels.alert.keywordTypeError);
  }

  if (keyword.length > 200) {
    throw new Error(labels.alert.keywordLength);
  }
}
