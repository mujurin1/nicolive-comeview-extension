import { EventEmitter, type IEventEmitter } from "@mujurin/nicolive-api-ts";
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
  readonly nce: PlatformStorageUserStore;
}

export interface PlatformStorageUserStore {
  readonly users: Record<string, StorageUser>;
  readonly updated: IEventEmitter<StorageUserUpdate>;
  /**
   * ユーザー情報を更新する\
   * ユーザーの存在に関わらずストレージの更新イベントを呼び出す
   * @param user 更新するユーザー
   */
  upsert(user: StorageUser): void;
  /**
   * ユーザー情報を削除する\
   * ストレージの削除イベントを呼び出す
   * @param userId 削除するユーザー
   */
  remove(userId: string): void;
}


export const StorageUserStore: StorageUserStore = (() => {
  const users = $state<{ readonly [K in PlatformsId]: Record<string, StorageUser> }>({
    nicolive: {},
    nce: {},
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
  //         const event = userStore.NceUserStore.nicolive.get(userId) == null ? "new" : "update";
  //         safeOverwriteUser(userStore.nicolive.users, userId, newUser);
  //         userStore.nicolive.upsert(userStore.NceUserStore.nicolive.get(userId));
  //         userStore.nicolive.updated.emit(event, userStore.NceUserStore.nicolive.get(userId));
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
          if (newUser == null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete users[platformId][userId];
          } else {
            safeOverwriteStorageUser(users[platformId], newUser);
          }
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
    nce: createPlatformStore("nce"),
  };

  return userStore;

  function createPlatformStore(platformId: PlatformsId): PlatformStorageUserStore {
    const store: PlatformStorageUserStore = {
      get users() { return users.nicolive; },
      updated: new EventEmitter<StorageUserUpdate>(),
      upsert: user => {
        const event = users[platformId][user.id] == null ? "new" : "update";
        safeOverwriteStorageUser(users[platformId], user);

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
 * `UserStore`レコードのユーザーデータを安全に上書きする
 * @param users 対象のレコード
 * @param user 新しいユーザーデータ
 */
function safeOverwriteStorageUser(users: Record<string, StorageUser>, user: StorageUser) {
  const userId = user.id;
  users[userId] ??= {} as any;
  users[userId].id = user.id;
  if (user.name == null || user.name === "") delete users[userId].name;
  else users[userId].name = user.name;
  if (user.kotehan == null || user.kotehan === "") delete users[userId].kotehan;
  else users[userId].kotehan = user.kotehan;
  if (user.yobina == null || user.yobina === "") delete users[userId].yobina;
  else users[userId].yobina = user.yobina;
  if (user.format == null) delete users[userId].format;
  else if (users[userId].format == null) users[userId].format = user.format;
  else CommentFormat.safeOverwrite(users[userId].format, user.format);
}
