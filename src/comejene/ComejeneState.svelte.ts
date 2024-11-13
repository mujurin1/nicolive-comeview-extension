import { checkComejeneEnvType, comejeneEnvs, type ComejeneEnvTypes, type ComejeneReceiver, type MessageContent, type MotionNames, type MotionSetting, type MotionState } from "../comejene_share";
import { ComejeneViewState } from "./ComejeneViewState.svelte";

export class ComejeneState {
  public readonly env: ComejeneEnvTypes;
  private readonly receiver: ComejeneReceiver;

  private motionName: MotionNames | undefined;
  private motionSetting: MotionSetting | undefined;
  private messageContent: MessageContent | undefined;

  public viewState = $state<ComejeneViewState<MotionSetting, MotionState>>();

  public constructor() {
    this.env = checkComejeneEnvType();
    this.receiver = comejeneEnvs[this.env].createReceiver();

    void this.start();
  }

  /** MEMO:現在はどこからも呼び出していない */
  public close() {
    this.receiver.close();
  }

  private async start() {
    for await (const event of this.receiver.iterator) {
      if (event.type === "comejene-reset") {
        this.motionName = event.motionName;
        this.motionSetting = event.motionSetting;
        this.messageContent = event.messageContent;

        this.resetViewState();
      } else if (event.type === "change-motion-setting") {
        this.motionSetting = event.motionSetting;
        this.viewState?.setMotionSetting(this.motionSetting);
      } else if (event.type === "change-message-content") {
        this.messageContent = event.messageContent;
        this.viewState?.setMessageContent(this.messageContent);
      } else if (event.type === "content") {
        if (this.viewState == null) continue;

        this.viewState.addContents(event.contents);
      }
    }
  }

  private resetViewState() {
    if (
      this.motionName == null ||
      this.motionSetting == null ||
      this.messageContent == null
    ) return;

    this.viewState?.dispose();
    this.viewState = new ComejeneViewState(this.motionName, this.motionSetting, this.messageContent);
  }
}
