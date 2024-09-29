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
  /**
   * @param content 表示する文字列
   * @param opsions ExtentionMessageOption
   * @returns `ExtentionMessage.id` (全メッセージ中で一意なID)
   */
  add: (content: string, opsions?: ExtentionMessageOption): string => {
    const message: ExtentionMessage = {
      ...opsions,

      id: `extention#${MessageStore.messages.length + 1}`,
      platformId: "extention",
      messageId: (MessageStore.messages.length + 1) + "",
      kind: "system",
      liveId: "extention",

      content,
      iconUrl: undefined,
      // time: new Date().toLocaleTimeString("ja-JP"),
      time: undefined,

      link: undefined,
      includeSharp: false,
      tempName: "ｼｽﾃﾑ",
    };
    MessageStore.add(message);

    return message.id;
  },
  /**
   * 
   * @param content 表示する文字列
   * @param expandMessage エキスパンドで表示する文字列
   * @returns `ExtentionMessage.id` (全メッセージ中で一意なID)
   */
  addMessage: (content: string, expandMessage?: string) =>
    ExtMessenger.add(content, { expandMessage }),
} as const;
