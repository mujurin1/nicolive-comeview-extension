export * from "./Extention.svelte";
export * from "./Nicolive.svelte";

import type { StorageUser } from "../store/StorageUserStore.svelte";
import type { ExtentionMessage } from "./Extention.svelte";
import type { NicoliveMessage, NicoliveUser } from "./Nicolive.svelte";


/**
 * 放送サイトの一覧\
 * MEMO: このIDに `"%"` を使ってはダメ
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
export type ExtMessageType<PlatformId extends PlatformsId = PlatformsId> =
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
  } & (
    | {
      /** メッセージ投稿者の種別 */
      kind: "system";
      extUser: undefined;
    }
    | {
      kind: "owner" | "user";
      extUser: ExtUesr & { platformId: PlatformId; };
    }
  );

/**
 * メッセージに含まれる主に装飾やコメントビューが必要とするデータ
 */
export interface ExtMessageDeco {
}



export type PlatformsId = typeof PlatformsId[keyof typeof PlatformsId];
export const PlatformsIds = Object.keys(PlatformsId) as (keyof typeof PlatformsId)[];

/**
 * メッセージ投稿者の種別
 */
export const ExtUserKind = {
  /**
   * 配信サイトの運営/システムメッセージ\
   * システムメッセージはユーザーデータを持たない
   */
  system: "system",
  /**
   * その放送の放送者
   */
  owner: "owner",
  /**
   * リスナー
   */
  user: "user",
} as const;
export type ExtUserKind = typeof ExtUserKind[keyof typeof ExtUserKind];;
