// src\core\cells\grepSharedStrings.ts
import JSZip from "jszip";

/**
 * sharedStrings.xml の中から、検索キーワードに一致する文字列だけを取り出す関数。
 * 「sharedIndex → 実際の文字列」の辞書を返す。
 * 
 * ・<si> 単位で index を正確に取る
 * ・<rPh>（ふりがな）は除外
 * ・<r>（リッチテキスト）の <t> は全部結合
 * ・<t xml:space="preserve"> にも対応
 */
export async function grepSharedStrings(
  zip: JSZip,
  keyword: string,
  ignoreCase: boolean
): Promise<Record<number, string>> {

  // sharedStrings.xml を取得
  const file = zip.file("xl/sharedStrings.xml");

  // ファイルが無い場合は空の辞書を返す
  if (!file) {
    return {};
  }

  // XML を文字列として読み込む
  const xml = await file.async("string");

  const result: Record<number, string> = {};

  // 大文字小文字を無視する場合は keyword を大文字化しておく
  const target = ignoreCase ? keyword.toUpperCase() : keyword;

  // <si> ... </si> を全部抜き出す（sharedStrings の1要素）
  const siBlocks = xml.match(/<si>([\s\S]*?)<\/si>/g) || [];

  siBlocks.forEach((si, index) => {

    // <rPh> ... </rPh>（ふりがな）を削除
    const withoutRuby = si.replace(/<rPh[\s\S]*?<\/rPh>/g, "");

    // <t> ... </t> を全部抜き出す（リッチテキスト対応）
    const tBlocks = withoutRuby.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];

    let text = "";

    for (const t of tBlocks) {
      // タグを除去して文字列だけ取り出す
      const inner = t.replace(/<[^>]+>/g, "");
      text += inner;
    }

    // 比較用に大文字化するかどうか
    const haystack = ignoreCase ? text.toUpperCase() : text;

    // キーワードが含まれていれば辞書に登録
    if (haystack.includes(target)) {
      result[index] = text;
    }
  });

  return result;
}
