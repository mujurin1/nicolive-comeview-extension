import type { DeepReadonly } from "../lib/ExternalStore";

export const Talker = ["none", "bouyomiChan"] as const;
export type Talker = typeof Talker[number];

export const SpeachNames = ["none", "mae", "ato"] as const;
export type SpeachNames = typeof SpeachNames[number];

export const YomiageTypes = ["棒読みちゃん", "VOICEVOX"] as const;
export type YomiageTypes = typeof YomiageTypes[number];

/**
 * 読み上げる名前\
 * `"呼び名"`は{@link store.general.useYobina}と同じ値になるのでここでは不要
 */
export const SpeachNameTypes = ["ユーザー名", "コメ番", "コテハン"] as const;
export type SpeachNameTypes = typeof SpeachNameTypes[number];

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
  new: (format?: Partial<CommentFormat>) => ({
    fontFamily: null,
    fontSize: null,
    isBold: null,
    isItally: null,
    backgroundColor: null,
    nameColor: null,
    contentColor: null,
    ...format,
  }) as CommentFormat,
} as const;


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
const _defaultStore = {
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
    useYomiage: "棒読みちゃん" as YomiageTypes,
    isSpeachName: "none" as SpeachNames,
    speachNames: {
      "ユーザー名": true as boolean,
      "コメ番": false as boolean,
      "コテハン": true as boolean,
    } satisfies { [K in SpeachNameTypes]: boolean; },
    speachSystem: true,
  },
  bouyomiChan: {
    port: 50080,
  },
  commentView: {
    commentFormats: {
      default: CommentFormat.new({
        fontFamily: "auto",
        fontSize: 16,
        isBold: false,
        isItally: false,
        nameColor: "black",
        contentColor: "black",
      }),
      system: CommentFormat.new({
        nameColor: "red",
        contentColor: "red",
      }),
      firstComment: CommentFormat.new({
        fontSize: 12,
      }),
      owner: CommentFormat.new({
        nameColor: "red",
        contentColor: "red",
      }),
    },
  },
  nicolive: {
    pinnLives: [] as { id: string, description: string; }[],
  },
};

export type StoreType = typeof _defaultStore;
export const defaultStore: DeepReadonly<StoreType> = _defaultStore;
