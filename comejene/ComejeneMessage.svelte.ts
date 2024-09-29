export const ActionType = ["enter", "stay", "exit"] as const;
export type ActionType = typeof ActionType[number];

/**
 * コメジェネ内で使うメッセージの形式
 */
export interface IComejeneMessage {
  readonly iconUrl: string;
  readonly name: string;
  readonly content: string;
  readonly action: ActionType;

  /**
   * メッセージが生成された時刻
   */
  readonly time: number;
}

export class ComejeneMessage implements IComejeneMessage {
  public node = $state<HTMLDivElement>();
  public action = $state<ActionType>("enter");

  private intervalId: number | undefined;
  public time: number;

  constructor(
    public iconUrl: string,
    public name: string,
    public content: string,
  ) {
    this.setTimer(() => this.stay());
    this.time = Date.now();
  }

  public stay() {
    this.action = "stay";
  }

  public exit() {
    this.action = "exit";
  }

  private setTimer(fn: () => void) {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setTimeout(fn, 1e3);
  }
}
