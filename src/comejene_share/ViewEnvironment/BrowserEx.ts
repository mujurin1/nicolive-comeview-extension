import { AsyncIteratorSet } from "@mujurin/nicolive-api-ts";
import type { ComejeneEnv, ComejeneEvent } from "./type";

export interface WindowSenderOptions {
  wsUrl: string;
}

let iteratorSet: AsyncIteratorSet<ComejeneEvent> | undefined;

/**
 * 拡張機能内 (デバッグ用)\
 * createReceiver は同時に１つ以上使ってはダメ
 */
export const ComejeneEnv_BrowserEx: ComejeneEnv<never> = {
  createReceiver: () => {
    iteratorSet = AsyncIteratorSet.create<ComejeneEvent>();
    return {
      iterator: iteratorSet.iterator,
      close: () => {
        iteratorSet = undefined;
      },
    };
  },
  createSender: () => {
    return Promise.resolve({
      send,
      close: () => { },
    });

    function send(message: ComejeneEvent) {
      iteratorSet?.enqueue(JSON.parse(JSON.stringify(message)));
    }
  },
};
