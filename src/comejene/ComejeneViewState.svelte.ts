import type { ComejeneContent } from "../comejene_share";
import {
  ComejeneFrameDefinitions,
  type ComejeneFrameComponent,
  type ComejeneFrameDefinition,
  type ComejeneFrameNames,
  type ComejeneFrameSetting,
  type ComejeneFrameState
} from "../comejene_share/Frame";
import { createCustomCss } from "../comejene_share/func";
import { ComejeneStyle } from "../comejene_share/Message";

export class ComejeneViewState<Setting extends ComejeneFrameSetting, State extends ComejeneFrameState> {
  private readonly _customCss = createCustomCss();

  public readonly frameDefinition: ComejeneFrameDefinition<ComejeneFrameNames>;

  public get Component(): ComejeneFrameComponent<Setting, State> {
    return this.frameDefinition.component as unknown as ComejeneFrameComponent<Setting, State>;
  }

  public component = $state<ReturnType<ComejeneFrameComponent<Setting, State>>>(null!);
  private _frameSetting = $state<Setting>(null!);
  private _comejeneStyle = $state<ComejeneStyle>(null!);

  public get frameSetting() { return this._frameSetting; }
  public get comejeneStyle() { return this._comejeneStyle; }

  public constructor(
    frameName: ComejeneFrameNames,
    frameSetting: Setting,
    comejeneStyle: ComejeneStyle,
  ) {
    this.frameDefinition = ComejeneFrameDefinitions[frameName];
    this.setFrameSetting(frameSetting);
    this.setComejeneStyle(comejeneStyle);
  }

  public dispose(): void {
    this._customCss.removeAll();
  }

  public addContents(content: ComejeneContent): void {
    if (this.component == null) return;
    void this.component.state.addMessage(content);
  }

  public setFrameSetting(frameSetting: Setting): void {
    this._frameSetting = frameSetting;
    this.frameDefinition.css.updateCss(this._customCss, this._frameSetting as any);
    if (this.component == null) return;
    void this.component.state.resetFrameLayout(this._frameSetting);
  }

  public setComejeneStyle(comejeneStyle: ComejeneStyle): void {
    this._comejeneStyle = comejeneStyle;

    ComejeneStyle.updateCss(this._customCss, this._comejeneStyle);
    if (this.component == null) return;
    void this.component.state.resetLayout();
  }
}
