import type { NceMessage, NceUser, PlatformsId } from ".";

export const NceConnectionState = {
  /** 未接続 */
  none: "none",
  /** 接続試行中 */
  connecting: "connecting",
  /** 接続中 */
  opened: "opened",
  /** 再接続中 */
  reconnecting: "reconnecting",
  /** 接続終了 */
  closed: "closed",
} as const;
export type NceConnectionState = keyof typeof NceConnectionState;

/**
 * 接続毎の設定
 */
export interface NceConnectionSetting {
  /**
   * メッセージを読み上げるか (この接続の受信したメッセージのみに関係する)\
   * 全体で読み上げOFFならこの値に依らず読み上げない
   */
  isSpeak: boolean;
  /**
   * コメジェネに送信するか (この接続の受信したメッセージのみに関係する)
   * コメジェネはまだ他に設定あるかも。それならObjectにするかな
   */
  // useComejene: boolean;
}

/**
 * 放送サイトと接続する
 * 
 * このインターフェースは基底クラスにして継承すると、
 * 各実装で重複するコードを纏められる\
 * と思うけど、今はすべきでないと思うのでやらない
 */
export interface NceConnection<P extends PlatformsId = PlatformsId> {
  /** 接続毎に一意なID */
  readonly connectionId: string;
  /** 接続状態 */
  readonly state: NceConnectionState;
  /** 接続設定 */
  readonly setting: NceConnectionSetting;
  /**
   * この接続で受信したメッセージ一覧\
   * 各メッセージの実体は`NceMessageStore`と共有している
   */
  readonly messages: NceMessage<P>[];
  /** 過去コメントを取得可能か (取得出来る過去コメントがあるか) */
  readonly canFetchBackward: boolean;
  /** 過去コメントを取得中か */
  readonly isFetchingBackward: boolean;

  /**
   * ユーザーが任意に付ける接続名\
   * 他の接続と重複する可能性がある
   */
  connectionName: string;
  /** 接続先. URL */
  url: string;
  /** 読み上げるか */
  isSpeack: boolean;

  /**
   * 接続する
   * @returns 接続に成功したか
   */
  connect(): Promise<boolean>;

  /**
   * 再接続する
   * @readonly 再接続が成功したか
   */
  reconnect(): Promise<boolean>;

  /**
   * 接続を終了する
   */
  close(): void;

  /**
   * この放送の配信者データを取得する
   */
  getOwner(): NceUser<P> | undefined;


  // 
  // TODO
  // 

  // /**
  //  * この接続を削除する\
  //  * この接続のメッセージも削除するなど用
  //  */
  // dispose(): void;
}
