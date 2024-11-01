import { checkComejeneEnvType, comejeneEnvs, type ComejeneEnvTypes, type ComejeneReceiver, type MessageStyle, type MotionNames, type MotionSetting, type MotionState } from "../comejene_share";
import { ComejeneViewState } from "./ComejeneViewState.svelte";

export class ComejeneState {
  private readonly env: ComejeneEnvTypes;
  private readonly receiver: ComejeneReceiver;

  private motionName: MotionNames | undefined;
  private motionSetting: MotionSetting | undefined;
  private messageStyle: MessageStyle | undefined;

  public viewState = $state<ComejeneViewState<MotionSetting, MotionState>>();

  public constructor() {
    this.env = checkComejeneEnvType();
    this.receiver = comejeneEnvs[this.env].createReceiver();

    void this.start();
  }

  private async start() {
    for await (const event of this.receiver.iterator) {
      if (event.type === "comejene-reset") {
        this.motionName = event.motionName;
        this.motionSetting = event.motionSetting;
        this.messageStyle = event.messageStyle;

        this.resetViewState();
      } else if (event.type === "change-motion-setting") {
        this.motionSetting = event.motionSetting;
        this.setMotionSetting(this.motionSetting);
      } else if (event.type === "change-message-style") {
        this.messageStyle = event.messageStyle;
        this.setMessageStyle(this.messageStyle);
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
      this.messageStyle == null
    ) return;

    this.viewState = new ComejeneViewState(this.motionName, this.motionSetting, this.messageStyle);
  }

  private setMotionSetting(motionSetting: MotionSetting): void {
    this.viewState?.setMotionSetting(motionSetting);
  }
  private setMessageStyle(messageStyle: MessageStyle): void {
    this.viewState?.setMessageStyle(messageStyle);
  }
}
