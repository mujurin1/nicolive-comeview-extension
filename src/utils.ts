
export const iconNone = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

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

export function onErrorImage(e: Event) {
  const img = e.currentTarget as HTMLImageElement;
  if (img.src === iconNone) return;
  img.src = iconNone;

}

export function parseIconUrl(userId?: string | number) {
  if (typeof userId !== "number") return iconNone;
  return `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(userId / 1e4)}/${userId}.jpg`;
}

export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};
export type DeepMutable<T> = {
  -readonly [K in keyof T]: DeepMutable<T[K]>;
};

/**
 * `target`のキーを再帰的に調べて`Overwrite`の同じキーで上書きする
 * * (`Overwrite`の)値がプリミティブ値または配列の場合に値を上書きする
 *   * `現在の仕様では値が`null`なら`null`で上書きする
 *   * 値が`undefined`ならそのキーは変更しない
 */
export function safeOverwrite<T>(target: T | null, overwrite: T | null): void {
  if (overwrite == null) return;

  for (const key in target) {
    if (Object.hasOwn(target, key) &&
      overwrite[key] !== undefined) {
      // CommentFormat で null を使うかつ残す必要がある
      // if (Overwrite[key] === null) {
      //   target[key] = undefined!;
      // } else 
      if (target[key] === null ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])) {
        // プリミティブ値または配列
        target[key] = structuredClone(overwrite[key]);
      } else if (typeof target[key] === "object") {
        // プロパティがオブジェクトの場合は再帰的に呼び出す
        safeOverwrite(target[key], overwrite[key]);
      }
    }
  }
}
