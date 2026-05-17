// src/search/buildUnreadableMessage.ts

/**
 * 読み取れなかった Excel ファイル一覧のメッセージを生成する。
 * - unreadableFiles が空なら空文字を返す
 * - labels.result.unreadableFilesHeader を先頭に付ける
 * - 各ファイルに理由ラベルを付けて箇条書きで返す
 */
export function buildUnreadableMessage(
  unreadableFiles: { path: string; reason: string }[],
  labels: any
) {
  if (unreadableFiles.length === 0) {
    return "";
  }

  const header = labels.result.unreadableFilesHeader;

  // 理由コード → 表示ラベル
  const reasonLabelMap: Record<string, string> = {
    tooLarge: labels.result.reasonTooLarge,
    innerLarge: labels.result.reasonInnerLarge,
    encrypted: labels.result.reasonEncrypted,
    corrupted: labels.result.reasonCorrupted,
  };

  const list = unreadableFiles
    .map(f => {
      const reasonLabel = reasonLabelMap[f.reason] ?? f.reason;
      return `- ${f.path}（${reasonLabel}）`;
    })
    .join("\n");

  return `${header}\n${list}`;
}
