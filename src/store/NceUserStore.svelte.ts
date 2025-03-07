import type { NceUser } from "../Platform";
import { StorageUserStore } from "./StorageUserStore.svelte";

export type PlatformId_User = NceUser["platformId"];
export const NceUserStore = (() => {
  type UserRecord = { readonly [K in PlatformId_User]: Record<string, NceUser<K>> };
  interface PlatformUserStore<P extends PlatformId_User> {
    readonly users: Record<string, NceUser<P>>;
    /**
     * ユーザーを追加する\
     * すでに存在していた場合は何もしない
     * @returns `NceUserStore.users`から取り出したユーザー
     */
    add(user: NceUser<P>): NceUser<P>;
    get(userId: string | undefined): NceUser<P> | undefined;
    has(userId: string | undefined): boolean;
    remove(userId: string): void;
  }

  const _users = $state<UserRecord>({
    nicolive: {},
  });

  return {
    users: _users,
    nicolive: createPlatformUserStore("nicolive"),
  } as const;

  function createPlatformUserStore<P extends PlatformId_User>(platformId: P): PlatformUserStore<P> {
    const users = _users[platformId] as Record<string, NceUser<P>>;
    return {
      users,

      add: user => {
        if (users[user.storageUser.id] == null) {
          users[user.storageUser.id] = user;
          if (StorageUserStore.nicolive.users[user.storageUser.id] != null)
            users[user.storageUser.id].storageUser = StorageUserStore.nicolive.users[user.storageUser.id];
        }
        return users[user.storageUser.id];
      },
      get: userId => users[userId!],
      has: userId => users[userId!] != null,
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      remove: userId => delete users[userId],
    };
  }
})();
