import { sleep } from "@mujurin/nicolive-api-ts";
import { createStateStore } from "../lib/CustomStore.svelte";
import { defaultStore } from "./data";

export const {
  store: extentionState,
  stateHolder: extentionStateHolder,
  onStoreSetted: onExtentionChanged,
} = createStateStore(structuredClone(defaultStore));
export type ExtentionState = typeof extentionStateHolder.state;

export async function storeLoad() {
  const value = await chrome.storage.local.get(undefined);
  overriteClone(extentionStateHolder.state, value as ExtentionState);
  onExtentionChanged.emit();
}

/**
 * 拡張機能へ保存します\
 * `data`に`store`に対応するキーがない場合はそのキーは更新されません
 */
export function storeSave(data: ExtentionState) {
  overriteClone(extentionStateHolder.state, data);
  onExtentionChanged.emit();
}

export function storeClear() {
  for (const [key, value] of Object.entries(structuredClone(defaultStore))) {
    (<any>extentionStateHolder.state)[key] = value;
  }
  onExtentionChanged.emit();
}

void storeLoad()
  .then(() => {
    /** 値が存在すればこのウィンドウでセーブ中 */
    let saveFromSelfChecker: undefined | (() => void);
    let needSave = false;

    // store の値が更新されたら保存する
    // MEMO: $effect をコンポーネント外から呼び出す場合は $effect.root を使う必要がある
    onExtentionChanged.on(save);
    chrome.storage.local.onChanged.addListener(load);

    async function save() {
      if (saveFromSelfChecker != null) {
        needSave = true;
        return;
      }

      const saveChecker = new Promise<void>(r => saveFromSelfChecker = r);

      await navigator.locks.request("save_extention_storage", async () => {
        needSave = false;
        console.log("保存");

        await chrome.storage.local.set($state.snapshot(extentionStateHolder.state));
        await Promise.race([
          saveChecker,
          sleep(1000),  // 連続で保存した時に onChanged が呼ばれない時がある対策
        ]);
      });

      saveFromSelfChecker = undefined;

      if (needSave) {
        needSave = false;
        return save();
      }
    }

    function load(changed_: Record<string, chrome.storage.StorageChange>) {
      const changed: Record<string, chrome.storage.StorageChange> = {};
      for (const key in changed_) {
        if (key.startsWith("#")) continue;
        changed[key] = changed_[key];
      }
      if (Object.keys(changed).length === 0) {
        console.log("#data");
        return;
      }

      console.log("データの更新検知", changed);

      // このウィンドウでのセーブなので更新は不要
      if (saveFromSelfChecker != null) {
        saveFromSelfChecker();
        console.log("no load!------!");
        return;
      }
      console.log(" loaded!!!!!!!");

      for (const [key, value] of Object.entries(changed)) {
        overriteClone((<any>extentionStateHolder.state)[key], value.newValue);
      }
    }
  });


/**
 * `target`のプロパティを`overrite`で上書きする
 * * プリミティブ値または配列または`null`の値を上書きする
 * * オブジェクトの場合は再帰的に調べる
 * * キー名が`_primitable`で終わる場合はプリミティブ値と同じ扱いをする
 * * 値が`undefined`ならその値を変更しない
 */
function overriteClone<T>(target: T, overrite: T): void {
  if (overrite == null) return;

  for (const key in target) {
    if (
      Object.prototype.hasOwnProperty.call(target, key) &&
      overrite[key] !== undefined
    ) {
      if (overrite[key] === null) {
        target[key] = undefined!;
      } else if (key.endsWith("_primitable")) {
        for (const subKey in overrite[key]) {
          if (overrite[key][subKey] == null) {
            (<any>target[key])[subKey] = undefined;
            continue;
          }

          (<any>target[key])[subKey] = overrite[key][subKey];
        }
      } else if (
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        // プリミティブ値または配列
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
