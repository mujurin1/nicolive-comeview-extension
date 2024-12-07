import type { NceUser, PlatformsId } from ".";

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
 * 放送サイトと接続する
 */
export interface NceConnection<P extends PlatformsId = PlatformsId> {
  /** 接続毎に一意なID */
  readonly connectionId: string;
  /** 接続状態 */
  readonly state: NceConnectionState;
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
  //  * この接続でのメッセージ一覧\
  //  * 各メッセージの実体は`NceMessageStore`と共有している
  //  */
  // readonly messages: NceMessage<P>[];

  // /**
  //  * この接続を削除する\
  //  * この接続のメッセージも削除するなど用
  //  */
  // dispose(): void;
}

export interface NceMessagePost<P extends PlatformsId = PlatformsId> {
  postMessage(message: string): Promise<void>;
  postMessageOwner(message: string): Promise<void>;
}


