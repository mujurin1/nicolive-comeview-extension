import { sleep } from "@mujurin/nicolive-api-ts";
import type { IStorage, StorageController, StorageUser } from "./Storage";

export const chromeExtentionStorage: IStorage = {
  async init() {
    await load();
    chrome.storage.local.onChanged.addListener(onChanged);
  },
  addUse<
    StoreName extends string,
    Items extends { [ItemKey in string]: any },
  >(storeName: StoreName, user: StorageUser<Items>): StorageController<Items> {
    if (storeName.includes("#"))
      throw new Error(`ストア名は "#" を含まない１文字以上の文字です. ${storeName}`);

    storageUsers[storeName] = user;

    return {
      update: items => update(storeName, items),
      remove: itemKeys => remove(storeName, itemKeys),
    };
  }
} as const;


const storageUsers: Record<string, StorageUser<any>> = {};

/** 値が存在すればこのウィンドウでセーブ中 */
let saveFromSelfChecker: undefined | (() => void);
/** 保存する必要のあるデータ */
let saveBookingData: Record<`${string}#${string}`, any> = {};
let saveLock = false;

async function load() {
  const data = await chrome.storage.local.get(undefined);
  // data: { [{ストア名}#{アイテム名}]: Item }
  const stores: Record<string, Record<string, any>> = {};

  for (const key in data) {
    const item = data[key];

    // MEMO: 現在は {"ストア名#アイテム名": null } は許可しない
    if (item == null) return;

    const parsed = parseStoreItemKey(key);
    if (parsed == null) continue;
    const storeName: string = parsed[0];
    const itemName: string = parsed[1];

    stores[storeName] ??= {};
    stores[storeName][itemName] = item;
  }

  for (const storeName in stores) {
    const store = storageUsers[storeName];
    if (store == null) continue;
    store.onUpdated(stores[storeName]);
  }
}

async function update(storeName: string, items: Partial<Record<string, any>>) {
  for (const itemName in items) {
    saveBookingData[`${storeName}#${itemName}`] = items[itemName];
  }

  await setAndRemove();
}

async function remove(storeName: string, itemNames: readonly string[]) {
  for (const itemName of itemNames) {
    saveBookingData[`${storeName}#${itemName}`] = undefined;
  }

  await setAndRemove();
}

async function setAndRemove(): Promise<void> {
  if (saveLock) {
    // すでにこのウィンドウでセーブを実行中なので後回し
    return;
  }

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
    saveFromSelfChecker();
    return;
  }

  // changed: { [{ストア名}#{アイテム名}]: { new?: Item, old?: Item } }
  const stores: Record<string, { updated: Record<string, any>, removed: string[]; }> = {};

  for (const key in changed) {
    const parsed = parseStoreItemKey(key);
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
    const store = storageUsers[storeName];
    if (store == null) continue;
    if (Object.keys(stores[storeName].updated).length > 0)
      store.onUpdated(stores[storeName].updated);
    if (stores[storeName].removed.length > 0)
      store.onRemoved(stores[storeName].removed);
  }
}

/**
 * `{ストア名}#{アイテム名}` => ["ストア名", "アイテム名"] | undefined
 */
function parseStoreItemKey(str: string): undefined | [string, string] {
  const value = /^([^#]+)#(.*)/.exec(str);
  if (value == null) return undefined;
  return [value[1], value[2]];
}
