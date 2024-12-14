import { AsyncIteratorSet } from "@mujurin/nicolive-api-ts";
import type { ComejeneEvent, ComejeneReceiver, ComejeneSender, ComejeneSenderState } from ".";

export interface WindowSenderOptions {
  wsUrl: string;
}

let iteratorSet: AsyncIteratorSet<ComejeneEvent> | undefined;
function send(message: ComejeneEvent) {
  iteratorSet?.enqueue(JSON.parse(JSON.stringify(message)));
}

export class ComejeneSenderBrowser implements ComejeneSender<"browserEx"> {
  public readonly type = "browserEx";
  public state = $state<ComejeneSenderState>("close");
  public name = $state<string>("");
  public options = null!;

  public constructor(public readonly id: number) { }

  public connect() {
    this.state = "open";
    return Promise.resolve(true);
  }
  public readonly send = send;
  public resetSenderState() { }
  public close() {
    this.state = "close";
    return Promise.resolve();
  }
}

/**
 * `ComejeneReceiverBrowser` は同時使用は１つのみ
 */
export class ComejeneReceiverBrowser implements ComejeneReceiver {
  public readonly iterator;

  public constructor() {
    iteratorSet?.close();
    iteratorSet = AsyncIteratorSet.create();
    this.iterator = iteratorSet.iterator;
  }

  public close() {
    iteratorSet?.close();
    iteratorSet = undefined;
  }
}
