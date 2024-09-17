
export interface DisplaySettingBase {
  /**
   * 表示するメッセージの最大数\
   * この数を超えたメッセージは退場アニメーションをして消える
   */
  maxMessages: number;
  /**
   * メッセージの最大表示秒数\
   * この時間を超えたメッセージは退場アニメーションをして消える\
   * `0`なら時間で退場しない
   */
  exitTimeSec: number;
  /**
   * 入場アニメーション
   */
  enterAnimation?: MessageAnimation;
  /**
   * 退場アニメーション
   */
  exitAnimation?: MessageAnimation;
}

export interface MessageAnimation {
  /**
   * アニメーションの再生時間 (ミリ秒)
   */
  ms: number;
}


export interface StackDisplaySetting extends DisplaySettingBase {
  /**
   * メッセージの並ぶ方向
   */
  direction: "row" | "column";
  /**
   * メッセージの順序(最新→古い)を標準(上/左が新しい)と逆にするか
   */
  reverseOrder: boolean;
  /**
   * メッセージの詰める方向を標準(下/右に詰める)と逆にするか\
   * **現在未対応**
   */
  reverseGap: boolean;
  /**
   * 余白を標準(右/上)と逆にするか
   */
  reverseMargine: boolean;
}

export const StackDisplaySetting = {
  createDefault: (): StackDisplaySetting => ({
    maxMessages: 50,
    exitTimeSec: 0,

    direction: "column",
    reverseOrder: false,
    reverseGap: false,
    reverseMargine: false,
  })
} as const;
