// src\common\message.ts
import type { ExcelGrepResult } from "./types";
import type { Labels } from "../common/labels";

/**
 * 拡張機能 → Webview
 */
export type ToWebviewMessage =
  | {
      type: "initLabels";
      labels: Labels;
    }
  | {
      type: "progress";
      done: number;
      total: number;
      lastCompleted: string;
    }
  | {
      type: "searchError";
    }
  | {
      type: "searchCancelled";
    }
  | {
      type: "searchComplete";
      payload: ExcelGrepResult[];
      fileCount: number;
      keyword: string;
      unreadableMessage: string;
      truncated: boolean;
      truncatedNotice: string;
    }
  | {
      type: "folderSelected";
      folder: string;
    }
  | {
      type: "restoreState";
      state: {
        folder: string | null;
        keyword: string | null;
        ignoreCase: boolean;
        dateSearchEnabled: boolean;
        results: ExcelGrepResult[] | null;
        fileCount: number;
        unreadableMessage: string | null;
        truncated: boolean;
        truncatedNotice: string | null;
      };
      isSearching: boolean;
    }

/**
 * Webview → 拡張機能
 */
export type FromWebviewMessage =
  | {
      type: "search";
      payload: {
        folder: string;
        keyword: string;
        ignoreCase: boolean;
        dateSearchEnabled: boolean;
      };
    }
  | {
      type: "cancelSearch";
    }
  | {
      type: "openFile";
      file: string;
      sheet: string;
      cell: string;
    }
  | {
      type: "openFolderDialog";
      currentFolder: string;
    }
  | {
      type: "exportCsv";
    }
  | {
      type: "restoreState";
    };
