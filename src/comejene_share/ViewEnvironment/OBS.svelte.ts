import { AsyncIteratorSet } from "@mujurin/nicolive-api-ts";
import OBSWebSocket from "obs-websocket-js";
import type { ComejeneEvent, ComejeneReceiver, ComejeneSender, ComejeneSenderBase, ComejeneSenderState } from ".";


export const OBS_EVENT_NAME = "niconama-comejene";

export interface OBSSenderOptions extends ComejeneSenderBase { }

export class ComejeneSenderOBS implements ComejeneSender<"obs"> {
  private obsWs: OBSWebSocket | undefined;

  public readonly type = "obs";
  public state = $state<ComejeneSenderState>("close");
  public name = $state<string>("");
  public options = $state<OBSSenderOptions>({ url: "" });

  public constructor(public readonly id: number) { }

  public async connect() {
    if (!(this.state === "close" || this.state === "failed")) return true;
    this.state = "connecting";

    this.obsWs = new OBSWebSocket();
    try {
      await this.obsWs.connect(this.options.url);
      this.obsWs.once("ConnectionClosed", () => this.state = "close");
    } catch {
      this.state = "failed";
      return false;
    }

    this.state = "open";
    return true;
  }

  public send = (event: ComejeneEvent, lowPriority = false) => {
    if (this.state !== "open" || this.obsWs == null) return;

    if (lowPriority) {
      this.lowPrioritySender.do(event);
      return;
    }

    return this.obsWs.call(
      "CallVendorRequest",
      {
        requestType: "emit_event",
        vendorName: "obs-browser",
        requestData: {
          event_name: OBS_EVENT_NAME,
          // MEMO: OBSJSON は適切な文字列化をしてくれないので
          //       JSON.stringify で文字列にした値を入れておく
          event_data: { jsonString: JSON.stringify(event) },
        }
      }
    );
  };

  private readonly lowPrioritySender = timeFlowController<ComejeneEvent>(100, this.send);
  public resetSenderState() {
    this.lowPrioritySender.reset();
  }

  public close() {
    if (this.state !== "open" || this.obsWs == null) return Promise.resolve();
    this.state = "close";
    return this.obsWs.disconnect();
  }
}


export class ComejeneReceiverOBS implements ComejeneReceiver {
  public constructor() {
    window.addEventListener(OBS_EVENT_NAME, this.receive);
  }

  public receive = (event: any) => {
    // MEMO: OBSJSON は適切な文字列化をしてくれないので
    //       JSON.stringify で文字列にした値が入っている
    this.iteratorSet.enqueue(JSON.parse(event.detail.jsonString));
  };

  public close = () => {
    window.removeEventListener(OBS_EVENT_NAME, this.receive);
  };

  private readonly iteratorSet = AsyncIteratorSet.create<ComejeneEvent>({ breaked: this.close });
  public readonly iterator = this.iteratorSet.iterator;
}



function timeFlowController<T>(
  ms: number,
  fn: (value: T) => void,
) {
  let locked = false;
  let cached: T | undefined;
  let timerId: number;

  return {
    locked,
    do: (value: T) => {
      if (locked) {
        cached = value;
        return;
      }

      fn(value);
      lock();
    },
    reset: () => {
      clearTimeout(timerId);
    },
  };

  function lock() {
    locked = true;
    timerId = setTimeout(() => {
      locked = false;
      if (cached != null) fn(cached);
      cached = undefined;
    }, ms);
  }
}
