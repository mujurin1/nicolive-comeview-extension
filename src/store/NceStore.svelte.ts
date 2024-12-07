import type { NceMessage, NceUser } from "../Platform";

const _messages = $state<NceMessage[]>([]);

export const NceMessageStore = {
  get messages() { return _messages; },

  add: (message: NceMessage) => _messages.push(message),
  remove: (messageId: string): boolean => {
    const index = _messages.findIndex(message => message.id === messageId);
    if (index === -1) return false;

    _messages.splice(index, 1);
    return true;
  },
  cleanup: () => {
    _messages.length = 0;
  },
} as const;



export const NceUserStore = (() => {
  type UserPlatformId = NceUser["platformId"];
  type UserRecord = { readonly [K in UserPlatformId]: Record<string, NceUser<K>> };
  interface PlatformUserStore<ID extends UserPlatformId> {
    readonly users: Record<string, NceUser<ID>>;
    /**
     * ユーザーを追加する\
     * すでに存在していた場合は何もしない
     */
    add(user: NceUser<ID>): void;
    get(userId: string): NceUser<ID> | undefined;
    has(userId: string): boolean;
    remove(userId: string): void;
  }

  const _users = $state<UserRecord>({
    nicolive: {},
  });

  return {
    users: _users,
    nicolive: createPlatformUserStore("nicolive"),
  } as const;


  function createPlatformUserStore<ID extends UserPlatformId>(platformId: ID): PlatformUserStore<ID> {
    const users = _users[platformId] as Record<string, NceUser<ID>>;
    return {
      users,

      add: user => {
        if (users[user.storageUser.id] != null) return;
        users[user.storageUser.id] = user;
      },
      get: userId => users[userId],
      has: userId => users[userId] != null,
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      remove: userId => delete users[userId],
    };
  }
})();
