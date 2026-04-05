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
      type: "searchError";
    }
  | {
      type: "searchCancelled";
    }
  | {
      type: "grepResult";
      payload: ExcelGrepResult[];
      fileCount: number;
      keyword: string;
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
        results: ExcelGrepResult[] | null;
        fileCount: number;
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
    }
  | {
      type: "exportCsv";
    }
  | {
      type: "restoreState";
    };
