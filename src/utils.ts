export function timeString(ms: number): string {
  const sign = ms < 0 ? "-" : "";

  const totalSec = Math.abs(Math.floor(ms / 1000));

  const sec = totalSec % 60;
  const min = (totalSec - sec) % 3600 / 60;
  const hor = Math.floor(totalSec / 3600);
  return `${sign}${hor}:${pad(min)}:${pad(sec)}`;
}

function pad(num: number): string {
  return `00${num}`.slice(-2);
}

export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};
export type DeepMutable<T> = {
  -readonly [K in keyof T]: DeepMutable<T[K]>;
};

/**
 * `target`のキーを再帰的に調べて`overwrite`の同じキーで上書きする\
 * `overwrite`の値がプリミティブ値または配列の場合に値を上書きする
 * * 現在の仕様では値が`null`なら`null`で上書きする
 * * 値が`undefined`ならそのキーは変更しない
 */
export function safeOverwrite<T>(target: T | null, overwrite: T | null): void {
  if (overwrite == null) return;

  for (const key in target) {
    const value = target[key];
    const type = typeof value;

    if (Object.hasOwn(target, key) && overwrite[key] !== undefined) {
      if (value === null) {
        target[key] = null!;
      } else if (
        type !== "object" ||
        Array.isArray(target[key])
      ) {
        // プリミティブ値または配列
        target[key] = structuredClone(overwrite[key]);
      } else if (type === "object") {
        // プロパティがオブジェクトの場合は再帰的に呼び出す
        safeOverwrite(target[key], overwrite[key]);
      }
    }
  }
}
