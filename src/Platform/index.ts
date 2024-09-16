export * from "./Extention.svelte";
export * from "./Nicolive.svelte";

import type { StorageUser } from "../store/StorageUserStore.svelte";
import type { ExtentionMessage, ExtentionUser } from "./Extention.svelte";
import type { NicoliveMessage, NicoliveUser } from "./Nicolive.svelte";

/**
 * 放送サイトの一覧\
 * MEMO: このIDに `"%"` を使ってはダメ
 */
export const PlatformsId = {
  /**
   * 拡張機能によるメッセージのため
   */
  extention: "extention",
  /** ニコ生 */
  nicolive: "nicolive",
} as const;
export type PlatformsId = typeof PlatformsId[keyof typeof PlatformsId];
export const PlatformsIds = Object.keys(PlatformsId) as (keyof typeof PlatformsId)[];

export const ExtUserKind = {
  /** リスナー */
  user: "user",
  /** その放送の放送者 */
  owner: "owner",
  /** 配信サイトの運営/システムメッセージ */
  system: "system",
} as const;
export type ExtUserKind = keyof typeof ExtUserKind;

export type ExtUesr = ExtentionUser | NicoliveUser;
export type ExtMessage = ExtentionMessage | NicoliveMessage;

/**
 * 拡張機能共通のユーザー形式
 */
export interface ExtUserType<PlatformId extends PlatformsId = PlatformsId> {
  platformId: PlatformId;
  storageUser: StorageUser;
}

/**
 * 拡張機能共通のコメント形式\
 * 各サイトのコメントデータはこれを実装すること
 */
export interface ExtMessageType<PlatformId extends PlatformsId = PlatformsId> {
  /**
   * 全てのコメントで一意なID\
   * `platformId#messageId`
   */
  id: string;
  platformId: PlatformId;
  /**
   * 配信サイト毎の放送毎のID\
   * 別放送サイトとは被っても良い
   */
  liveId: string;
  /**
   * 放送サイト毎のコメントID\
   * 別放送サイトとは被っても良い
   */
  messageId: string;
  kind: ExtUserKind;
  extUser: ExtUesr & { platformId: PlatformId; };
  iconUrl: string | undefined;
  time: string;
  content: string;
  /** コメントに含まれるURL */
  link: string | undefined;
  /** シャープを含むコメントか */
  includeSharp: boolean;
}
