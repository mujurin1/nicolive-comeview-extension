import type { ComejeneStyle } from "../comejene_share/Message";
import type { ComejeneMotionNames, ComejeneMotionSetting, ComejeneMotionState } from "../comejene_share/Motion";
import { type ComejeneEnvTypes, type ComejeneReceiver, checkComejeneEnvType, comejeneEnvs } from "../comejene_share/ViewEnvironment";
import { ComejeneViewState } from "./ComejeneViewState.svelte";

/** TODO: 同名の interface が存在する */
export class ComejeneState {
  public readonly env: ComejeneEnvTypes;
  private readonly receiver: ComejeneReceiver;

  private motionName: ComejeneMotionNames | undefined;
  private motionSetting: ComejeneMotionSetting | undefined;
  private comejeneStyle: ComejeneStyle | undefined;

  public viewState = $state<ComejeneViewState<ComejeneMotionSetting, ComejeneMotionState>>();

  public constructor() {
    this.env = checkComejeneEnvType();
    this.receiver = new comejeneEnvs[this.env].receiver();

    void this.start();
  }

  /** MEMO:現在はどこからも呼び出していない */
  public close() {
    this.receiver.close();
  }

  private async start() {
    for await (const event of this.receiver.iterator) {
      if (event.type === "reset-all") {
        this.motionName = event.motionName;
        this.motionSetting = event.motionSetting;
        this.comejeneStyle = event.comejeneStyle;

        this.refresh();
      } else if (event.type === "reset-motion") {
        this.motionSetting = event.motionSetting;
        this.viewState?.setMotionSetting(this.motionSetting);
      } else if (event.type === "reset-style") {
        this.comejeneStyle = event.comejeneStyle;
        this.viewState?.setComejeneStyle(this.comejeneStyle);
      } else if (event.type === "content") {
        if (this.viewState == null) continue;

        this.viewState.addContents(event.content);
      }
    }
  }

  /**
   * すべての状態を削除して初期化する
   */
  private refresh() {
    if (
      this.motionName == null ||
      this.motionSetting == null ||
      this.comejeneStyle == null
    ) return;

    this.viewState?.dispose();
    this.viewState = new ComejeneViewState(this.motionName, this.motionSetting, this.comejeneStyle);
  }
}
