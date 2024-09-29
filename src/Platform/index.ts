export * from "./Extention.svelte";
export * from "./Nicolive.svelte";

import type { StorageUser } from "../store/StorageUserStore.svelte";
import type { ExtentionMessage } from "./Extention.svelte";
import type { NicoliveMessage, NicoliveUser } from "./Nicolive.svelte";


/**
 * 放送サイトの一覧\
 * このIDに `"%"` を使ってはダメ
 */
export const PlatformsId = {
  /**
   * 拡張機能によるメッセージのためのID
   */
  extention: "extention",
  /**
   * ニコ生
   */
  nicolive: "nicolive",
} as const;
export type PlatformsId = typeof PlatformsId[keyof typeof PlatformsId];
export const PlatformsIds = Object.keys(PlatformsId) as (keyof typeof PlatformsId)[];


// 放送サイトのユーザー・メッセージ型
export type ExtUesr = NicoliveUser;
export type ExtMessage = ExtentionMessage | NicoliveMessage;



/**
 * 放送サイト毎に実装する必要のあるユーザーインターフェース
 */
export interface ExtUserType<PlatformId extends PlatformsId = PlatformsId> {
  platformId: PlatformId;
  storageUser: StorageUser;
}

/**
 * 放送サイト毎に実装する必要のあるコメントインターフェース
 */
export type ExtMessageType<
  PlatformId extends PlatformsId = PlatformsId,
  UserKind extends ExtUserKind = ExtUserKind,
> =
  {
    platformId: PlatformId;
    /**
     * 全てのコメントで一意なID\
     * 具体的な値は`platformId#messageId`で統一する
     * 
     * MEMO: 同じ放送サイトで複数の放送から取得している場合この条件では被る可能性がある
     */
    id: string;
    /**
     * このメッセージを受信した放送のID\
     * 別放送サイトとは被っても良い
     */
    liveId: string;
    /**
     * 放送毎のメッセージID\
     * 別放送サイトとは被っても良い
     */
    messageId: string;

    iconUrl: string | undefined;
    time: string | undefined;
    content: string;

    /**
     * コメントに含まれるURL
     */
    link: string | undefined;
    /**
     * シャープを含むコメントか
     */
    includeSharp: boolean;
    /**
     * コメントに固有な表示名\
     * これが`undefined`ならユーザー名などのユーザーに固有な名前が表示される
     */
    tempName: string | undefined;
  } & (
    UserKind extends "system" ? {
      kind: UserKind;
      includeSharp: false;
    }
    : UserKind extends "owner" ? {
      kind: UserKind;
      extUser: ExtUesr & { platformId: PlatformId; };
      includeSharp: false;
    }
    : UserKind extends "user" ? {
      kind: UserKind;
      extUser: ExtUesr & { platformId: PlatformId; };
    }
    : never
  );


/**
 * メッセージ投稿者の種別
 */
export type ExtUserKind = "system" | "owner" | "user";
