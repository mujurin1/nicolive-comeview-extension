import type { ComejeneFrameNames, ComejeneFrameSetting, ComejeneFrameState } from "../comejene_share/Frame";
import type { ComejeneStyle } from "../comejene_share/Message";
import { type ComejeneEnvTypes, type ComejeneReceiver, checkComejeneEnvType, comejeneEnvs } from "../comejene_share/ViewEnvironment";
import { ComejeneViewState } from "./ComejeneViewState.svelte";

/** TODO: 同名の interface が存在する */
export class ComejeneState {
  public readonly env: ComejeneEnvTypes;
  private readonly receiver: ComejeneReceiver;

  private frameName: ComejeneFrameNames | undefined;
  private frameSetting: ComejeneFrameSetting | undefined;
  private comejeneStyle: ComejeneStyle | undefined;

  public viewState = $state<ComejeneViewState<ComejeneFrameSetting, ComejeneFrameState>>();

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
        this.frameName = event.frameName;
        this.frameSetting = event.frameSetting;
        this.comejeneStyle = event.comejeneStyle;

        this.refresh();
      } else if (event.type === "reset-frame") {
        this.frameSetting = event.frameSetting;
        this.viewState?.setFrameSetting(this.frameSetting);
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
      this.frameName == null ||
      this.frameSetting == null ||
      this.comejeneStyle == null
    ) return;

    this.viewState?.dispose();
    this.viewState = new ComejeneViewState(this.frameName, this.frameSetting, this.comejeneStyle);
  }
}
