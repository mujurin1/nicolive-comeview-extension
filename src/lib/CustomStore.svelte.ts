import { untrack } from "svelte";
import type { Subscriber } from "svelte/motion";
import { writable } from "svelte/store";

export type NotifierStore<T> = ReturnType<typeof notifierStore<T>>;

/**
 * notifierStore の要件
 * * Viewにより状態が更新された場合にのみ`changeBind`を実行する
 * * その他の要因で`state`が更新された場合は`changeBind`は実行しない
 * * その他の要因で`state`が更新された場合でもViewに反映される
 * 
 * https://www.tldraw.com/r/WeoVGXm-y-dy6lz44b6V3?d=v339.-18.1920.991.page
 * 
 * ReadOnly: https://www.tldraw.com/ro/XZedhoe4T0YISn96IoC9G?d=v519.-74.1140.1024.page
 * @param value 初期値
 * @param changeBind ビューにより状態が更新されたら呼ばれる関数
 */
export function notifierStore<T>(
  value: T,
  changeBind: () => void,
) {
  let updater = $state(true);
  // 状態を更新する時は必ず state と w の両方更新する. `state = newState` `w.set(newState)`
  let state = $state(value);
  const w = writable(state, () => {
    let isFirst = true;

    const cleanUp = $effect.root(() => {
      // set の中で直接実行すると１度のサイクルで複数回実行される可能性があるため $effect を使う
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
        w.set(newState);
      }
      updater = !updater;
    },
    changeBind,

    get state() { return state; },
    set state(newState) {
      state = newState;
      w.set(newState);
    },
  };
}

/**
 * `notifierStore`の`derived`で状態を更新する事が可能な版\
 * `derived`は svelte で補足され、内部の参照が更新されたら状態が更新される
 * @param derived 状態を更新する関数
 * @param changeBind ビューにより状態が更新されたら呼ばれる関数
 */
export function derivedNotifierStore<T>(
  derived: () => T,
  changeBind: () => void,
) {
  let updater = $state(true);
  let state = $state(derived());
  const w = writable(state, () => {
    let isFirst = true;

    const cleanUp = $effect.root(() => {
      $effect(() => {
        const newState = derived();

        untrack(() => {
          state = newState;
          w.set(newState);
        });
      });

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
        w.set(newState);
      }
      updater = !updater;
    },
    changeBind,

    get state() { return state; },
    set state(newState) {
      state = newState;
      w.set(newState);
    },
  };
}
