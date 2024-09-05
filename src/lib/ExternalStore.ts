import { sleep } from "@mujurin/nicolive-api-ts";

// MEMO: 今の要件では値はプリミティブしか扱わないためこれで良い
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
export type DeepMutable<T> = { -readonly [K in keyof T]: DeepMutable<T[K]> };

type KeysOf<T> = T extends Record<infer K, any> ? K : never;
type ExternalKeyName = `${string}#${string}`;

const manageStores: Record<string, StoreData<string, any>> = {};

export interface StoreData<
  StoreName extends string,
  Items extends Record<string, any>,
> {
  storeName: StoreName;
  /** データが更新された */
  updated: (items: Partial<Items>) => void;
  /** データが削除された */
  removed: (itemName: (KeysOf<Items>)[]) => void;
}

export interface ExternalStoreController<
  StoreName extends string,
  Items extends Record<string, any>,
> {
  /** データを保存する */
  save: (items: Partial<Items>) => Promise<void>;
  /** データを削除する */
  remove: (itemNames: (KeysOf<Items>)[]) => Promise<void>;
}

/**
 * 外部ストアと接続するための関数
 * @param storeName `"#"` を含まない文字
 * @param set データが更新されたら呼ばれる
 */
export function connectExtenralStore<
  StoreName extends string,
  Items extends Record<string, any>,
>(
  storeData: StoreData<StoreName, Items>
): ExternalStoreController<StoreName, Items> {
  if (
    !storeData.storeName &&
    storeData.storeName.includes("#")
  ) throw new Error(`ストア名は "#" を含まない１文字以上の文字です. ${storeData.storeName}`);

  manageStores[storeData.storeName] = storeData;

  return {
    save: (items) => save(storeData.storeName, items),
    remove: (itemNames) => remove(storeData.storeName, itemNames),
  };
}

export async function externalStoreInitialize() {
  await load();
  chrome.storage.local.onChanged.addListener(onChanged);
}

/** 値が存在すればこのウィンドウでセーブ中 */
let saveFromSelfChecker: undefined | (() => void);
/** 保存する必要のあるデータ */
let saveBookingData: Record<ExternalKeyName, any> = {};
let saveLock = false;

async function load() {
  const data = await chrome.storage.local.get(undefined);
  // data: { [{ストア名}#{アイテム名}]: Item }
  const stores: Record<string, Record<string, any>> = {};

  for (const key in data) {
    const item = data[key];

    // TODO: null なアイテムを持つことは許さないで良いのか?
    if (item == null) return;

    const parsed = parseStoreItemName(key);
    if (parsed == null) continue;
    const storeName: string = parsed[0];
    const itemName: string = parsed[1];

    stores[storeName] ??= {};
    stores[storeName][itemName] = item;
  }

  for (const storeName in stores) {
    manageStores[storeName].updated(stores[storeName]);
  }
}

async function save(storeName: string, items: Partial<Record<string, any>>) {
  for (const itemName in items) {
    saveBookingData[`${storeName}#${itemName}`] = items[itemName];
  }

  await setAndRemove();
}

async function remove(storeName: string, itemNames: readonly string[]) {
  for (const itemName of itemNames) {
    saveBookingData[`${storeName}#${itemName}`] = undefined;
  }

  // await chrome.storage.local.remove(data);
  await setAndRemove();
}

async function setAndRemove() {
  if (saveLock) {
    // すでにこのウィンドウでセーブを実行中なので後回し
    return;
  }

  console.log("save", saveBookingData);

  saveLock = true;

  await navigator.locks.request("save_extention_storage", async () => {
    if (Object.keys(saveBookingData).length === 0) return;

    const saveChecker = new Promise<void>(r => saveFromSelfChecker = r);
    const setData: Record<`${string}#${string}`, any> = {};
    const removeData: `${string}#${string}`[] = [];

    for (const key in saveBookingData) {
      if (saveBookingData[key as any] == null) removeData.push(key as any);
      else setData[key as any] = saveBookingData[key as any];
    }
    saveBookingData = {};

    try {
      void chrome.storage.local.set(setData);
      void chrome.storage.local.remove(removeData);
      await Promise.race([
        saveChecker,
        sleep(1000),  // 連続で保存した時に onChanged が呼ばれない時がある対策
      ]);
    } catch (e) {
      saveLock = false;
      throw e;
    } finally {
      saveFromSelfChecker = undefined;
    }
  });

  await sleep(100);

  saveLock = false;
  if (Object.keys(saveBookingData).length > 0) {
    return setAndRemove();
  }
}

function onChanged(changed: Record<string, chrome.storage.StorageChange>) {
  // このウィンドウでのセーブなので更新は不要
  if (saveFromSelfChecker != null) {
    console.log("no save");

    saveFromSelfChecker();
    return;
  }

  console.log("CHANGED!", changed);

  // changed: { [{ストア名}#{アイテム名}]: { new?: Item, old?: Item } }
  const stores: Record<string, { updated: Record<string, any>, removed: string[]; }> = {};

  for (const key in changed) {
    const parsed = parseStoreItemName(key);
    if (parsed == null) continue;
    const storeName: string = parsed[0];
    const itemName: string = parsed[1];

    if (key in saveBookingData) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete saveBookingData[key as any];
    }

    stores[storeName] ??= { updated: {}, removed: [] };

    const item = changed[key].newValue;
    if (item == null) stores[storeName].removed.push(itemName);
    else stores[storeName].updated[itemName] = item;
  }

  for (const storeName in stores) {
    const store = manageStores[storeName];
    if (store == null) continue;
    if (Object.keys(stores[storeName].updated).length > 0)
      store.updated(stores[storeName].updated);
    if (stores[storeName].removed.length > 0)
      store.removed(stores[storeName].removed);
  }
}

/**
 * `{ストア名}#{アイテム名}` => ["ストア名", "アイテム名"] | undefined
 */
function parseStoreItemName(key: string): undefined | [string, string] {
  const value = /^([^#]+)#(.*)/.exec(key);
  if (value == null) return undefined;
  return [value[1], value[2]];
}

