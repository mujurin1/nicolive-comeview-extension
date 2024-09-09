import { connectExtenralStore, type DeepReadonly } from "../lib/ExternalStore";
import { defaultStore, type StoreType } from "./data";

/** StoreUserStore */
export interface IStore {
  readonly state: DeepReadonly<StoreType>;

  save(): Promise<void>;
  saveFromJson(json: string): Promise<void>;
  resetAllData(): Promise<void>;
}

export const store: IStore = (() => {
  let state: StoreType = $state(structuredClone(defaultStore) as any);

  const externalStoreController = connectExtenralStore<
    "default_store", StoreType
  >({
    storeName: "default_store",
    removed(keys) {
      for (const key of keys) {
        safeOverwrite(state[key], defaultStore[key]);
      }
    },
    updated(data) {
      // TODO: 間違えた初期値を消すための一時的な対応策。１週間くらいしたらこの記述を消す
      if (data.commentView?.commentFormats?.default?.fontFamily === "auto") {
        data.commentView.commentFormats.default.fontFamily = null;
      }

      safeOverwrite(state, data);
    },
  });

  const store: IStore = {
    get state() { return state; },
    async save() {
      await externalStoreController.save($state.snapshot(state));
    },
    async saveFromJson(json) {
      const parsed = JSON.parse(json);
      safeOverwrite(state, parsed);
      await store.save();
    },
    async resetAllData() {
      safeOverwrite(state, defaultStore);
      await store.save();
    },
  };

  return store;
})();

/**
 * `target`のキーを再帰的に調べて`Overwrite`の同じキーで上書きする
 * * (`Overwrite`の)値がプリミティブ値または配列の場合に値を上書きする
 *   * `現在の仕様では値が`null`なら`null`で上書きする
 *   * 値が`undefined`ならそのキーは変更しない
 */
export function safeOverwrite<T>(target: T | null, overwrite: T | null): void {
  if (overwrite == null) return;

  for (const key in target) {
    if (
      Object.hasOwn(target, key) &&
      overwrite[key] !== undefined
    ) {
      // CommentFormat で null を使うかつ残す必要がある
      // if (Overwrite[key] === null) {
      //   target[key] = undefined!;
      // } else 
      if (
        target[key] === null ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        // プリミティブ値または配列
        target[key] = structuredClone(overwrite[key]);
      } else if (typeof target[key] === "object") {
        // プロパティがオブジェクトの場合は再帰的に呼び出す
        safeOverwrite(target[key], overwrite[key]);
      }
    }
  }
}
