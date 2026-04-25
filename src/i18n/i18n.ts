// src/i18n/i18n.ts
import * as vscode from "vscode";
import labelsEn from "./labels.en.json";
import labelsJa from "./labels.ja.json";
import labelsDe from "./labels.de.json";
import labelsId from "./labels.id.json";
import labelsKa from "./labels.ka.json";
import labelsPl from "./labels.pl.json";
import labelsRu from "./labels.ru.json";
import labelsUk from "./labels.uk.json";
import labelsVi from "./labels.vi.json";
import labelsZhCn from "./labels.zh-cn.json";
import labelsZhTw from "./labels.zh-tw.json";
import type { Labels } from "../common/labels";

export function getlang(lang: string): string {
  if (lang.startsWith("ja")) {
    return "ja";
  }
  if (lang.startsWith("de")) {
    return "de";
  }
  if (lang.startsWith("id")) {
    return "id";
  }
  if (lang.startsWith("ka")) {
    return "ka";
  }
  if (lang.startsWith("pl")) {
    return "pl";
  }
  if (lang.startsWith("ru")) {
    return "ru";
  }
  if (lang.startsWith("uk")) {
    return "uk";
  }
  if (lang.startsWith("vi")) {
    return "vi";
  }
  if (lang.startsWith("zh-cn")) {
    return "zh-cn";
  }
  if (lang.startsWith("zh-tw")) {
    return "zh-tw";
  }
  return "en"; // fallback
}

export function getLabels(): Labels {
  const lang = vscode.env.language;

  if (lang.startsWith("ja")) {
    return labelsJa as Labels;
  }
  if (lang.startsWith("de")) {
    return labelsDe as Labels;
  }
  if (lang.startsWith("id")) {
    return labelsId as Labels;
  }
  if (lang.startsWith("ka")) {
    return labelsKa as Labels;
  }
  if (lang.startsWith("pl")) {
    return labelsPl as Labels;
  }
  if (lang.startsWith("ru")) {
    return labelsRu as Labels;
  }
  if (lang.startsWith("uk")) {
    return labelsUk as Labels;
  }
  if (lang.startsWith("vi")) {
    return labelsVi as Labels;
  }
  if (lang.startsWith("zh-cn")) {
    return labelsZhCn as Labels;
  }
  if (lang.startsWith("zh-tw")) {
    return labelsZhTw as Labels;
  }

  return labelsEn as Labels;
}
