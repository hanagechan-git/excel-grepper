// src/search/buildUnreadableMessage.ts

/**
 * 壊れていて読み込めなかった Excel ファイル一覧のメッセージを生成する。
 * - unreadableFiles が空なら空文字を返す
 * - labels.result.unreadableFilesHeader を先頭に付ける
 * - ファイル一覧は "- path" の箇条書きで返す
 */
export function buildUnreadableMessage(
  unreadableFiles: string[],
  labels: any
) {
  if (unreadableFiles.length === 0) {
    return "";
  }

  const header = labels.result.unreadableFilesHeader;

  const list = unreadableFiles
    .map(f => `- ${f}`)
    .join("\n");

  return `${header}\n${list}`;
}
