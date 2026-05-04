// src\extension\sanitize.ts

export function sanitizeKeyword(keyword: string): string {
  let k = keyword;

  if (/^[=+\-@]/.test(k)) {
    k = "'" + k;
  }

  k = k.replace(/\.\./g, "");

  return k
    .replace(/\|/g, "\\|")
    .replace(/;/g, "\\;")
    .replace(/"/g, '\\"')
    .replace(/\${/g, "\\${");
}

export function sanitizeForCsv(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function quoteSheetNameIfNeeded(sheet: string): string {
  // ASCII 以外 or スペース or 記号がある場合はクォート
  if (/[^A-Za-z0-9_]/.test(sheet)) {
    return `'${sheet}'`;
  }
  return sheet;
}
