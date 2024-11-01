import { css } from "@emotion/css";
import type { CSSObject } from "@emotion/css/create-instance";
import { tick } from "svelte";
import type { ReceiveContents } from "../../type";
import { MotionSettingStyle, type AsMotionSetting, type MotionState } from "../Interface";
import { StackMotionMessage } from "./StackMotionMessage.svelte";


export type StackMotionSetting = AsMotionSetting<typeof StackMotionSettingStyle.definition>;
export const StackMotionSettingStyle = MotionSettingStyle.create(
  {
    /**
     * メッセージの並ぶ方向\
     * row:縦並び column:横並び
     */
    direction: ["row", "column"],

    /**
     * メッセージの順序(最新→古い)を標準(上/左が新しい)と逆にするか
     */
    reverseOrder: "boolean",
    /**
     * **TODO: 現在未対応**\
     * メッセージの詰める方向を標準(下/右に詰める)と逆にするか
     */
    reverseGap: "boolean",
    /**
     * **TODO: 現在未対応**\
     * 余白を標準(右/上)と逆にするか
     */
    reverseMargine: "boolean",
  } as const,

  setting => {
    const cssObj: CSSObject = {
      ".main-area": {
        overflow: "clip",
        width: "100%",
        height: "100%",
      },

      ".message-area": {
        position: "relative",
        display: "flex",
        flexDirection: `${setting.direction}${setting.reverseOrder ? "-reverse" : ""}`,
        // alignItems: "flex-start",
        // alignItems: "stretch",
        width: setting.direction === "column" ? "100%" : "max-content",
        height: "max-content",

        "&::-webkit-scrollbar": {
          display: "none",
        },

        // ".message-container": {
        //   width: "fit-content",
        // }
      },

      ".padding": {
        /* DEBUG: 確認用の強調色 */
        backgroundColor: "#f6b7b7",
      },
    };

    return css(cssObj);
  },
);


export class StackMotionState implements MotionState<
  StackMotionSetting,
  StackMotionMessage
> {
  private paddingSize: number = 0;

  public mainAreaDiv: HTMLDivElement = null!;
  public messageAreaDiv: HTMLDivElement = null!;
  public paddingDiv: HTMLDivElement = null!;

  public setting = $state<StackMotionSetting>(null!);
  public messages = $state<StackMotionMessage[]>([]);

  public constructor(
    setting: StackMotionSetting,
  ) {
    this.setting = setting;
  }

  public onMount() {
    const resizeObserver = new ResizeObserver(() => this.updateMessageAreaStyle());
    resizeObserver.observe(this.mainAreaDiv);
    void this.resetMotionLayout(this.setting);

    return () => {
      resizeObserver.disconnect();
    };
  }

  public async resetMotionLayout(setting: StackMotionSetting) {
    this.setting = setting;

    // Reset Element Padding
    this.paddingSize = 0;
    this.paddingDiv.style.removeProperty("width");
    this.paddingDiv.style.removeProperty("height");
    // Reset Element MessageArea
    // /** アニメーション再設定用に保持しておく */
    // const messageAreaTransform = this.messageAreaDiv.style.transition;
    this.messageAreaDiv.style.removeProperty("top");
    this.messageAreaDiv.style.removeProperty("left");
    this.messageAreaDiv.style.removeProperty("transform");
    // this.messageAreaDiv.style.removeProperty("width");
    // if (this.setting.direction === "row") {
    //   this.messageAreaDiv.style.width = "max-content";
    // }

    this.resetRemoveTimeLoop();

    await this.resetLayout();
  }

  public async resetLayout() {
    await tick();
    this.updateMessageAreaStyle();

    // アニメーションのCSSはこの中で設定 .await tick() をしているので多分中に入れなくても良い
    requestAnimationFrame(() => {
      // this.messageAreaDiv.style.transition = messageAreaTransform;
      // this.messageAreaDiv.style.transition = "transform 1s ease-out";
    });
  }

  public async addMessage(contents: ReceiveContents) {
    const message = new StackMotionMessage(contents);
    this.messages.push(message);
    // await tick するまでは message.node は生成されない
    await tick();

    // DEBUG: クリックで削除デバッグ
    message.node.onclick = () => this.exitMessage(message);

    // borderResizeObserver.observe(message.node!);
    this.updateMessageAreaStyle();
  }

  /**
   * メッセージを退場させる
   */
  private exitMessage(message: StackMotionMessage) {
    // TODO: 実際にはアニメーション時間分を待機する必要がある
    const index = this.messages.findIndex(m => m === message);
    if (index === -1) return;
    // 実際には削除されるまでラグがあるため正確な削除を行うためにindexで指定する
    this.destroyMessage(index);
  }

  private destroyMessage(index: number) {
    const message = this.messages.splice(index, 1)[0];
    // borderResizeObserver.unobserve(message.node!);
    const rect = message.node!.getBoundingClientRect();

    if (this.setting.direction === "column") {
      this.paddingSize += rect.height;
      this.paddingDiv.style.height = `${this.paddingSize}px`;
    } else {
      this.paddingSize += rect.width;
      this.paddingDiv.style.width = `${this.paddingSize}px`;
    }
  }

  /** 指定時間でコメントを削除するループ */
  private resetRemoveTimeLoop() {
    // none
  }

  private updateMessageAreaStyle() {
    if (this.setting.direction === "column") {
      if (this.setting.reverseOrder) {
        this.messageAreaDiv.style.top = `${-this.messageAreaDiv.clientHeight}px`;
        this.messageAreaDiv.style.transform = `translateY(${this.messageAreaDiv.clientHeight}px)`;
      } else {
        const scrollY = this.messageAreaDiv.clientHeight - this.mainAreaDiv.clientHeight;
        this.messageAreaDiv.style.transform = `translateY(${-scrollY}px)`;
      }
    } else {
      if (this.setting.reverseOrder) {
        this.messageAreaDiv.style.left = `${-this.messageAreaDiv.clientWidth}px`;
        this.messageAreaDiv.style.transform = `translateX(${this.messageAreaDiv.clientWidth}px)`;
      } else {
        const scrollX = this.messageAreaDiv.clientWidth - this.mainAreaDiv.clientWidth;
        this.messageAreaDiv.style.transform = `translateX(${-scrollX}px)`;
      }
    }
  }
}
