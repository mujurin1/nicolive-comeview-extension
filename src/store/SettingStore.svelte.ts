import { storages } from "../lib/Storage";
import { SystemMessageType } from "../Platform";
import { safeOverwrite, type DeepReadonly } from "../utils";

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

export const VisibleSpeachType = {
  none: 0b00,
  visible: 0b01,
  yomiage: 0b10,
  all: 0b11,
} as const;
export type VisibleSpeachType = typeof VisibleSpeachType[keyof typeof VisibleSpeachType];
export function checkVisibleSpeachType_Speach(check: VisibleSpeachType): boolean {
  return check === VisibleSpeachType.all;
}
export function checkVisibleYomiage_Visible(check: VisibleSpeachType): boolean {
  return 0 !== (check & VisibleSpeachType.visible);
}

// MEMO: 空文字の値は CSSOM 側で無いものとして扱われるので null と "" は今は同じ挙動をしている
export interface CommentFormat {
  fontFamily: string | undefined;
  fontSize: number | undefined;
  isBold: boolean | undefined;
  isItally: boolean | undefined;

  backgroundColor: string | undefined;
  nameColor: string | undefined;
  contentColor: string | undefined;
}

export const CommentFormat = {
  new: (format?: Partial<CommentFormat>) => ({
    fontFamily: undefined,
    fontSize: undefined,
    isBold: undefined,
    isItally: undefined,
    backgroundColor: undefined,
    nameColor: undefined,
    contentColor: undefined,
    ...format,
  }) satisfies CommentFormat as CommentFormat,
  /**
   * データを修正する (空文字を`null`にする)
   */
  fix: (format: CommentFormat) => {
    if (format.fontFamily === "") format.fontFamily = undefined;
    // format.fontSize
    // format.isBold
    // format.isItally
    // format.backgroundColor
    if (format.nameColor === "") format.nameColor = undefined;
    if (format.contentColor === "") format.contentColor = undefined;
  },
  safeOverwrite: (format: CommentFormat, newFormat: CommentFormat) => {
    format.fontFamily = newFormat.fontFamily;
    format.fontSize = newFormat.fontSize;
    format.isBold = newFormat.isBold;
    format.isItally = newFormat.isItally;
    format.backgroundColor = newFormat.backgroundColor;
    format.nameColor = newFormat.nameColor;
    format.contentColor = newFormat.contentColor;
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
    showPostArea: boolean,
    post184: boolean;
    visibleAndYomiage: {
      system: Record<SystemMessageType[number], VisibleSpeachType>;
      "184": VisibleSpeachType;
    };
  };
}

const SettingStateDefault: DeepReadonly<SettingState> = {
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
    showPostArea: true,
    post184: true,
    visibleAndYomiage: {
      system: SystemMessageType.reduce<SettingState["nicolive"]["visibleAndYomiage"]["system"]>(
        (current, type) => ({
          ...current,
          [type]: VisibleSpeachType.all,
        }),
        {},
      ),
      "184": VisibleSpeachType.all,
    }
  },
} as const;


export interface SettingStore {
  readonly state: DeepReadonly<SettingState>;

  save(): Promise<void>;
  saveFromJson(json: string): Promise<void>;
  resetAllData(): Promise<void>;
}

export const SettingStore: SettingStore = (() => {
  const state = $state(structuredClone(SettingStateDefault) as SettingState);

  const externalStoreController = storages.chromeExtentionStorage.addUse(
    "setting",
    {
      onUpdated(data: Partial<SettingState>, type) {
        if (type === "change") unsetNotChangeProperty(data);
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
      safeOverwrite(state, SettingStateDefault);
      await SettingStore.save();
    },
  };
})();

/**
 * ウィンドウ間で共有しない値を `undefined` にして変更されないようにする
 */
function unsetNotChangeProperty(data: Partial<SettingState>) {
  if (data.yomiage !== undefined) {
    data.yomiage.isSpeak = undefined!;
  }
  if (data.nicolive !== undefined) {
    data.nicolive.showPostArea = undefined!;
    data.nicolive.post184 = undefined!;
  }
}
