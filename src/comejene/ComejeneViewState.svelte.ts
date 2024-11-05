import { MessageStyle, MotionDefinitions, type MotionComponent, type MotionDefinition, type MotionNames, type MotionSetting, type MotionState, type ReceiveContents } from "../comejene_share";
import { createCustomCss } from "../comejene_share/func";

export class ComejeneViewState<Setting extends MotionSetting, State extends MotionState> {
  private readonly _customCss = createCustomCss();

  public readonly motionDefinition: MotionDefinition<MotionNames>;

  public get Component(): MotionComponent<Setting, State> {
    return this.motionDefinition.component as unknown as MotionComponent<Setting, State>;
  }

  public component = $state<ReturnType<MotionComponent<Setting, State>>>(null!);
  private _motionSetting = $state<Setting>(null!);
  private _messageStyle = $state<MessageStyle>(null!);

  public get motionSetting() { return this._motionSetting; }
  public get messageStyle() { return this._messageStyle; }

  public constructor(
    motionName: MotionNames,
    motionSetting: Setting,
    messageStyle: MessageStyle,
  ) {
    this.motionDefinition = MotionDefinitions[motionName];
    this.setMotionSetting(motionSetting);
    this.setMessageStyle(messageStyle);
  }

  public reset(): void {
    this._customCss.removeAll();
  }

  public addContents(contents: ReceiveContents): void {
    if (this.component == null) return;
    void this.component.state.addMessage(contents);
  }

  public setMotionSetting(motionSetting: Setting): void {
    this._motionSetting = motionSetting;
    this.motionDefinition.css.updateCss(this._customCss, this._motionSetting as any);
    if (this.component == null) return;
    void this.component.state.resetMotionLayout(this._motionSetting);
  }

  public setMessageStyle(messageStyle: MessageStyle): void {
    this._messageStyle = messageStyle;
    MessageStyle.updateCss(this._customCss, this._messageStyle);
    if (this.component == null) return;
    void this.component.state.resetLayout();
  }
}
