import { chromeExtentionStorage } from "./ChromeExtentionStorage";

export type KeysOf<T> = T extends Record<infer K, any> ? K : never;

export interface IStorage {
  init(): Promise<void>;
  addUse<
    StoreName extends string,
    Items extends { [ItemKey in string]: any },
  >(name: StoreName, user: StorageUser<Items>): StorageController<Items>;
}

export interface StorageUser<
  Items extends { [ItemKey in string]: any },
> {
  /** ストレージのデータが更新された */
  onUpdated: (items: Partial<Items>) => void;
  /** ストレージのデータが削除された */
  onRemoved: (ItemKeys: KeysOf<Items>[]) => void;
}

export interface StorageController<
  Items extends { [ItemKey in string]: any },
> {
  /** データを保存する */
  update: (items: Partial<Items>) => Promise<void>;
  /** データを削除する */
  remove: (iteKeys: (KeysOf<Items>)[]) => Promise<void>;
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
