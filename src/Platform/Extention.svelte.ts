import type { ExtMessageType } from ".";
import { MessageStore } from "../store/MessageStore.svelte";


export type ExtentionMessage = ExtMessageType<"extention">;

class _ExtMessenger {
  public add(message: string) {
    MessageStore.messages.push({
      id: `extention#${MessageStore.messages.length + 1}`,
      platformId: "extention",
      messageId: (MessageStore.messages.length + 1) + "",
      kind: "system",
      liveId: "extention",


      content: message,
      iconUrl: undefined,
      // time: new Date().toLocaleTimeString("ja-JP"),
      time: undefined,

      link: undefined,
      includeSharp: false,
    });
  }
}

export const ExtMessenger = new _ExtMessenger();
