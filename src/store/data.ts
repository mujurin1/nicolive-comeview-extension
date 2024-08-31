// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { store } from "./store.svelte";

/**
 * 拡張機能のセーブデータの初期値およびセーブデータ型
 *
 * 制限
 * * `"_primitable"` という文字で終わる場合は保存時にそのオブジェクトまでをコピーする
 * * プリミティブ値またはプリミティブ値のみで構成されたオブジェクト・配列のみを持つ
 * * `undefined`の値は上書きされずに元の値のままになる\
 *   明示的に`存在しない`を表す必要のあるキーのタイプは`null`を使う\
 *   ただし`_primitable`なキーの内部は`undefined`でよい (内部を見ずに全体で上書きされるため)
 */
export const defaultStore = {
  /**
   * 保存する時に変化する値\
   * これを見てストアデータを更新するかチェックする
   */
  savedChangeValue: crypto.randomUUID(),
  general: {
    /** 接続時に過去コメントを取得するか */
    fetchConnectingBackward: true,
    /** @コテハン. @[空白文字]の場合は削除される */
    useKotehan: true,
    /** @コテハン@呼び名. 表示名とは別の呼び名を設定する */
    useYobina: false,
    /** URLを含むコメントをリンクにする */
    urlToLink: true,
    /** 最初のコメントを強調する */
    firstIsBold: true,
    /** 184の表示名を最初のコメ版にするか */
    nameToNo: true,
    /** シャープコメントを隠す */
    hideSharp: false,
  },
  yomiage: {
    isSpeak: false,
    use: "棒読みちゃん" as Yomiage,
    speachName: "none" as SpeakName,
    speachNameTypes: {
      "ユーザー名": true as boolean,
      "コメ番": false as boolean,
      "コテハン": true as boolean,
    } satisfies { [K in SpeachNameType]: boolean; },
    speachSystem: true,
  },
  bouyomiChan: {
    port: 50080,
  },
  commentView: {
    commentFormats: {
      default: {
        fontFamily: "auto",
        fontSize: 16,
        isBold: false,
        isItally: false,
        backgroundColor: null,
        nameColor: "black",
        contentColor: "black",
      } satisfies Required<CommentFormat>,
      system: {
        fontFamily: null,
        fontSize: null,
        isBold: null,
        isItally: null,
        backgroundColor: null,
        nameColor: "red",
        contentColor: "red",
      },
      firstComment: {
        fontFamily: null,
        fontSize: 12,
        isBold: null,
        isItally: null,
        backgroundColor: null,
        nameColor: null,
        contentColor: null,
      },
      owner: {
        fontFamily: null,
        fontSize: null,
        isBold: null,
        isItally: null,
        backgroundColor: null,
        nameColor: "red",
        contentColor: "red",
      },
    } satisfies Record<string, CommentFormat>,
  },
  nicolive: {
    /** 生IDのユーザーのみ */
    users_primitable: {} as Record<string, StoreUser_Nicolive>,
    pinnLives: [] as { id: string, description: string; }[],
  },
};

export const Talker = ["none", "bouyomiChan"] as const;
export type Talker = typeof Talker[number];

export const SpeakName = ["none", "mae", "ato"] as const;
export type SpeakName = typeof SpeakName[number];

export const Yomiage = ["棒読みちゃん", "VOICEVOX"] as const;
export type Yomiage = typeof Yomiage[number];

/**
 * 読み上げる名前\
 * `"呼び名"`は{@link store.general.useYobina}と同じ値になるのでここでは不要
 */
export const SpeachNameType = ["ユーザー名", "コメ番", "コテハン"] as const;
export type SpeachNameType = typeof SpeachNameType[number];

export interface StoreUser_Nicolive {
  id: number | string;
  name: string | null;
  kotehan?: string;
  yobina?: string;
  format?: CommentFormat;
}

// MEMO: 空文字の値は CSSOM 側で無いものとして扱われるので null と "" は今は同じ挙動をしている
export interface CommentFormat {
  fontFamily: string | null;
  fontSize: number | null;
  isBold: boolean | null;
  isItally: boolean | null;

  backgroundColor: string | null;
  nameColor: string | null;
  contentColor: string | null;
}

export const CommentFormat = {
  create: (format?: Partial<CommentFormat>) => ({
    fontFamily: null,
    fontSize: null,
    isBold: null,
    isItally: null,
    backgroundColor: null,
    nameColor: null,
    contentColor: null,
    ...format,
  } satisfies CommentFormat as CommentFormat)
} as const;
