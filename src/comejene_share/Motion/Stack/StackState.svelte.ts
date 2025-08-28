import { keyframes } from "@emotion/css";
import type { CSSObject } from "@emotion/css/create-instance";
import { tick } from "svelte";
import { myz } from "../../../lib/Myz";
import type { ComejeneContent } from "../../Message/ContentType";
import { ComejeneMotionStyle, type ComejeneMotionSetting, type ComejeneMotionState } from "../type";
import { StackMessage } from "./StackMessage.svelte";

const animationTypes = ["なし", "左から", "右から", "上から", "下から"] as const;
type AnimationType = typeof animationTypes[number];

const AnimationTypeToCss = {
  "なし": undefined,
  "左から": {
    from: { transform: "translateX(-100%)", },
    to: { transform: "translateX(0)", },
  },
  "右から": {
    from: { transform: "translateX(100%)", },
    to: { transform: "translateX(0)", },
  },
  "上から": {
    from: { transform: "translateY(-100%)", },
    to: { transform: "translateY(0)", },
  },
  "下から": {
    from: { transform: "translateY(100%)", },
    to: { transform: "translateY(0)", },
  },
} as const satisfies Record<AnimationType, { from: CSSObject, to: CSSObject; } | undefined>;

export type StackMotionSetting = ComejeneMotionSetting<typeof StackMotionStyle.root>;
export const StackMotionStyle = ComejeneMotionStyle.create(
  {
    /**
     * 縦並び(flex-direction:column)にするか
     */
    isVertical: myz.boolean("縦並び"),
    /**
     * flex の垂直方向の広がり方
     */
    verticalGrow: myz.list(
      {
        display: "垂直方向",
        desc: "並ぶ向きの垂直方向の広がり方を選択します",
      },
      ["左/上寄せ", "右/下寄せ", "いっぱいに広げる"],
    ),

    /**
     * メッセージの順序(最新→古い)を標準(上/左が新しい)と逆にするか
     */
    reverseOrder: myz.boolean({
      display: "逆並び",
      desc: "メッセージの並びを上/左が新しくします"
    }),

    maxWidth: myz.number({
      display: "横幅の最大値",
      desc: "０にすると「縦並び」「垂直に伸ばす」に基づいて調整されます",
      control: "number",
      min: 0,
      step: 10,
    }),

    /**
     * コメントの並ぶ間隔
     */
    gap: myz.number("コメント間隔"),

    animation: myz.switch<{
      enabled: boolean;
      newAnime: AnimationType;
      newTime: number;
    }>({
      display: "アニメーション",
      desc: "説明",
      updateWithChangeKey: true,
    })
      .addBlock(
        "無効",
        {},
        state => state,
        state => ({ ...state, enabled: false }),
      )
      .addBlock(
        "有効",
        {
          newAnime: myz.list(
            { display: "表示時", desc: "コメントが表示されるアニメーション" },
            animationTypes
          ),
          newTime: myz.number({
            display: "表示時間",
            desc: "コメントが表示されるアニメーションの時間 (ms)",
            max: 1000,
          }),
        },
        state => state,
        state => ({ ...state, enabled: true }),
      )
      .build(state => state.enabled ? "有効" : "無効"),
  } as const,

  (customCss, setting) => {
    const direction = setting.isVertical ? "column" : "row";
    const alignItems = {
      "左/上寄せ": "flex-start",
      "右/下寄せ": "flex-end",
      "いっぱいに広げる": "stretch",
    }[setting.verticalGrow];

    const baseCss: CSSObject = {
      ".message-area": {
        position: "relative",
        display: "flex",
        alignItems,
        flexDirection: `${direction}${setting.reverseOrder ? "-reverse" : ""}`,
        gap: `${setting.gap}px`,
        width: setting.isVertical ? "100%" : "max-content",
        height: setting.isVertical ? "max-content" : "100%",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      },

      ".message-container": {
        maxWidth: setting.maxWidth <= 0 ? undefined : `${setting.maxWidth}px`,
        width: setting.isVertical && setting.verticalGrow ? undefined : "fit-content",
      },

      ".padding": {
        /* TODO: DEBUG: 確認用の強調色 */
        backgroundColor: "#f6b7b7",
      },
    };

    const animationCss: CSSObject = !setting.animation.enabled ? {} : {
      ".message-area": {
        // willChange: "transform",
        // transition: "transform 0.3s ease",
        transitionDuration: `${setting.animation.newTime}ms`,
        // animation: "enter-message 0.3s ease-out",
      },

      ".message-container": {
        animationName: keyframes(AnimationTypeToCss[setting.animation.newAnime]),
        transitionDuration: `${setting.animation.newTime}ms`,
        // animation: "enter-message 0.3s ease-out",
      },

      // "@keyframes enter-message": keyframes(AnimationTypeToCss[setting.animation.newAnime]),
      // "@keyframes enter-message": {
      //   from: {
      //     transform: "translateY(100%)",
      //   },
      //   to: {
      //     transform: "translateY(0)",
      //   },
      // },
    };

    customCss.updateCss("StackMotionStyle", [baseCss, animationCss]);
  },
);


