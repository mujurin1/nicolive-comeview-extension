export * from "./Extention.svelte";
export * from "./Nicolive.svelte";

import type { StorageUser } from "../store/StorageUserStore.svelte";
import type { ExtentionMessage } from "./Extention.svelte";
import type { NicoliveMessage, NicoliveUser } from "./Nicolive.svelte";

type X<T extends string> = {
  [key in T]: string;
};

/**
 * 放送サイトの一覧\
 * このIDに `"%"` を使ってはダメ
 */
export const PlatformsId = {
  /**
   * 拡張機能による汎用メッセージ
   */
  nce: "nce",
  /**
   * ニコ生
   */
  nicolive: "nicolive",
} as const;
export type PlatformsId = typeof PlatformsId[keyof typeof PlatformsId];
export const PlatformsIds = Object.keys(PlatformsId) as (keyof typeof PlatformsId)[];

// 放送サイトのユーザー・メッセージ型
export type NceUser<P extends PlatformsId = PlatformsId> =
  (NicoliveUser) & { platformId: P; };
export type NceMessage<P extends PlatformsId = PlatformsId> =
  (ExtentionMessage | NicoliveMessage) & { platformId: P; };


/**
 * 共通のユーザーインターフェース
 */
export interface NceUserType<PlatformId extends PlatformsId = PlatformsId> {
  readonly platformId: PlatformId;
  /**
   * ストレージのユーザー情報\
   * 実体は`StorageUserStore`と共有している\
   * `StorageUser`に存在する情報は`NceUserType`で定義しない (二重管理になるため)
   */
  storageUser: StorageUser;
  iconUrl: string | undefined;
}

/** メッセージ投稿者の種別 */
export type ExtUserKind = "system" | "owner" | "user";
/**
 * 共通のメッセージインターフェース
 */
export type ExtMessageType<
  PlatformId extends PlatformsId = PlatformsId,
  UserKind extends ExtUserKind = ExtUserKind,
> =
  {
    readonly platformId: PlatformId;
    /**
     * 全てのメッセージで一意なID\
     * 実際の値は`connectionId#messageId`で統一する
     */
    readonly id: `${string}#${string}`;
    /**
     * このメッセージを受信した接続のID\
     * `NceConnection.connectionId`
     */
    readonly connectionId: string;
    /**
     * 放送内で固有のメッセージID\
     * 同じ接続内では重複しない
     */
    readonly messageId: string;

    readonly time: string | undefined;
    readonly content: string;

    /** メッセージに含まれるURL */
    readonly link: string | undefined;
    /** シャープを含むメッセージか */
    readonly includeSharp: boolean;
    /**
     * メッセージに固有な表示名\
     * これが`undefined`ならユーザー名などのユーザーに固有な名前が表示される
     */
    readonly tempName: string | undefined;
  } & (
    UserKind extends "system" ? {
      readonly kind: UserKind;
      readonly includeSharp: false;
    }
    : UserKind extends "owner" ? {
      readonly kind: UserKind;
      readonly user: NceUser & { readonly platformId: PlatformId; };
      readonly includeSharp: false;
    }
    : UserKind extends "user" ? {
      readonly kind: UserKind;
      readonly user: NceUser & { readonly platformId: PlatformId; };
      /** 初コメか */
      readonly isFirstComment: boolean;
    }
    : never
  );
