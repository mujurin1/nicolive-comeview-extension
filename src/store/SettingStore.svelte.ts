import { storages } from "../lib/Storage";
import { safeOverwrite, type DeepReadonly } from "../utils";

export const Talker = ["none", "bouyomiChan"] as const;
export type Talker = typeof Talker[number];

export const SpeachNames = ["none", "mae", "ato"] as const;
export type SpeachNames = typeof SpeachNames[number];

export const YomiageTypes = ["棒読みちゃん", "VOICEVOX"] as const;
export type YomiageTypes = typeof YomiageTypes[number];

/**
 * 読み上げる名前の項目\
 * `"呼び名"`は{@link store.general.useYobina}と同じ値になるのでここでは不要
 */
export const SpeachNameItems = ["ユーザー名", "コメ番", "コテハン"] as const;
export type SpeachNameItems = typeof SpeachNameItems[number];

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
  }) satisfies CommentFormat as CommentFormat,
  /**
   * データを修正する (空文字を`null`にする)
   */
  fix: (format: CommentFormat) => {
    if (format.fontFamily === "") format.fontFamily = null;
    // format.fontSize
    // format.isBold
    // format.isItally
    if (format.backgroundColor === "") format.backgroundColor = null;
    if (format.nameColor === "") format.nameColor = null;
    if (format.contentColor === "") format.contentColor = null;
  }
} as const;

export interface SettingState {
  general: {
    /** 接続時に過去コメントを取得するか */
    fetchConnectingBackward: boolean;
    /** @コテハン. @[空白文字]の場合は削除される */
    useKotehan: boolean;
    /** @コテハン@呼び名. 表示名とは別の呼び名を設定する */
    useYobina: boolean;
    /** URLを含むコメントをリンクにする */
    urlToLink: boolean;
    /** 184の表示名を最初のコメ版にするか */
    nameToNo: boolean;
    /** シャープコメントを隠す */
    hideSharp: boolean;
  };
  yomiage: {
    isSpeak: boolean;
    useYomiage: YomiageTypes;
    isSpeachName: SpeachNames;
    speachNames: {
      ユーザー名: boolean;
      コメ番: boolean;
      コテハン: boolean;
    };
    speachSystem: boolean;
  };
  bouyomiChan: {
    port: number;
  };
  commentView: {
    commentFormats: {
      default: CommentFormat;
      system: CommentFormat;
      first: CommentFormat;
      owner: CommentFormat;
    };
  };
  nicolive: {
    pinnLives: {
      id: string;
      description: string;
    }[];
  };
}

export const SettingState: DeepReadonly<SettingState> = {
  general: {
    /** 接続時に過去コメントを取得するか */
    fetchConnectingBackward: true,
    /** @コテハン. @[空白文字]の場合は削除される */
    useKotehan: true,
    /** @コテハン@呼び名. 表示名とは別の呼び名を設定する */
    useYobina: false,
    /** URLを含むコメントをリンクにする */
    urlToLink: true,
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
    } satisfies { [K in SpeachNameItems]: boolean; },
    speachSystem: true,
  },
  bouyomiChan: {
    port: 50080,
  },
  commentView: {
    commentFormats: {
      default: CommentFormat.new({
        fontSize: 16,
        isBold: false,
        isItally: false,
        nameColor: "black",
        contentColor: "black",
      }),
      system: CommentFormat.new({
        contentColor: "red",
      }),
      first: CommentFormat.new({
        isBold: true,
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
} as const;


export interface SettingStore {
  readonly state: DeepReadonly<SettingState>;

  save(): Promise<void>;
  saveFromJson(json: string): Promise<void>;
  resetAllData(): Promise<void>;
}

export const SettingStore: SettingStore = (() => {
  const state = $state(structuredClone(SettingState) as SettingState);

  // TODO: 古いデータを消すための一時的な対応策。9/20日を過ぎたらこの記述を消す
  let removed = false;
  const oldStorage = storages.chromeExtentionStorage.addUse(
    "default_store",
    {
      onUpdated(data: Partial<SettingState>) {
        // TODO: 間違えた初期値を消すための一時的な対応策。9/20日を過ぎたらこの記述を消す
        if (data.commentView?.commentFormats?.default?.fontFamily === "auto") {
          data.commentView.commentFormats.default.fontFamily = null;
        }

        safeOverwrite(state, data);

        setInterval(() => {
          if (!removed) {
            removed = true;
            void oldStorage.remove(Object.keys($state.snapshot(state)) as any);
            void externalStoreController.update($state.snapshot(state));
          }
        }, 3000);
      },
      onRemoved() {
        // 削除はあり得ない
      },
    });

  const externalStoreController = storages.chromeExtentionStorage.addUse(
    "setting",
    {
      onUpdated(data: Partial<SettingState>) {
        // TODO: 間違えた初期値を消すための一時的な対応策。9/20日を過ぎたらこの記述を消す
        if (data.commentView?.commentFormats?.default?.fontFamily === "auto") {
          data.commentView.commentFormats.default.fontFamily = null;
        }

        safeOverwrite(state, data);
      },
      onRemoved() {
        // 削除はあり得ない
      },
    });

  return {
    get state() { return state; },
    async save() {
      await externalStoreController.update($state.snapshot(state));
    },
    async saveFromJson(json) {
      const parsed = JSON.parse(json);
      safeOverwrite(state, parsed);
      await SettingStore.save();
    },
    async resetAllData() {
      safeOverwrite(state, SettingState);
      await SettingStore.save();
    },
  };
})();