import { EventEmitter, type IEventEmitter } from "@mujurin/nicolive-api-ts";
import { connectExtenralStore, type DeepReadonly } from "../lib/ExternalStore";
import type { CommentFormat } from "./data";

/**
 * アプリ全体のユーザーデータ\
 * 特定の配信サイトに依存してはいけない\
 * TODO: 適切な名前に変える
 */
export interface StoreUser {
  id: number | string;
  name?: string;
  kotehan?: string;
  yobina?: string;
  format?: CommentFormat;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type UserUpdate =
  {
    "new": [StoreUser],
    "update": [StoreUser],
    "remove": [number | string],
  };

/** StoreUserStore */
export interface IUserStore {
  readonly users: DeepReadonly<Record<number | string, StoreUser>>;
  readonly updated: IEventEmitter<UserUpdate>;
  // readonly updated: IEventEmitter<"new" | "update", [number | string, StoreUser | undefined]>;

  upsert(user: StoreUser): void;
  remove(userId: number | string): void;
}

export const userStore: IUserStore = (() => {
  const users = $state<Record<number | string, StoreUser>>({});

  const externalStoreController = connectExtenralStore<
    "nicolive_storeuser", Record<string, StoreUser>
  >({
    storeName: "nicolive_storeuser",
    removed(userIds) {
      for (const userId of userIds) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete users[userId];
        userStore.updated.emit("remove", userId);
      }
    },
    updated(newUsers) {
      for (const userId in newUsers) {
        const newUser = newUsers[userId];
        const event = users[userId] == null ? "new" : "update";
        safeOverwriteUser(users, userId, newUser);
        userStore.updated.emit(event, users[userId]);
      }
    },
  });

  const userStore: IUserStore = {
    get users() { return users; },
    updated: new EventEmitter<UserUpdate>(),
    upsert(user) {
      const event = users[user.id] == null ? "new" : "update";
      safeOverwriteUser(users, user.id, user);
      void externalStoreController.save({ [user.id]: $state.snapshot(user) });
      userStore.updated.emit(event, users[user.id]);
    },
    remove(userId) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete users[userId];
      void externalStoreController.remove([userId + ""]);
      userStore.updated.emit("remove", userId);
    },
  };

  return userStore;
})();

/**
 * `UserStore`レコードのユーザーデータを安全に上書きする\
 * `newUser`が`undefined`ならそのユーザーデータを削除する
 * @param users 対象のレコード
 * @param userId 上書きするユーザーID
 * @param newUser 新しいユーザーデータ
 */
export function safeOverwriteUser(users: Record<number | string, StoreUser>, userId: number | string, newUser: StoreUser | undefined) {
  if (newUser == null) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete users[userId];
    userStore.updated.emit("remove", userId);
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
    else {
      // users[userId].format = newUser.format;
      if (users[userId].format == null) users[userId].format = newUser.format;
      else {
        users[userId].format.fontFamily = newUser.format.fontFamily;
        users[userId].format.fontSize = newUser.format.fontSize;
        users[userId].format.isBold = newUser.format.isBold;
        users[userId].format.isItally = newUser.format.isItally;
        users[userId].format.backgroundColor = newUser.format.backgroundColor;
        users[userId].format.nameColor = newUser.format.nameColor;
        users[userId].format.contentColor = newUser.format.contentColor;
      }
    }
  }
}
