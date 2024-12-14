export * from "./OBS.svelte";

import type { ComejeneStyle } from "../Message";
import type { ComejeneMotionNames, ComejeneMotionSetting } from "../Motion";
import type { ComejeneContent } from "../type";
import { ComejeneReceiverBrowser, ComejeneSenderBrowser } from "./BrowserEx.svelte";
import { ComejeneReceiverOBS, ComejeneSenderOBS, type OBSSenderOptions } from "./OBS.svelte";

export type ComejeneEvent = ComejeneReset | ChangeMotionSetting | ChangeComejeneStyle | NewContent;

export interface ComejeneReset {
  type: "comejene-reset";
  motionName: ComejeneMotionNames;
  motionSetting: ComejeneMotionSetting;
  comejeneStyle: ComejeneStyle;
}
export interface ChangeMotionSetting {
  type: "change-motion-setting";
  motionSetting: ComejeneMotionSetting;
}
export interface ChangeComejeneStyle {
  type: "change-style";
  comejeneStyle: ComejeneStyle;
}
export interface NewContent {
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
  connecting: { kao: "😑", title: "接続しようとしています…お待ち下さい" },
  open: { kao: "😀", title: "接続中です！" },
  close: { kao: "😪", title: "接続していません" },
  failed: { kao: "😫", title: "接続に失敗しました＞＜" },

} as const satisfies Record<ComejeneSenderState, { kao: string; title: string; }>;

export interface ComejeneSenderBase {
  url: string;
}

/**
 * コメジェネのデータを送信する\
 * 拡張機能側
 */
export interface ComejeneSender<E extends ComejeneEnvTypes = ComejeneEnvTypes> {
  /** この接続の種別名 */
  readonly type: E;
  /** `ComejeneSenderController`が管理するための値 */
  readonly id: number;
  readonly state: ComejeneSenderState;
  /** ユーザーが管理するためのSenderの名前 */
  name: string;
  /** 接続するための情報 */
  options: ComejeneSenderOptions<E>;
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
export type ComejeneSenderOptions<E extends ComejeneEnvTypes = ComejeneEnvTypes> = ({
  obs: OBSSenderOptions;
  browserEx: ComejeneSenderBase;
})[E];

type R<E extends ComejeneEnvTypes = ComejeneEnvTypes> = {
  readonly [K in E]: {
    readonly receiver: new () => ComejeneReceiver;
    readonly sender: new (id: number) => ComejeneSender<K>;
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

// export function createSender<E extends ComejeneEnvTypes>(env: E): 

/**
 * 現在の実行環境をチェックする
 * @returns 
 */
export function checkComejeneEnvType(): ComejeneEnvTypes {
  if ("obsstudio" in window) return "obs";
  // TODO: N Air の場合
  return "browserEx";
}










// export class ComejeneSenderController {
//   public senders = new Set<ComejeneSender>();

//   constructor(
//     private readonly getTemplate: () => ComejeneTemplate,
//   ) { }

//   public initialize(senders: ComejeneSender[]) {
//     return Promise.all(
//       senders.map(sender => this.upsertAndConnect(sender))
//     );
//   }

//   /**
//    * 追加をして初期化も行う
//    * @param sender
//    * @returns 接続に成功したか
//    */
//   public async upsertAndConnect(sender: ComejeneSender): Promise<boolean> {
//     this.senders.add(sender);
//     if (!await sender.connect()) return false;
//     sender.resetSenderState();

//     const { motion: { name, setting }, style } = this.getTemplate();
//     sender.send({
//       type: "comejene-reset",
//       motionName: name,
//       motionSetting: setting,
//       comejeneStyle: style,
//     });

//     return true;
//   }

//   // /**
//   //  * 削除をして後処理も行う
//   //  * @param name 削除するComejeneSender名
//   //  * @returns
//   //  */
//   // public deleteAndClose(name: string): boolean {
//   //   const sender = this.get(name);
//   //   if (sender == null) return false;
//   //   sender.close();
//   //   return this.senders.delete(sender);
//   // }

//   public send(message: ComejeneEvent, lowPriority = false) {
//     for (const sender of this.senders) {
//       sender.send(message, lowPriority);
//     }
//   }

//   public sendComment(content: ComejeneContent) {
//     this.send({
//       type: "content",
//       content,
//     });
//   }

//   public sendReset() {
//     const { motion: { name, setting }, style } = this.getTemplate();
//     for (const sender of this.senders) {
//       sender.resetSenderState();
//     }

//     this.send({
//       type: "comejene-reset",
//       motionName: name,
//       motionSetting: setting,
//       comejeneStyle: style,
//     });
//   }

//   public sendMotionSetting() {
//     const { motion: { setting } } = this.getTemplate();
//     this.send({ type: "change-motion-setting", motionSetting: setting }, true);
//   }

//   public sendComejeneStyle() {
//     const { style } = this.getTemplate();
//     this.send({ type: "change-message-content", comejeneStyle: style }, true);
//   }
// }
