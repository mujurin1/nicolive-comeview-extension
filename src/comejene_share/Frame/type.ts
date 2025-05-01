import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import type { ComejeneContent } from "../type";

export type ComejeneFrameSettingRoot<R extends MyzObjects = MyzObjects> = MyzRoot<R & ComejenFrameDefaultBase>;
export type ComejeneFrameSetting<D extends ComejeneFrameSettingRoot = ComejeneFrameSettingRoot> = MyzState<D>;

/** 全フレーム共通で定義したい設定がある時に備えて */
const ComejeneFrameDefaultBase = {
  // d: myz.block("", {
  //   a: myz.boolean(""),
  // }),
} as const satisfies MyzObjects;
type ComejenFrameDefaultBase = typeof ComejeneFrameDefaultBase;

interface ComejeneFrameStyle<Root extends ComejeneFrameSettingRoot> {
  root: Root,
  updateCss: (customCss: CustomCss, setting: ComejeneFrameSetting<Root>) => void,
}

export const ComejeneFrameStyle = {
  create: <Objects extends Ignore<MyzObjects, ComejenFrameDefaultBase>>(
    objects: Objects,
    updateCss: (customCss: CustomCss, setting: ComejeneFrameSetting<ComejeneFrameSettingRoot<Objects>>) => void,
  ): ComejeneFrameStyle<ComejeneFrameSettingRoot<Objects>> => ({
    root: myz.root({
      ...ComejeneFrameDefaultBase,
      ...objects,
    }),
    updateCss,
  })
} as const;


/**
 * コメジェネ内で生成して利用するメッセージ
 */
export interface ComejeneFrameMessage {
  node: HTMLDivElement;
  readonly content: ComejeneContent;
}

/**
 * フレームの状態
 */
export interface ComejeneFrameState<
  Setting extends ComejeneFrameSetting = ComejeneFrameSetting,
  Message extends ComejeneFrameMessage = ComejeneFrameMessage,
> {
  readonly setting: Setting;
  readonly messages: Message[];

  /**
   * `mount`時に呼び出す関数
   * @returns `unmount` 時に呼び出す関数
   */
  onMount(): () => void;

  /**
   * フレームのCSS/レイアウトを変更した場合に呼びだす必要がある
   */
  resetFrameLayout(setting: Setting): Promise<void>;

  /**
   * コメジェネのCSS/レイアウトに変更があるような操作をした場合に呼び出す必要がある\
   * `resetFrameLayout`を呼び出した場合は内部で呼び出される
   */
  resetLayout(): Promise<void>;

  /**
   * メッセージを追加する
   * @param content 受信したコンテンツ
   */
  addMessage(content: ComejeneContent): Promise<void>;
}
