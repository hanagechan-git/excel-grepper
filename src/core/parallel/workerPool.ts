// src/core/parallel/workerPool.ts
// ------------------------------------------------------------
// Excel Grepper の並列処理の基盤となる「ワーカープール」
// ------------------------------------------------------------

import * as os from "os";

// ------------------------------------------------------------
// WorkerFn<T, R>
//   - T: 入力アイテムの型（例: ファイルパス）
//   - R: 戻り値の型（例: 検索結果）
//   - item: キューから取り出したアイテム
//   - index: 元の配列での位置（結果を元の順番に戻すため）
// ------------------------------------------------------------
export type WorkerFn<T, R = void> = (item: T, index: number) => Promise<R>;

export interface RunParallelOptions {
  maxWorkers?: number; // 最大同時実行数（指定しなければ CPU から自動決定）
  onProgress?: (done: number, total: number) => void; // 進捗通知
  label?: string; // ログ用ラベル
}

// ------------------------------------------------------------
// decideParallelism()
//   - CPU コア数から「適切な並列数」を決める
//   - Excel 読み込みは I/O + CPU の混合なので 1.5倍くらいがちょうどいい
// ------------------------------------------------------------
export function decideParallelism(defaultMin = 2): number {
  const cores = os.cpus().length || 1;
  return Math.max(defaultMin, Math.floor(cores * 1.5));
}

// ------------------------------------------------------------
// runParallel()
//   - items: 並列処理したいアイテム一覧
//   - workerFn: 1つのアイテムを処理する関数
//   - options: 並列数や進捗通知など
//
//   仕組み：
//     1. items を queue（配列）に入れる
//     2. workerCount 個の「ワーカー」が queue から順番に取り出して処理
//     3. 全ワーカーが終わるまで待つ
// ------------------------------------------------------------
export async function runParallel<T, R = void>(
  items: T[],
  workerFn: WorkerFn<T, R>,
  options: RunParallelOptions = {}
): Promise<R[]> {
  const total = items.length;
  if (total === 0) {
    return [];
  }

  const maxWorkers = options.maxWorkers ?? decideParallelism();
  const onProgress = options.onProgress;
  const label = options.label ?? "parallel";

  // queue: 処理待ちアイテムを保持する配列
  // map() で index も保持しておく（結果を元の順番に戻すため）
  const queue = items.map((item, index) => ({ item, index }));

  // 結果を格納する配列（index 位置に入れる）
  const results: R[] = new Array(total);

  let done = 0; // 完了数

  const workers: Promise<void>[] = [];

  // ------------------------------------------------------------
  // ワーカーを maxWorkers 個だけ作る
  // ------------------------------------------------------------
  for (let w = 0; w < Math.min(maxWorkers, total); w++) {
    workers.push(
      (async () => {
        // queue が空になるまでループ
        while (true) {
          const next = queue.shift(); // 先頭から1つ取り出す
          if (!next) {
            break; // queue が空なら終了
          }
          const { item, index } = next;

          try {
            // workerFn が Promise を返すので await する
            const result = await workerFn(item, index);
            results[index] = result;
          } catch (err) {
            console.error(`[${label}] Worker error at index ${index}:`, err);
            // エラーは握りつぶす（Excel ファイルは壊れてることがあるため）
          } finally {
            done++;
            if (onProgress) {
              onProgress(done, total); // 進捗通知
            }
          }
        }
      })()
    );
  }

  // 全ワーカーが終わるまで待つ
  await Promise.all(workers);

  return results;
}
