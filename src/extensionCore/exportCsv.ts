// src\extension\exportCsv.ts

import * as vscode from "vscode";
import { sanitizeForCsv } from "./sanitize";
import { getTimestamp } from "./getTimestamp";

export async function exportCsv(results: any[], labels: any) {

  if (!results || results.length === 0) {
    vscode.window.showWarningMessage(labels.alert.noResultsToExport);
    return;
  }

  const csvLines: string[] = [];

  csvLines.push([
    "target",
    "fileName",
    "sheetName",
    "cellAddress",
    "matchTxt",
    "drawingNumber"
  ].join(","));

  for (const r of results) {
    const filePath = sanitizeForCsv(r.fileName);
    const match = sanitizeForCsv(r.matchTxt);

    const sheet = r.sheetName.replace(/"/g, '""');
    const cell = r.cellAddress.replace(/"/g, '""');

    const link = `${filePath}#${sheet}!${cell}`;
    const hyperlink = `"=HYPERLINK(""${link}"",""${sheet}!${cell}"")"`;

    csvLines.push([
      `"${r.target}"`,
      `"${filePath}"`,
      `"${sheet}"`,
      hyperlink,
      `"${match}"`,
      r.drawingNumber ?? ""
    ].join(","));
  }

  const csvContent = csvLines.join("\n");
  const defaultFileName = `excelGrep_${getTimestamp()}.csv`;

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultFileName),
    filters: { "CSV Files": ["csv"] },
    saveLabel: labels.dialog.saveCsv
  });

  if (!uri) {
    return;
  }

  const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
  await vscode.workspace.fs.writeFile(
    uri,
    Buffer.concat([bom, Buffer.from(csvContent, "utf8")])
  );

  vscode.window.showInformationMessage(labels.info.csvSaved);
}
