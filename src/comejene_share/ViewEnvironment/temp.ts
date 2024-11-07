import type { MessageStyle } from "../Message";
import type { MotionNames, MotionSetting } from "../Motion";
import type { ReceiveContents } from "../type";
import type { ComejeneEvent, ComejeneSender } from "./type";


export class ComejeneSender_Dbg {
  private _sendTimeLocker = false;

  public senders: ComejeneSender[] = [];

  public async initialize(...senderPromises: Promise<ComejeneSender>[]) {
    this.senders = await Promise.all(senderPromises);
  }

  public send(message: ComejeneEvent) {
    for (const sender of this.senders) {
      sender.send(message);
    }
  }

  public sendComment(contents: ReceiveContents) {
    this.send({
      type: "content",
      contents,
    });
  }

  public sendReset(motionName: MotionNames, motionSetting: MotionSetting, messageStyle: MessageStyle) {
    this.send({
      type: "comejene-reset",
      motionName,
      motionSetting,
      messageStyle,
    });
  }

  public sendMotionSetting(motionSetting: MotionSetting) {
    this.send({
      type: "change-motion-setting",
      motionSetting,
    });
  }

  public sendMessageStyle(messageStyle: MessageStyle) {
    this.send({
      type: "change-message-style",
      messageStyle,
    });
  }
}
