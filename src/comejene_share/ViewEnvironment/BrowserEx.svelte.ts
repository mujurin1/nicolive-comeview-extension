import { AsyncIteratorSet } from "@mujurin/nicolive-api-ts";
import type { ComejeneEvent, ComejeneReceiver, ComejeneSender, ComejeneSenderOptionBase, ComejeneSenderState } from ".";

export interface WindowSenderOptions {
  wsUrl: string;
}

let iteratorSet: AsyncIteratorSet<ComejeneEvent> | undefined;
function send(message: ComejeneEvent) {
  iteratorSet?.enqueue(JSON.parse(JSON.stringify(message)));
}

export interface BrowserExSenderOption extends ComejeneSenderOptionBase<"browserEx"> { }

export class ComejeneSenderBrowser implements ComejeneSender<"browserEx"> {
  public readonly type = "browserEx";
  public state = $state<ComejeneSenderState>("close");
  public name = $state<string>("");
  public option = $state<BrowserExSenderOption>(null!);

  public get id() { return this.option.id; }

  public static createDefault(): BrowserExSenderOption {
    return {
      type: "browserEx",
      id: crypto.randomUUID(),
      name: "右側のプレビュー用 (編集不可)",
      url: null!,
    };
  }

  public constructor(option: BrowserExSenderOption) {
    this.option = option;
  }

  public connect() {
    this.state = "open";
    return Promise.resolve(true);
  }

  public send(message: ComejeneEvent, _lowPriority?: boolean) {
    if (this.state !== "open") return;
    send(message);
  }

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
