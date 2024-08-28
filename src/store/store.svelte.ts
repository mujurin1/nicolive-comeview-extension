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
  name?: string;
  kotehan?: string;
  yobina?: string;
}

/**
 * 拡張機能のセーブデータの初期値およびセーブデータ型
 *
 * 制限
 * * `"_primitable"` という文字で終わる場合は保存時にそのオブジェクトまでをコピーする
 * * プリミティブ値またはプリミティブ値のみで構成されたオブジェクトのみを持つ
 *   * ただし配列はOK
 * * `undefined`は使ってもよいが存在するか分からないプロパティの定義は不可
 */
const defaultStore = {
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
  nicolive: {
    /** 生IDのユーザーのみ */
    users_primitable: {} as Record<string, StoreUser_Nicolive>,
    pinnLives: [] as { id: string, description: string; }[],
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
};

export const store = $state(structuredClone(defaultStore));


export function storeLoad() {
  return chrome.storage.local.get(undefined)
    .then(value => overriteClone(store, value as typeof store));
}

/**
 * 拡張機能へ保存します\
 * `data`に`store`に対応するキーがない場合はそのキーは更新されません
 */
export function storeSave(data: typeof store) {
  overriteClone(store, data);
}

export function storeClear() {
  return storeSave(structuredClone(defaultStore));
}

void storeLoad();

// store の値が更新されたら保存する
// MEMO: $effect をコンポーネント外から呼び出す場合は $effect.root を使う必要がある
$effect.root(() => {
  $effect(() => void chrome.storage.local.set($state.snapshot(store)));
});


/**
 * `target`のプロパティを`overrite`で上書きする\
 * `target`がプロパティを持っていない場合は`target`の値まま
 */
function overriteClone<T>(target: T, overrite: T): void {
  for (const key in target) {
    if (
      Object.prototype.hasOwnProperty.call(target, key) &&
      overrite[key] != null
    ) {
      if (
        key.endsWith("_primitable") ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        // "_primitable" という名前で終わる場合は内部まで探索しない
        // プリミティブ値または配列の場合はコピーする
        target[key] = structuredClone(overrite[key]);
      } else if (
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        // プロパティがオブジェクトの場合は再帰的に呼び出す
        overriteClone(target[key], overrite[key]);
      }
    }
  }
}
