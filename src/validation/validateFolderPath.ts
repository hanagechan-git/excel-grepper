// src\validation\validateFolderPath.ts

import * as fs from "fs";
import * as path from "path";

// 不正フォルダチェック
export function validateFolderPath(folder: string, labels: any): void {

  if (!folder || folder.trim() === "") {
    throw new Error(labels.alert.folderRequired);
  }

  // 相対パス禁止
  if (folder.includes("..")) {
    throw new Error(labels.alert.folderRelativeNotAllowed);
  }

  // 絶対パスのみ許可
  if (!path.isAbsolute(folder)) {
    throw new Error(labels.alert.folderMustBeAbsolute);
  }

  // UNC 以外はローカル存在チェック
  if (!folder.startsWith("\\\\")) {
    try {
      if (!fs.existsSync(folder)) {
        throw new Error(labels.alert.folderNotFound);
      }

      if (!fs.statSync(folder).isDirectory()) {
        throw new Error(labels.alert.folderNotDirectory);
      }
    } catch {
      throw new Error(labels.alert.folderNotAccessible);
    }
  }
}