export class StackMotionState implements ComejeneMotionState<
  StackMotionSetting,
  StackMessage
> {
  private paddingSize: number = 0;

  public comejeneContainerDiv: HTMLDivElement = null!;
  public messageAreaDiv: HTMLDivElement = null!;
  public paddingDiv: HTMLDivElement = null!;

  public setting = $state<StackMotionSetting>(null!);
  public messages = $state<StackMessage[]>([]);

  public constructor(
    setting: StackMotionSetting,
  ) {
    this.setting = setting;
  }

  public onMount() {
    const resizeObserver = new ResizeObserver(() => this.updateMessageAreaStyle());
    resizeObserver.observe(this.comejeneContainerDiv);
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
    // if (!this.setting.isVertical) {
    //   this.messageAreaDiv.style.width = "max-content";
    // }

    this.resetRemoveTimeLoop();

    await this.resetLayout();
  }

  public async resetLayout() {
    await tick();
    this.updateMessageAreaStyle();

    // アニメーションのCSSはこの中で設定 .await tick() をしているので多分中に入れなくても良い
    // requestAnimationFrame(() => {
    //   // this.messageAreaDiv.style.transition = messageAreaTransform;
    //   // this.messageAreaDiv.style.transition = "transform 1s ease-out";
    // });
  }

  public async addMessage(content: ComejeneContent) {
    const message = new StackMessage(content);
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
  private exitMessage(message: StackMessage) {
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

    if (this.setting.isVertical) {
      this.paddingSize += rect.height + this.setting.gap;
      this.paddingDiv.style.height = `${this.paddingSize}px`;
    } else {
      this.paddingSize += rect.width + this.setting.gap;
      this.paddingDiv.style.width = `${this.paddingSize}px`;
    }
  }

  /** 指定時間でコメントを削除するループ */
  private resetRemoveTimeLoop() {
    // none
  }

  private updateMessageAreaStyle() {
    if (this.setting.isVertical) {
      if (this.setting.reverseOrder) {
        this.messageAreaDiv.style.top = `${-this.messageAreaDiv.clientHeight}px`;
        this.messageAreaDiv.style.transform = `translateY(${this.messageAreaDiv.clientHeight}px)`;
      } else {
        const scrollY = this.messageAreaDiv.clientHeight - this.comejeneContainerDiv.clientHeight;
        this.messageAreaDiv.style.transform = `translateY(${-scrollY}px)`;
      }
    } else {
      if (this.setting.reverseOrder) {
        this.messageAreaDiv.style.left = `${-this.messageAreaDiv.clientWidth}px`;
        this.messageAreaDiv.style.transform = `translateX(${this.messageAreaDiv.clientWidth}px)`;
      } else {
        const scrollX = this.messageAreaDiv.clientWidth - this.comejeneContainerDiv.clientWidth;
        this.messageAreaDiv.style.transform = `translateX(${-scrollX}px)`;
      }
    }
  }
}
