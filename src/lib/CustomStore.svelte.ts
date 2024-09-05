import { untrack } from "svelte";
import type { Subscriber } from "svelte/motion";
import { writable } from "svelte/store";

export type NotifierStore<T> = ReturnType<typeof notifierStore<T>>;

/**
 * notifierStore の要件
 * * Viewにより状態が更新された場合にのみ`changeBind`を実行する
 * * その他の要因で`state`が更新された場合は`changeBind`は実行しない
 * * その他の要因で`state`が更新された場合でもViewに反映される
 * * `derived`が存在する場合はそれにより状態を自動更新する(`changeBind`は実行しない)
 * 
 * https://www.tldraw.com/r/WeoVGXm-y-dy6lz44b6V3?d=v339.-18.1920.991.page
 * 
 * ReadOnly: https://www.tldraw.com/ro/XZedhoe4T0YISn96IoC9G?d=v519.-74.1140.1024.page
 * @param value 初期値
 * @param changeBind ビューにより状態が更新されたら呼ばれる関数
 * @param derived 状態を更新する関数
 */
export function notifierStore<T>(
  value: T,
  changeBind: () => void,
  derived?: () => T,
) {
  let updater = $state(true);
  // 状態を更新する時は必ず state と w の両方更新する. `state = newState` `w.set(newState)`
  let state = $state(value);
  const w = writable(state, () => {

    const cleanUp = $effect.root(() => {
      if (derived != null) {
        let isFirst = true;
        $effect(() => {
          const newState = derived();

          if (isFirst) {
            isFirst = false;
            return;
          }

          untrack(() => {
            state = newState;
            w.set(newState);
          });
        });
      }


      // set の中で changeBind を呼び出すと１度のサイクルで複数回実行される可能性があるため $effect を使う
      let isFirst = true;
      $effect(() => {
        // eslint-disable-next-line no-unused-expressions
        updater;
        if (isFirst) {
          isFirst = false;
          return;
        }
        untrack(changeBind);
      });
    });

    return cleanUp;
  });

  return {
    subscribe(run: Subscriber<T>) {
      return w.subscribe(run);
    },
    set(newState: T): void {
      if (state !== newState) {
        state = newState;
        w.set(state);
      }
      updater = !updater;
    },
    changeBind,

    get state() { return state; },
    set state(newState) {
      if (state !== newState) {
        state = newState;
        w.set(state);
      }
    },
  };
}
