import type { MessageContent } from "../Message";
import type { MotionNames, MotionSetting } from "../Motion";
import type { ReceiveContents } from "../type";
import type { ComejeneEvent, ComejeneSender } from "./type";


export class ComejeneSender_Dbg {
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

  public sendReset(motionName: MotionNames, motionSetting: MotionSetting, messageContent: MessageContent) {
    this._sendMotionSettingController.reset();
    this._sendMessageContentController.reset();

    this.send({
      type: "comejene-reset",
      motionName,
      motionSetting,
      messageContent: messageContent,
    });
  }

  private readonly LOCK_TIME_MS = 100;
  private readonly _sendMotionSettingController = timeFlowController<MotionSetting>(
    this.LOCK_TIME_MS,
    motionSetting => this.send({ type: "change-motion-setting", motionSetting }),
  );
  private readonly _sendMessageContentController = timeFlowController<MessageContent>(
    this.LOCK_TIME_MS,
    messageContent => this.send({ type: "change-message-content", messageContent }),
  );

  public sendMotionSetting(motionSetting: MotionSetting) {
    this._sendMotionSettingController.do(motionSetting);
  }

  public sendMessageContent(messageContent: MessageContent) {
    this._sendMessageContentController.do(messageContent);
  }
}

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
