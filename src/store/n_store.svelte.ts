import type { StoreUser } from "./StoreUser.svelte";



/** StoreUserStore */
export interface IUserStore {
  readonly users: DeepReadonly<Record<number | string, StoreUser>>;

  upsert(user: StoreUser, isSave: boolean): void;
  delete(userId: number | string, isSave: boolean): void;
}

function createUserStore(storeKey: string): IUserStore {
  storeKey = `#${storeKey}#`;
  let users = $state<Record<number | string, StoreUser>>({});

  const store: IUserStore = {
    get users() { return users; },
    upsert(user, isSave) {
      users[user.id] = user;
      if (isSave) void save(user);
    },
    delete(userId, isSave) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete users[userId];
      if (isSave) void remove(userId);
    },
  };

  firstLoad();

  return store;

  async function load() {
    const data = await chrome.storage.local.get();

    users = {};
    for (const key in data) {
      if (!key.startsWith(storeKey)) return;
      const user: StoreUser = data[key];
      users[user.id] = user;
    }
  }

  function firstLoad() {
    try {
      void load()
        .then(() => {
          chrome.storage.local.onChanged.addListener(onChange);
        });
    } catch (e) {
      console.error(`function createUserStore(${storeKey}) { load() => ERROR }`);
      throw e;
    }
  }

  async function save(user: StoreUser) {
    await chrome.storage.local.set({ [`${storeKey}${user.id}`]: user });
  }

  async function remove(userId: number | string) {
    await chrome.storage.local.remove(`${storeKey}${userId}`);
  }

  function onChange(changed: Record<string, chrome.storage.StorageChange>) {
    for (const key in changed) {
      if (!key.startsWith(storeKey)) return;
      const { newValue, oldValue } = changed[key] as ChromeStorageChange<StoreUser>;
      if (newValue != null) users[newValue.id] = newValue;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      else if (newValue == null) delete users[oldValue.id];
    }
  }
}

export const userStore = createUserStore("nicolive_storeuser");

// MEMO: 今の要件では値はプリミティブしか扱わないためこれで良い
type DeepReadonly<T> = { readonly [key in keyof T]: DeepReadonly<T[key]> };
type ChromeStorageChange<T> = { newValue: T; oldValue?: never; } | { newValue?: never; oldValue: T; };