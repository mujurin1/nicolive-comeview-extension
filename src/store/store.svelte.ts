import { EventTrigger } from "@mujurin/nicolive-api-ts";
import { defaultStore } from "./data";

export const store = $state(structuredClone(defaultStore));

/**
 * ストアの値が再読み込み・初期化されたら呼び出される
 */
export const onStoreReset = new EventTrigger();

export async function storeLoad() {
  const value = await chrome.storage.local.get(undefined);
  overriteClone(store, value as typeof store);
  onStoreReset.emit();
}

/**
 * 拡張機能へ保存します\
 * `data`に`store`に対応するキーがない場合はそのキーは更新されません
 */
export function storeSave(data: typeof store) {
  overriteClone(store, data);
}

export function storeClear() {
  for (const [key, value] of Object.entries(structuredClone(defaultStore))) {
    (<any>store)[key] = value;
  }
  onStoreReset.emit();
}

void storeLoad()
  .then(() => {
    let lastSavedChangeValue = store.savedChangeValue;
    let updateFromChromeListener = false;

    // store の値が更新されたら保存する
    // MEMO: $effect をコンポーネント外から呼び出す場合は $effect.root を使う必要がある
    $effect.root(() => {
      $effect(() => {
        // eslint-disable-next-line no-unused-expressions
        store;  // 保存されない場合でも必ず store を参照する必要がある

        if (updateFromChromeListener) {
          updateFromChromeListener = false;
          return;
        }

        if (lastSavedChangeValue !== store.savedChangeValue)
          void chrome.storage.local.set($state.snapshot(store));
      });
    });

    chrome.storage.local.onChanged.addListener(changed => {
      console.log("データの更新検知");

      const savedChangeValue = changed.savedChangeValue;
      if (!savedChangeValue || savedChangeValue === store.savedChangeValue) {
        console.log("データの更新は不要でした");
        return;
      }
      console.log("データを更新します");
      updateFromChromeListener = true;
      lastSavedChangeValue = savedChangeValue as typeof lastSavedChangeValue;

      for (const [key, value] of Object.entries(changed)) {
        (<any>store)[key] = value;
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
