import { EventTrigger } from "@mujurin/nicolive-api-ts";
import type { StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable } from "svelte/store";

export interface SubscribeStore<T> {
  /**
   * View で使用するためのストア\
   * この値が変化したら`subscribe`が呼び出される
   */
  store: Writable<T>;
  /**
   * View 以外でストアの状態を見る・変更するための値\
   * この値が変化しても`subscribe`は呼び出されない
   */
  stateHolder: { state: T; };
  /**
   * `store.set` が呼ばれたら呼び出される
   */
  onStoreSetted: EventTrigger<[]>,
}

export function createStateStore<T>(
  defaultValue: T,
  start?: StartStopNotifier<T>,
): SubscribeStore<T> {
  /** state が変化した時に呼ばれるサブスクライブ */
  const subscribers = new Set<SubscribeInvalidateTuple<T>>();
  let stop: Unsubscriber | void;

  const onStoreSetted = new EventTrigger();
  let state = $state(defaultValue);
  const stateHolder = {
    get state() { return state; },
    set state(value: T) { state = value; },
  };

  function notice() {
    if (stop) {
      // store is ready
      const run_queue = subscriber_queue.length === 0;
      for (const subscriber of subscribers) {
        subscriber[1]();
        subscriber_queue.push([subscriber, state]);
      }
      if (run_queue) {
        for (const [subscriber, value] of subscriber_queue) {
          subscriber[0](value);
        }

        subscriber_queue.length = 0;
      }
    }
  }

  function set(new_value: T): void {
    if (safe_not_equal(state, new_value)) {
      state = new_value;

      onStoreSetted.emit();
    }
  }

  function update(fn: Updater<T>): void {
    set(fn(state));
  }

  function subscribe(run: Subscriber<T>, invalidate = noop): Unsubscriber {
    const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate];
    subscribers.add(subscriber);

    console.log("add subscribe ", subscribers.size);

    if (subscribers.size === 1) {
      const _stop = start?.(set, update);
      const creanUpEffect = $effect.root(() => {
        $effect(() => {
          console.log("changed");
          // eslint-disable-next-line no-unused-expressions
          state;
          notice();
        });
      });

      stop = () => {
        _stop?.();
        creanUpEffect();
      };
    }
    run(state);

    return () => {
      subscribers.delete(subscriber);
      console.log("delete subscribe ", subscribers.size);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = undefined;
      }
    };
  }

  return {
    store: { set, update, subscribe },
    stateHolder,
    onStoreSetted,
  };
}


const subscriber_queue: [SubscribeInvalidateTuple<any>, any][] = [];

type SubscribeInvalidateTuple<T> = [Subscriber<T>, () => void];

const noop = () => { };

function safe_not_equal(a: unknown, b: unknown) {
  // eslint-disable-next-line eqeqeq
  return a != a
    // eslint-disable-next-line eqeqeq
    ? b == b
    : a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}
