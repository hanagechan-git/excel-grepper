// src\extension\openExcelFile.ts

import { spawn } from "child_process";
import * as os from "os";

export function openExcelFile(filePath: string) {
  const platform = os.platform();

  if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", filePath], { windowsHide: true });
  } else if (platform === "darwin") {
    spawn("open", [filePath]);
  } else {
    spawn("xdg-open", [filePath]);
  }
}
