// src/i18n/i18n.ts
import * as vscode from "vscode";
import labelsEn from "./labels.en.json";
import labelsJa from "./labels.ja.json";
import type { Labels } from "../common/labels";

export function getlang(lang: string): string {
  if (lang.startsWith("ja")) {
    return "ja";
  }
  if (lang.startsWith("en")) {
    return "en";
  }
  return "en"; // fallback
}

export function getLabels(): Labels {
  const lang = vscode.env.language;

  if (lang.startsWith("ja")) {
    return labelsJa as Labels;
  }

  return labelsEn as Labels;
}
