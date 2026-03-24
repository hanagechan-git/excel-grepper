// esbuild.webview.js
const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

// CSS を out/webview にコピー
function copyCss() {
  const src = path.resolve("src/webview/style.css");
  const destDir = path.resolve("out/webview");
  const dest = path.resolve("out/webview/style.css");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(src, dest);
  console.log("Copied style.css →", dest);
}

copyCss();

// Webview 用 JS をバンドル
esbuild.build({
  entryPoints: ["src/webview/main.ts"],
  bundle: true,
  outfile: "out/webview/main.js",
  format: "iife",
  platform: "browser",
  sourcemap: true,
  target: ["es2020"],
}).catch(() => process.exit(1));
