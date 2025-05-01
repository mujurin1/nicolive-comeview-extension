import { chromeExtentionStorage } from "./ChromeExtentionStorage";

export type KeysOf<T> = T extends Record<infer K, any> ? K : never;

export interface IStorage {
  init(): Promise<void>;
  /**
   * ストレージの利用するための登録を行う\
   * `name`毎にデータが独立しており、保存/更新イベントも`name`毎に独立している
   * 
   * 初期化の順序は追加順
   * @param name 使用するストレージのキー名. `#`を含んではダメ
   * @param observer ストレージが更新された場合に呼び出されるイベント
   * @returns データの更新・削除を行うオブジェクト
   */
  addUse<
    StoreName extends string,
    Items extends { [ItemKey in string]: any },
  >(name: StoreName, observer: StorageObserver<Items>): StorageController<Items>;
}

export interface StorageObserver<
  Items extends { [ItemKey in string]: any },
> {
  /**
   * ストレージのデータが更新された
   * @param items 変更された値のみを含むレコード
   * @param type 変更の理由. 初期読み込み/再読み込み or ストレージからの変更通知
   */
  onUpdated(items: Partial<Items>, type: "load" | "change"): void;
  /**
   * ストレージのデータが削除された
   * @param itemKeys 削除されたキーの配列
   */
  onRemoved(itemKeys: KeysOf<Items>[]): void;
}

export interface StorageController<
  Items extends { [ItemKey in string]: any },
> {
  /**
   * データを保存する
   * @param items 変更する値のみを含むデータ
   */
  update(items: Partial<Items>): Promise<void>;
  /**
   * データを削除する
   * @param itemKeys 削除するキーの配列
   */
  remove(iteKeys: (KeysOf<Items>)[]): Promise<void>;
}

export const storages = {
  chromeExtentionStorage,
} as const;

let storageInitPromise: Promise<unknown> | undefined;

export async function storageInit() {
  if (storageInitPromise == null) {
    storageInitPromise = Promise.all(
      Object.values(storages)
        .map(storage => storage.init())
    );
  }

  return storageInitPromise;
}
