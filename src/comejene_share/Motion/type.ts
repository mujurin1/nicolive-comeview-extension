import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import type { ComejeneContent } from "../type";

export type ComejeneMotionSettingRoot<R extends MyzObjects = MyzObjects> = MyzRoot<R & ComejeneMotionDefaultBase>;
export type ComejeneMotionSetting<D extends ComejeneMotionSettingRoot = ComejeneMotionSettingRoot> = MyzState<D>;

/** 全モーション共通で定義したい設定がある時に備えて */
const ComejeneMotionDefaultBase = {
  // d: myz.block("", {
  //   a: myz.boolean(""),
  // }),
} as const satisfies MyzObjects;
type ComejeneMotionDefaultBase = typeof ComejeneMotionDefaultBase;

interface ComejeneMotionStyle<Root extends ComejeneMotionSettingRoot> {
  root: Root,
  updateCss: (customCss: CustomCss, setting: ComejeneMotionSetting<Root>) => void,
}

export const ComejeneMotionStyle = {
  create: <Objects extends Ignore<MyzObjects, ComejeneMotionDefaultBase>>(
    objects: Objects,
    updateCss: (customCss: CustomCss, setting: ComejeneMotionSetting<ComejeneMotionSettingRoot<Objects>>) => void,
  ): ComejeneMotionStyle<ComejeneMotionSettingRoot<Objects>> => ({
    root: myz.root({
      ...ComejeneMotionDefaultBase,
      ...objects,
    }),
    updateCss,
  })
} as const;


/**
 * コメジェネ内で生成して利用するメッセージ
 */
export interface ComejeneMotionMessage {
  node: HTMLDivElement;
  readonly content: ComejeneContent;
}

/**
 * モーションの状態
 */
export interface ComejeneMotionState<
  Setting extends ComejeneMotionSetting = ComejeneMotionSetting,
  Message extends ComejeneMotionMessage = ComejeneMotionMessage,
> {
  readonly setting: Setting;
  readonly messages: Message[];

  /**
   * `mount`時に呼び出す関数
   * @returns `unmount` 時に呼び出す関数
   */
  onMount(): () => void;

  /**
   * モーションのCSS/レイアウトを変更した場合に呼びだす必要がある
   */
  resetMotionLayout(setting: Setting): Promise<void>;

  /**
   * コメジェネのCSS/レイアウトに変更があるような操作をした場合に呼び出す必要がある\
   * `resetMotionLayout`を呼び出した場合は内部で呼び出される
   */
  resetLayout(): Promise<void>;

  /**
   * メッセージを追加する
   * @param content 受信したコンテンツ
   */
  addMessage(content: ComejeneContent): Promise<void>;
}
