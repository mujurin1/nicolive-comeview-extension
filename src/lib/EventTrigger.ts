type Listener<A extends readonly unknown[] = [], R extends boolean | void = void> = (...arg: A) => R;

/**
 * 1種類のイベントへのイベントハンドラーを管理します
 * @template Args イベントハンドラの引数型
 */
export interface IEventTrigger<Args extends readonly unknown[]> {
  /**
   * イベントリスナーを登録します
   * @param listener イベントリスナー
   */
  on(listener: Listener<Args>): this;

  /**
   * `true` を返すと自身を取り除くイベントリスナーを登録します
   * @param event イベント名
   * @param listener イベントリスナー
   */
  onoff(listener: Listener<Args, boolean | void>): this;

  /**
   * イベントリスナーを削除します
   * @param listener イベントリスナー
   */
  off(listener: Listener<Args>): this;

  /**
   * イベントリスナーを一度だけ実行するように登録します
   * @param listener イベントリスナー
   */
  once(listener: Listener<Args>): this;

  /**
   * イベントを実行します
   * @param args 引数
   * @returns １つでもイベントを実行したか
   */
  emit(...args: Args): boolean;
}

export class EventTrigger<Args extends readonly unknown[]> implements IEventTrigger<Args> {
  private readonly callbacksSet = new Set<Listener<Args, boolean | void>>();

  public on(listener: Listener<Args>) {
    this.callbacksSet.add(listener);
    return this;
  }

  public onoff(listener: Listener<Args, boolean | void>) {
    return this.on(listener as unknown as Listener<Args>);
  }

  public off(listener: Listener<Args>) {
    this.callbacksSet.delete(listener);
    return this;
  }

  public once(listener: Listener<Args>) {
    const onceListener: Listener<Args, true> = (...args) => {
      listener(...args);
      return true;
    };

    return this.onoff(onceListener);
  }

  public emit(...args: Args) {
    const offCallbacks: any[] = [];

    for (const callback of this.callbacksSet) {
      if (callback(...args) === true) {
        offCallbacks.push(callback);
      }
    }

    for (const callback of offCallbacks) {
      this.callbacksSet.delete(callback);
    }

    return true;
  }
}
