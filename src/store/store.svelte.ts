import { EventTrigger } from "@mujurin/nicolive-api-ts";
import { createStateStore } from "../lib/CustomStore.svelte";
import { defaultStore } from "./data";

export const {
  store: extentionState,
  stateHolder: extentionStateHolder,
  onStoreSetted: onExtentionChanged,
} = createStateStore(structuredClone(defaultStore));
export type ExtentionState = typeof extentionStateHolder.state;

/**
 * ストアの値が再読み込み・初期化されたら呼び出される
 */
export const onStoreReset = new EventTrigger();

export async function storeLoad() {
  const value = await chrome.storage.local.get(undefined);
  overriteClone(extentionStateHolder.state, value as ExtentionState);
  onStoreReset.emit();
}

/**
 * 拡張機能へ保存します\
 * `data`に`store`に対応するキーがない場合はそのキーは更新されません
 */
export function storeSave(data: ExtentionState) {
  overriteClone(extentionStateHolder.state, data);
}

export function storeClear() {
  for (const [key, value] of Object.entries(structuredClone(defaultStore))) {
    (<any>extentionStateHolder.state)[key] = value;
  }
  onStoreReset.emit();
}

void storeLoad()
  .then(() => {
    let updateFromChromeListener = false;

    // store の値が更新されたら保存する
    // MEMO: $effect をコンポーネント外から呼び出す場合は $effect.root を使う必要がある
    onExtentionChanged.on(() => {
      if (updateFromChromeListener) {
        updateFromChromeListener = false;
        return;
      }

      void chrome.storage.local.set($state.snapshot(extentionStateHolder.state));
    });

    chrome.storage.local.onChanged.addListener(changed => {
      console.log("データの更新検知", changed);

      for (const [key, value] of Object.entries(changed)) {
        (<any>extentionStateHolder.state)[key] = value.newValue;
      }
    });
  });


/**
 * `target`のプロパティを`overrite`で上書きする
 * * プリミティブ値または配列または`null`の値を上書きする
 * * オブジェクトの場合は再帰的に調べる
 * * キー名が`_primitable`で終わる場合はプリミティブ値と同じ扱いをする
 * * 値が`undefined`ならその値を変更しない
 */
function overriteClone<T>(target: T, overrite: T): void {
  for (const key in target) {
    if (
      Object.prototype.hasOwnProperty.call(target, key) &&
      overrite[key] !== undefined
    ) {
      if (
        key.endsWith("_primitable") ||
        target[key] === null ||
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
