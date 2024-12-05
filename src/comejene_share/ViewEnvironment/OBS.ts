import { AsyncIteratorSet } from "@mujurin/nicolive-api-ts";
import OBSWebSocket from "obs-websocket-js";
import type { ComejeneEnv, ComejeneEvent } from "./type";


export const OBS_EVENT_NAME = "niconama-comejene";

export interface OBSSenderOptions {
  wsUrl: string;
}

export const ComejeneEnv_OBS: ComejeneEnv<OBSSenderOptions> = {
  createReceiver: () => {
    const iteratorSet = AsyncIteratorSet.create<ComejeneEvent>({ breaked });

    window.addEventListener(OBS_EVENT_NAME, receive);

    return {
      iterator: iteratorSet.iterator,
      close: breaked,
    };

    function receive(event: any) {
      // MEMO: OBSJSON は適切な文字列化をしてくれないので
      //       JSON.stringify で文字列にした値が入っている
      iteratorSet.enqueue(JSON.parse(event.detail.jsonString));
    }

    function breaked() {
      window.removeEventListener(OBS_EVENT_NAME, receive);
    }
  },
  createSender: async ({ wsUrl }) => {
    const lowPrioritySender = timeFlowController<ComejeneEvent>(100, send);

    const obsWs = new OBSWebSocket();
    // TODO: 例外処理
    await obsWs.connect(wsUrl);

    return { send, reset, close };

    function send(event: ComejeneEvent, lowPriority = false) {
      if (lowPriority) {
        lowPrioritySender.do(event);
        return;
      }

      return obsWs.call(
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
    }

    function reset() {
      lowPrioritySender.reset();
    }

    function close() {
      return obsWs.disconnect();
    }
  }
};


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
