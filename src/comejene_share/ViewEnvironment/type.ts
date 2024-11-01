import type { MessageStyle, MotionNames, MotionSetting, ReceiveContents } from "..";

export type ComejeneEvent = ComejeneReset | ChangeMotionSetting | ChangeMessageStyle | NewContent;

export interface ComejeneReset {
  type: "comejene-reset";
  motionName: MotionNames;
  motionSetting: MotionSetting;
  messageStyle: MessageStyle;
}
export interface ChangeMotionSetting {
  type: "change-motion-setting";
  motionSetting: MotionSetting;
}
export interface ChangeMessageStyle {
  type: "change-message-style";
  messageStyle: MessageStyle;
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
   */
  send(message: ComejeneEvent): void;
  /**
   * 通信を終了します
   */
  close(): void;
}



type ExcludeNever<T> = T extends [never] ? [] : T;
