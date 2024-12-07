import type { ExtMessageType } from ".";
import { NceMessageStore } from "../store/NceStore.svelte";

export type ExtentionMessage = ExtMessageType<"extention", "system"> & ExtentionMessageOption;
interface ExtentionMessageOption {
  expandMessage?: string;
  input?: {
    type: "text" | "number";
    /** この値はsvelteの更新ルールに則った値にする事 */
    value: string;
  };
  button?: {
    text: string;
    /** 自分の状態を引数に受け取る関数 */
    func: ((message: ExtentionMessage) => void);
  };
}

export const ExtMessenger = {
  /**
   * @param content 表示する文字列
   * @param opsions ExtentionMessageOption
   * @returns `ExtentionMessage.id` (全メッセージ中で一意なID)
   */
  add: (content: string, opsions?: ExtentionMessageOption): string => {
    const message: ExtentionMessage = {
      ...opsions,

      id: `extention#${NceMessageStore.messages.length + 1}`,
      platformId: "extention",
      messageId: (NceMessageStore.messages.length + 1) + "",
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
    NceMessageStore.add(message);

    return message.id;
  },
  /**
   * @param content 表示する文字列
   * @param expandMessage エキスパンドで表示する文字列
   * @returns `ExtentionMessage.id` (全メッセージ中で一意なID)
   */
  addMessage: (content: string, expandMessage?: string) =>
    ExtMessenger.add(content, { expandMessage }),
} as const;
