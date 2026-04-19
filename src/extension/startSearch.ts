import * as vscode from "vscode";
import * as path from "path";
import JSZip from "jszip";

import { collectExcelFiles } from "./fileCollector";
import { parseWorkbookRels } from "../core/workbook/parseWorkbookRels";
import { parseWorkbook } from "../core/workbook/parseWorkbook";
import { grepExcelFile } from "../core/grepExcelFile";
import { sanitizeKeyword } from "./sanitize";
import { postProgress, postSearchCancelled, postSearchComplete } from "./messaging";

export async function startSearch({
  folder,
  keyword,
  ignoreCase,
  dateSearchEnabled,
  dateMask,
  labels,
  panel,
  lastState,
  cancelRequestedRef,
  isSearchingRef,
  resultsRef
}: any) {

  cancelRequestedRef.value = false;
  isSearchingRef.value = true;

  const safeKeyword = sanitizeKeyword(keyword);
  lastState.folder = folder;
  lastState.keyword = safeKeyword;
  lastState.ignoreCase = ignoreCase;
  lastState.dateSearchEnabled = dateSearchEnabled;

  const files = await collectExcelFiles(folder);

  postProgress(panel, 0, files.length, "");

  resultsRef.value = [];
  let scanned = 0;
  const unreadableFiles: string[] = [];

  for (const file of files) {
    try {
      if (cancelRequestedRef.value) {
        postSearchCancelled(panel);
        return;
      }

      const uri = vscode.Uri.file(file);
      const fileData = await vscode.workspace.fs.readFile(uri);

      const zip = await JSZip.loadAsync(fileData);
      const relsMap = await parseWorkbookRels(zip);
      const sheetMap = await parseWorkbook(zip, relsMap);

      const relativePath = path.relative(folder, file).replace(/\//g, "\\");
      postProgress(panel, scanned, files.length, relativePath);

      const fileResults = await grepExcelFile(
        file,
        zip,
        sheetMap,
        safeKeyword,
        ignoreCase,
        dateMask
      );
      scanned++;

      resultsRef.value.push(...fileResults);

    } catch {
      unreadableFiles.push(path.relative(folder, file).replace(/\//g, "\\"));
      continue;
    }
  }

  postProgress(panel, scanned, files.length, "");

  const MAX_RESULTS = 2000;
  const truncated = resultsRef.value.length > MAX_RESULTS;
  const displayResults = truncated
    ? resultsRef.value.slice(0, MAX_RESULTS)
    : resultsRef.value;

  const unreadableMessage =
    unreadableFiles.length > 0
      ? labels.result.unreadableFilesHeader + "\n" +
        unreadableFiles.map(f => `- ${f}`).join("\n")
      : "";

  lastState.results = displayResults;
  lastState.fileCount = files.length;
  lastState.truncated = truncated;
  lastState.truncatedNotice = labels.result.truncatedNotice;
  lastState.unreadableMessage = unreadableMessage;

  isSearchingRef.value = false;

  postSearchComplete(
    panel,
    displayResults,
    files.length,
    keyword,
    unreadableMessage,
    truncated,
    labels.result.truncatedNotice
  );
}
