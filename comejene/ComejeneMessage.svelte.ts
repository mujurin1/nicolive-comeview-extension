
export const ActionType = ["enter", "stay", "exit"] as const;
export type ActionType = typeof ActionType[number];

/**
 * コメジェネ内で使うメッセージの形式
 */
export interface ComejeneMessage {
  iconUrl: string;
  name: string;
  content: string;
  action: ActionType;

  /**
   * メッセージが生成された時刻
   */
  time: number;
}

export class ComejeneMessage implements ComejeneMessage {
  public node = $state<HTMLDivElement>();
  public action = $state<ActionType>("enter");

  private intervalId: number | undefined;

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
