import type { ExtMessageType, ExtUserType } from ".";
import { MessageStore } from "../store/MessageStore.svelte";

export interface ExtentionUser extends ExtUserType<"extention"> {
}

export interface ExtentionMessage extends ExtMessageType<"extention"> {
}

export const ExtentionUser = {
  platformId: "extention",
  storageUser: {
    id: "extention-user",
  },
} as const satisfies ExtentionUser;

class _ExtMessenger {
  public add(message: string) {
    MessageStore.messages.push({
      id: `extention#${MessageStore.messages.length + 1}`,
      platformId: "extention",
      messageId: (MessageStore.messages.length + 1) + "",
      kind: "system",
      liveId: "extention",
      extUser: ExtentionUser,
      content: message,
      iconUrl: undefined,
      // time: new Date().toLocaleTimeString("ja-JP"),
      time: "",

      link: undefined,
      includeSharp: false,
    });
  }
}

export const ExtMessenger = new _ExtMessenger();
