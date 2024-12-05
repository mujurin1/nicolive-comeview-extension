import type { MessageContent, MotionNames, MotionSetting, ReceiveContents } from "..";

export type ComejeneEvent = ComejeneReset | ChangeMotionSetting | ChangeMessageContent | NewContent;

export interface ComejeneReset {
  type: "comejene-reset";
  motionName: MotionNames;
  motionSetting: MotionSetting;
  messageContent: MessageContent;
}
export interface ChangeMotionSetting {
  type: "change-motion-setting";
  motionSetting: MotionSetting;
}
export interface ChangeMessageContent {
  type: "change-message-content";
  messageContent: MessageContent;
}
export interface NewContent {
  type: "content";
  contents: ReceiveContents;
}


export interface ComejeneEnv<
  SenderOptions = never
> {
  createReceiver(): ComejeneReceiver;
  createSender(...options: ExcludeNever<[SenderOptions]>): Promise<ComejeneSender>;
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

/**
 * コメジェネのデータを送信する\
 * 拡張機能側
 */
export interface ComejeneSender {
  /**
   * メッセージを送信します
   * @param message 送信するメッセージ
   * @param lowPriority 低優先度のメッセージか @default false
   */
  send(message: ComejeneEvent, lowPriority?: boolean): void;
  /**
   * 状態をリセットします
   */
  reset(): void;
  /**
   * 通信を終了します
   */
  close(): void;
}



type ExcludeNever<T> = T extends [never] ? [] : T;
