// import { defaultStore } from "./data";


// function createStore() {
//   let _cashe = $state(structuredClone(defaultStore));
//   let _reseted = false;

//   const storeObject = {
//     get value() { return _cashe; },
//     reset(newValue: typeof _cashe) {
//       _reseted = true;
//       _cashe = newValue;
//     },
//     async loadFromChromeStorage() {
//       const value = await chrome.storage.local.get(undefined);
//       overriteClone(_cashe, value as typeof _cashe);
//       // onStoreReset.emit();
//     },
//     saveToChromeStorage() {
//       for (const [key, value] of Object.entries(structuredClone(defaultStore))) {
//         (<any>_cashe)[key] = value;
//       }
//       // onStoreReset.emit();
//     },
//     ovserveChromeStorage() {
//       chrome.storage.local.onChanged.addListener(changed => {
//         console.log("データの更新検知");

//         const savedChangeValue = changed.savedChangeValue;
//         if (!savedChangeValue || savedChangeValue === _cashe.savedChangeValue) {
//           console.log("データの更新は不要でした");
//           return;
//         }
//         console.log("データを更新します");
//         updateFromChromeListener = true;
//         lastSavedChangeValue = savedChangeValue as typeof lastSavedChangeValue;

//         for (const [key, value] of Object.entries(changed)) {
//           (<any>store)[key] = value;
//         }
//       });
//     }
//   };

//   return storeObject;
// }



// /**
//  * `target`のプロパティを`overrite`で上書きする
//  * * プリミティブ値または配列または`null`の値を上書きする
//  * * オブジェクトの場合は再帰的に調べる
//  * * キー名が`_primitable`で終わる場合はプリミティブ値と同じ扱いをする
//  * * 値が`undefined`ならその値を変更しない
//  */
// function overriteClone<T>(target: T, overrite: T): void {
//   for (const key in target) {
//     if (
//       Object.prototype.hasOwnProperty.call(target, key) &&
//       overrite[key] !== undefined
//     ) {
//       if (
//         key.endsWith("_primitable") ||
//         target[key] === null ||
//         typeof target[key] !== "object" ||
//         Array.isArray(target[key])
//       ) {
//         // "_primitable" という名前で終わる場合は内部まで探索しない
//         // プリミティブ値または配列の場合はコピーする
//         target[key] = structuredClone(overrite[key]);
//       } else if (
//         typeof target[key] === "object" &&
//         !Array.isArray(target[key])
//       ) {
//         // プロパティがオブジェクトの場合は再帰的に呼び出す
//         overriteClone(target[key], overrite[key]);
//       }
//     }
//   }
// }
