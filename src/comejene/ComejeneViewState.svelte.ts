import { type ComejeneContent, type ComejeneMotionComponent, type ComejeneMotionDefinition, ComejeneMotionDefinitions, type ComejeneMotionNames, type ComejeneMotionSetting, type ComejeneMotionState, ComejeneStyle } from "../comejene_share";
import { createCustomCss } from "../comejene_share/func";

export class ComejeneViewState<Setting extends ComejeneMotionSetting, State extends ComejeneMotionState> {
  private readonly _customCss = createCustomCss();

  public readonly motionDefinition: ComejeneMotionDefinition<ComejeneMotionNames>;

  public get Component(): ComejeneMotionComponent<Setting, State> {
    return this.motionDefinition.component as unknown as ComejeneMotionComponent<Setting, State>;
  }

  public component = $state<ReturnType<ComejeneMotionComponent<Setting, State>>>(null!);
  private _motionSetting = $state<Setting>(null!);
  private _comejeneStyle = $state<ComejeneStyle>(null!);

  public get motionSetting() { return this._motionSetting; }
  public get comejeneStyle() { return this._comejeneStyle; }

  public constructor(
    motionName: ComejeneMotionNames,
    motionSetting: Setting,
    comejeneStyle: ComejeneStyle,
  ) {
    this.motionDefinition = ComejeneMotionDefinitions[motionName];
    this.setMotionSetting(motionSetting);
    this.setComejeneStyle(comejeneStyle);
  }

  public dispose(): void {
    this._customCss.removeAll();
  }

  public addContents(content: ComejeneContent): void {
    if (this.component == null) return;
    void this.component.state.addMessage(content);
  }

  public setMotionSetting(motionSetting: Setting): void {
    this._motionSetting = motionSetting;
    this.motionDefinition.css.updateCss(this._customCss, this._motionSetting as any);
    if (this.component == null) return;
    void this.component.state.resetMotionLayout(this._motionSetting);
  }

  public setComejeneStyle(comejeneStyle: ComejeneStyle): void {
    this._comejeneStyle = comejeneStyle;

    ComejeneStyle.updateCss(this._customCss, this._comejeneStyle);
    if (this.component == null) return;
    void this.component.state.resetLayout();
  }
}
