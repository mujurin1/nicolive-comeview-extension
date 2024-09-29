import type { ExtMessageType } from ".";
import { MessageStore } from "../store/MessageStore.svelte";

export interface ExtentionMessageOption {
  expandMessage?: string;
  button?: {
    text: string;
    func: (() => void);
  };
}
export type ExtentionMessage = ExtMessageType<"extention", "system"> & ExtentionMessageOption;

export const ExtMessenger = {
  add: (message: string, opsions?: ExtentionMessageOption) => {
    MessageStore.messages.push({
      ...opsions,

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
      tempName: "ｼｽﾃﾑ",
    });
  },
  addMessage: (message: string, expandMessage?: string) => {
    ExtMessenger.add(message, { expandMessage });
  },
} as const;
