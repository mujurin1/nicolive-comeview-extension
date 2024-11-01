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
    const obsWs = new OBSWebSocket();
    await obsWs.connect(wsUrl);

    return {
      send,
      close,
    };

    function send(event: ComejeneEvent) {
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

    function close() {
      return obsWs.disconnect();
    }
  }
};
