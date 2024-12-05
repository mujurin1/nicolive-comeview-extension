export * from "./OBS";
export * from "./type";


import type { MessageContent } from "../Message";
import type { MotionNames, MotionSetting } from "../Motion";
import type { ReceiveContents } from "../type";
import { ComejeneEnv_BrowserEx } from "./BrowserEx";
import { ComejeneEnv_OBS } from "./OBS";
import type { ComejeneEvent, ComejeneSender } from "./type";


export type ComejeneEnvTypes = keyof typeof comejeneEnvs;
export const comejeneEnvs = {
  obs: ComejeneEnv_OBS,
  browserEx: ComejeneEnv_BrowserEx,
} as const;

/**
 * 現在の実行環境をチェックする
 * @returns 
 */
export function checkComejeneEnvType(): ComejeneEnvTypes {
  if ("obsstudio" in window) return "obs";
  // TODO: N Air の場合
  return "browserEx";
}


export class ComejeneSenderController {
  public senders: ComejeneSender[] = [];

  public async initialize(...senderPromises: Promise<ComejeneSender>[]) {
    this.senders = await Promise.all(senderPromises);
  }

  public add(sender: ComejeneSender): void {
    this.senders.push(sender);
  }

  public remove(): boolean {
    return true;
  }


  public send(message: ComejeneEvent, lowPriority = false) {
    for (const sender of this.senders) {
      sender.send(message, lowPriority);
    }
  }

  public sendComment(contents: ReceiveContents) {
    this.send({
      type: "content",
      contents,
    });
  }

  public sendReset(motionName: MotionNames, motionSetting: MotionSetting, messageContent: MessageContent) {
    for (const sender of this.senders) {
      sender.reset();
    }

    this.send({
      type: "comejene-reset",
      motionName,
      motionSetting,
      messageContent: messageContent,
    });
  }

  public sendMotionSetting(motionSetting: MotionSetting) {
    this.send({ type: "change-motion-setting", motionSetting }, true);
  }

  public sendMessageContent(messageContent: MessageContent) {
    this.send({ type: "change-message-content", messageContent }, true);
  }
}
