import { type IEventEmitter, EventEmitter } from "../lib/EventEmitter";
import { storages } from "../lib/Storage";
import type { PlatformsId } from "../Platform";
import type { DeepReadonly } from "../utils";
import { CommentFormat } from "./SettingStore.svelte";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type StorageUserUpdate =
  {
    "new": [StorageUser],
    "update": [StorageUser],
    "remove": [string],
  };

/**
 * ストレージに保存するユーザーのキー名
 */
type StorageUserKey<LiveId extends PlatformsId = PlatformsId> = `${LiveId}%${string}`;

/**
 * ストレージに保存されるユーザーデータ
 */
export interface StorageUser {
  /**
   * 放送サイト毎のユーザーID\
   * 別放送サイトとは被っても良い
   */
  id: string;
  name?: string;
  kotehan?: string;
  yobina?: string;
  format?: CommentFormat;
}

export interface StorageUserStore {
  readonly users: DeepReadonly<{ [K in PlatformsId]: Record<string, StorageUser> }>;

  readonly nicolive: PlatformStorageUserStore;
  readonly extention: PlatformStorageUserStore;
}

export interface PlatformStorageUserStore {
  users: Record<string, StorageUser>;
  readonly updated: IEventEmitter<StorageUserUpdate>;
  upsert(user: StorageUser): void;
  remove(userId: string): void;
}


export const StorageUserStore: StorageUserStore = (() => {
  const users = $state<{ [K in PlatformsId]: Record<string, StorageUser> }>({
    "nicolive": {},
    "extention": {},
  });


  // //#region Archive: 古いデータを移行する一時的な対応策。9/30日を過ぎたらこの記述を消す
  // type OldNicoliveUsers = Record<number | string, StorageUser>;
  // const oldNicoliveUsers = storages.chromeExtentionStorage.addUse(
  //   "nocolive_user",
  //   {
  //     onUpdated(newUsers: Partial<OldNicoliveUsers>) {
  //       for (const _userId in newUsers) {
  //         const newUser = newUsers[_userId];
  //         if (newUser == null) continue;
  //         const userId = _userId + "";
  //         newUser.id = userId;
  //         const event = userStore.nicolive.users[userId] == null ? "new" : "update";
  //         safeOverwriteUser(userStore.nicolive.users, userId, newUser);
  //         userStore.nicolive.upsert(userStore.nicolive.users[userId]);
  //         userStore.nicolive.updated.emit(event, userStore.nicolive.users[userId]);
  //       }
  //       void oldNicoliveUsers.remove(Object.keys(newUsers));
  //     },
  //     onRemoved() { },  // 削除は見ない
  //   });
  // //#regionend Archive: 古いデータを移行する一時的な対応策。9/30日を過ぎたらこの記述を消す


  const externalStoreController = storages.chromeExtentionStorage.addUse<
    "user",
    Record<StorageUserKey, StorageUser>
  >(
    "user",
    {
      onUpdated(newUsers) {
        for (const storageUserKey in newUsers) {
          const parsed = storageUserKey_parse(storageUserKey as StorageUserKey);
          if (parsed == null) continue;
          const [platformId, userId] = parsed;

          const event = users[platformId][userId] == null ? "new" : "update";

          const newUser = newUsers[storageUserKey as any];
          safeOverwriteUser(users[platformId], userId, newUser);
          userStore[platformId].updated.emit(event, users[platformId][userId]);
        }
      },
      onRemoved(userIds) {
        for (const storageUserKey of userIds) {
          const parsed = storageUserKey_parse(storageUserKey);
          if (parsed == null) continue;
          const [platformId, userId] = parsed;

          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete users[platformId][userId];
          userStore[platformId].updated.emit("remove", userId);
        }
      },
    });


  const userStore: StorageUserStore = {
    get users() { return users; },
    nicolive: createPlatformStore("nicolive"),
    extention: createPlatformStore("extention"),
  };

  return userStore;

  function createPlatformStore(platformId: PlatformsId): PlatformStorageUserStore {
    const store: PlatformStorageUserStore = {
      get users() { return users.nicolive; },
      updated: new EventEmitter<StorageUserUpdate>(),
      upsert: user => {
        const event = users[platformId][user.id] == null ? "new" : "update";
        safeOverwriteUser(users[platformId], user.id, user);

        const storageUserId = storageUserKey_combine(platformId, user.id);
        void externalStoreController.update({ [storageUserId]: $state.snapshot(user) });

        store.updated.emit(event, users[platformId][user.id]);
      },
      remove: userId => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete users[platformId][userId];

        const storageUserId = storageUserKey_combine(platformId, userId);
        void externalStoreController.remove([storageUserId]);

        store.updated.emit("remove", userId);
      },
    };

    return store;
  }
})();


function storageUserKey_combine<PlatformId extends PlatformsId>(live: PlatformId, userIdStr: string): StorageUserKey<PlatformId> {
  return `${live}%${userIdStr}`;
}
function storageUserKey_parse<PlatformId extends PlatformsId>(key: StorageUserKey<PlatformId>): readonly [PlatformId, string] | undefined {
  const parsed = key.split("%");
  if (parsed.length !== 2 && !parsed[1]) return undefined;
  return [parsed[0] as any, parsed[1]];
}

/**
 * `UserStore`レコードのユーザーデータを安全に上書きする\
 * `newUser`が`undefined`ならそのユーザーデータを削除する
 * @param users 対象のレコード
 * @param userId 上書きするユーザーID
 * @param newUser 新しいユーザーデータ
 */
function safeOverwriteUser(users: Record<string, StorageUser>, userId: string, newUser: StorageUser | undefined) {
  if (newUser == null) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete users[userId];
  } else {
    users[userId] ??= {} as any;
    users[userId].id = newUser.id;
    if (newUser.name == null || newUser.name === "") delete users[userId].name;
    else users[userId].name = newUser.name;
    if (newUser.kotehan == null || newUser.kotehan === "") delete users[userId].kotehan;
    else users[userId].kotehan = newUser.kotehan;
    if (newUser.yobina == null || newUser.yobina === "") delete users[userId].yobina;
    else users[userId].yobina = newUser.yobina;
    if (newUser.format == null) delete users[userId].format;
    else if (users[userId].format == null) users[userId].format = newUser.format;
    else CommentFormat.safeOverwrite(users[userId].format, newUser.format);
  }
}
