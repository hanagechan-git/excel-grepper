// src\common\labels.ts

export interface Labels {
  search: {
    filePath: string;
    select: string;
    keyword: string;
    ignoreCase: string;
    search: string;
    cancel: string;
    csv: string;
  };

  result: {
    noResult: string;
    truncatedNotice: string;
    unreadableFilesHeader: string;
    files: string;
    hits: string;
    target: string;
    filename: string;
    sheet: string;
    cell: string;
    text: string;
    shape: string;
  };

  alert: {
    keywordRequired: string;
    keywordTypeError: string;
    keywordLength: string;
    noResultsToExport: string;
    folderInvalid: string;
  };

  dialog: {
    saveCsv: string;
  };

  info: {
    csvSaved: string;
  };
}
