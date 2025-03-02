import type { MyzObjects } from ".";

export const MyzUtil = {
  /**
   * 各オブジェクトうち`group`キーを持たないデータの`gruop`をセットする
   * @param group `gruop`に入れる文字列
   * @param objects `MyzObjects`
   * @returns `objects`
   */
  group: <T extends MyzObjects>(group: string, objects: T): T => {
    for (const key in objects) {
      if ("group" in objects[key]) continue;
      objects[key].group = group;
    }
    return objects;
  }
} as const;
