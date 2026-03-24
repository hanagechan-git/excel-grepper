// src\fileCollector.ts
import * as fs from "fs/promises";
import * as path from "path";

const EXCEL_EXT = [".xlsx", ".xlsm", ".xlsb"];

export async function collectExcelFiles(dir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        // 除外したいフォルダがあればここで弾く
        if (entry.name === ".git"
         || entry.name === ".svn"
        //  || entry.name === "node_modules"
          ) {
          continue;
        }
        await walk(fullPath);
      } else {
        // Excel の一時ファイルを除外
        if (entry.name.startsWith("~$")) {
          continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (EXCEL_EXT.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return results;
}
