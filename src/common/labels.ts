// src\common\labels.ts

export interface Labels {
  search: {
    filePath: string;
    select: string;
    keyword: string;
    ignoreCase: string;
    dateSearch: string;
    regex: string;
    search: string;
    cancel: string;
    csv: string;
  };

  result: {
    noResult: string;
    truncatedNotice: string;
    unreadableFilesHeader: string;
    reasonTooLarge: string;
    reasonInnerLarge: string;
    reasonEncrypted: string;
    reasonCorrupted: string;
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
    folderRequired: string;
    folderRelativeNotAllowed: string;
    folderMustBeAbsolute: string;
    folderNotFound: string;
    folderNotDirectory: string;
    folderNotAccessible: string;
    dateMaskInvalid: string;
    InvalidLengthError: string;
    InvalidCharacterError: string;
    AllAsterisksError: string;
    InvalidWildcardPatternError: string;
    InvalidMonthError: string;
    InvalidDayError: string;
    InvalidMonthDayError: string;
    InvalidLeapDayError: string;
  };

  dialog: {
    saveCsv: string;
  };

  info: {
    csvSaved: string;
  };
}
