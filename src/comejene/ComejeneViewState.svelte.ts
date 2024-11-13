import { MessageContent, MotionDefinitions, type MotionComponent, type MotionDefinition, type MotionNames, type MotionSetting, type MotionState, type ReceiveContents } from "../comejene_share";
import { createCustomCss } from "../comejene_share/func";

export class ComejeneViewState<Setting extends MotionSetting, State extends MotionState> {
  private readonly _customCss = createCustomCss();

  public readonly motionDefinition: MotionDefinition<MotionNames>;

  public get Component(): MotionComponent<Setting, State> {
    return this.motionDefinition.component as unknown as MotionComponent<Setting, State>;
  }

  public component = $state<ReturnType<MotionComponent<Setting, State>>>(null!);
  private _motionSetting = $state<Setting>(null!);
  private _messageContent = $state<MessageContent>(null!);

  public get motionSetting() { return this._motionSetting; }
  public get messageContent() { return this._messageContent; }

  public constructor(
    motionName: MotionNames,
    motionSetting: Setting,
    messageContent: MessageContent,
  ) {
    this.motionDefinition = MotionDefinitions[motionName];
    this.setMotionSetting(motionSetting);
    this.setMessageContent(messageContent);
  }

  public dispose(): void {
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

  public setMessageContent(messageContent: MessageContent): void {
    this._messageContent = messageContent;

    MessageContent.updateCss(this._customCss, this._messageContent);
    if (this.component == null) return;
    void this.component.state.resetLayout();
  }
}
