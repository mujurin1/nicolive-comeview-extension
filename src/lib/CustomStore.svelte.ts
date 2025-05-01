import { untrack } from "svelte";
import { writable, type Subscriber } from "svelte/store";

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
  let changeBindCaller: () => void = null!;

  // MEMO: 状態を更新する時は必ず state と w の両方更新する
  //       state = newState; w.set(newState)`
  let state = $state(value);
  const w = writable(state, () => {
    const cleanUp = $effect.root(() => {
      if (derived != null) {
        let isFirst = true;
        $effect(() => {
          const newState = derived();

          if (isFirst) {
            isFirst = false;
            // MEMO: 非同期的な部分で初回effect時に状態が変わっている場合がある
            if (untrack(() => state === newState)) return;
          }

          untrack(() => {
            state = newState;
            w.set(newState);
            // MEMO: ここで changeBind を呼び出すとビュー外での更新で変化が発生するためダメ
          });
        });
      }

      changeBindCaller = oneCallOfOneCycle(changeBind);
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
      changeBindCaller();
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

/**
 * 即時呼び出しつつ1サイクルに2度呼び出されるのを防ぐための関数\
 * ※`$effect`を使っているのでコンポーネント外で使用する場合は`$effect.root`で囲う
 * @param fn 呼び出したい関数
 * @returns `fn`を1サイクルで1回のみ呼び出す関数
 */
function oneCallOfOneCycle(fn: () => void): () => void {
  let called = $state(false);

  $effect(() => {
    // eslint-disable-next-line no-unused-expressions
    called;
    called = false;
  });

  return () => {
    if (called) return;
    called = true;
    fn();
  };
}
