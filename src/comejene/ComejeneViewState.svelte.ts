import { MessageStyle, MotionDefinitions, type MotionComponent, type MotionDefinition, type MotionNames, type MotionSetting, type MotionState, type ReceiveContents } from "../comejene_share";

export class ComejeneViewState<Setting extends MotionSetting, State extends MotionState> {
  public readonly motionDefinition: MotionDefinition<MotionNames>;

  public get Component(): MotionComponent<Setting, State> {
    return this.motionDefinition.component as unknown as MotionComponent<Setting, State>;
  }

  public component = $state<ReturnType<MotionComponent<Setting, State>>>(null!);
  private _motionSetting = $state<Setting>(null!);
  private _messageStyle = $state<MessageStyle>(null!);
  private _messageCssNames = $state<string>(null!);
  private _motionCssName = $state<string>(null!);

  public get motionSetting() { return this._motionSetting; }
  public get messageStyle() { return this._messageStyle; }
  public get messageCssNames() { return this._messageCssNames; }
  public get motionCssName() { return this._motionCssName; }

  public constructor(
    motionName: MotionNames,
    motionSetting: Setting,
    messageStyle: MessageStyle,
  ) {
    this.motionDefinition = MotionDefinitions[motionName];
    this.setMotionSetting(motionSetting);
    this.setMessageStyle(messageStyle);
  }

  public addContents(contents: ReceiveContents) {
    if (this.component == null) return;
    void this.component.state.addMessage(contents);
  }

  public setMotionSetting(motionSetting: Setting): void {
    this._motionSetting = motionSetting;
    this._motionCssName = this.motionDefinition.css.toCss(this._motionSetting as any);
    if (this.component == null) return;
    void this.component.state.resetMotionLayout(this._motionSetting);
  }

  public setMessageStyle(messageStyle: MessageStyle): void {
    this._messageStyle = messageStyle;
    this._messageCssNames = MessageStyle.toCss(this._messageStyle);
    if (this.component == null) return;
    void this.component.state.resetLayout();
  }
}
