export * from "./OBS.svelte";

import type { ComejeneStyle } from "../Message";
import type { ComejeneMotionNames, ComejeneMotionSetting } from "../Motion";
import type { ComejeneContent } from "../type";
import { ComejeneReceiverBrowser, ComejeneSenderBrowser, type BrowserExSenderOption } from "./BrowserEx.svelte";
import { ComejeneReceiverOBS, ComejeneSenderOBS, type OBSSenderOption } from "./OBS.svelte";

export type ComejeneEvent = ComejeneEventReset | ComejeneEventResetMotion | ComejeneEventResetStyle | ComejeneEventNewContent;
export type ComejeneEventType = ComejeneEvent["type"];

export interface ComejeneEventReset {
  type: "reset-all";
  motionName: ComejeneMotionNames;
  motionSetting: ComejeneMotionSetting;
  comejeneStyle: ComejeneStyle;
}
export interface ComejeneEventResetMotion {
  type: "reset-motion";
  motionSetting: ComejeneMotionSetting;
}
export interface ComejeneEventResetStyle {
  type: "reset-style";
  comejeneStyle: ComejeneStyle;
}
export interface ComejeneEventNewContent {
  type: "content";
  content: ComejeneContent;
}

/**
 * コメジェネのデータを受信する\
 * OBS や N_AIR のブラウザソース側
 */
export interface ComejeneReceiver {
  /**
   * メッセージを取得するイテレータ\
   * `break`したら`close()`されます
   */
  readonly iterator: AsyncIterableIterator<ComejeneEvent>;
  /**
   * メッセージの取得を終了します
   */
  close(): void;
}

export type ComejeneSenderState = "connecting" | "open" | "close" | "failed";
export const ComejeneSenderStateText = {
  connecting: { kao: "😑", btn: "接続中‥", title: "接続しようとしています…お待ち下さい" },
  open: { kao: "😀", btn: "切断", title: "接続中です！" },
  close: { kao: "😪", btn: "接続", title: "接続していません" },
  failed: { kao: "😫", btn: "接続", title: "接続に失敗しました＞＜" },
} as const satisfies Record<ComejeneSenderState, { kao: string; btn: string; title: string; }>;

export interface ComejeneSenderOptionBase<T = ComejeneEnvTypes> {
  readonly type: T;
  readonly id: string;
  name: string;
  url: string;
  autoConnect: boolean;
}

/**
 * コメジェネのデータを送信する\
 * 拡張機能側
 */
export interface ComejeneSender<E extends ComejeneEnvTypes = ComejeneEnvTypes> {
  /** この接続の種別名 */
  readonly type: E;
  /** `ComejeneSenderController`が管理するための値 */
  readonly id: string;
  readonly state: ComejeneSenderState;
  /** 接続するための情報 */
  readonly option: ComejeneSenderOption<E>;
  /**
   * 接続に成功したら`true`を返す\
   * すでに接続している場合も`true`を返す
   */
  connect(): Promise<boolean>;

  /**
   * メッセージを送信します
   * @param message 送信するメッセージ
   * @param lowPriority 低優先度のメッセージか @default false
   */
  send(message: ComejeneEvent, lowPriority?: boolean): void;
  /**
   * 状態をリセットします\
   * 通信先のコメジェネの状態ではなくこの`Sender`の状態をリセットします
   */
  resetSenderState(): void;
  /**
   * 通信を終了します
   */
  close(): Promise<void>;
}


export type ComejeneEnvTypes = "obs" | "browserEx";
export type ComejeneSenderOption<T extends ComejeneEnvTypes = ComejeneEnvTypes> = ({
  obs: OBSSenderOption;
  browserEx: BrowserExSenderOption;
})[T];

type R<T extends ComejeneEnvTypes = ComejeneEnvTypes> = {
  readonly [K in T]: {
    readonly receiver: new () => ComejeneReceiver;
    readonly sender: new (option: ComejeneSenderOption<K>) => ComejeneSender<K>;
  }
};

export const comejeneEnvs: R = {
  obs: {
    receiver: ComejeneReceiverOBS,
    sender: ComejeneSenderOBS,
  },
  browserEx: {
    receiver: ComejeneReceiverBrowser,
    sender: ComejeneSenderBrowser,
  },
};

/**
 * 現在の実行環境をチェックする
 * @returns 
 */
export function checkComejeneEnvType(): ComejeneEnvTypes {
  if ("obsstudio" in window) return "obs";
  // TODO: N Air の場合
  return "browserEx";
}
