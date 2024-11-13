import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz/index.svelte";
import type { CustomCss } from "../func";
import type { ReceiveContents } from "../type";

export type MotionSettingRoot<R extends MyzObjects = MyzObjects> = MyzRoot<R & Default_Objects>;
export type MotionSetting<D extends MotionSettingRoot = MotionSettingRoot> = MyzState<D>;

/** 全モーション共通で定義したい設定がある時に備えて */
const Default_Objects = {
  // d: myz.block("", {
  //   a: myz.boolean(""),
  // }),
} as const satisfies MyzObjects;
type Default_Objects = typeof Default_Objects;

export interface MotionSettingStyle<Root extends MotionSettingRoot> {
  root: Root,
  updateCss: (customCss: CustomCss, setting: MotionSetting<Root>) => void,
}

export const MotionSettingStyle = {
  create: <Objects extends Ignore<MyzObjects, Default_Objects>>(
    objects: Objects,
    updateCss: (customCss: CustomCss, setting: MotionSetting<MotionSettingRoot<Objects>>) => void,
  ): MotionSettingStyle<MotionSettingRoot<Objects>> => ({
    root: myz.root({
      ...Default_Objects,
      ...objects,
    }),
    updateCss,
  })
} as const;


/**
 * コメジェネ内で生成して利用するメッセージ
 */
export interface MotionMessage {
  node: HTMLDivElement;
  readonly contents: ReceiveContents;
}

/**
 * モーションの状態
 */
export interface MotionState<
  Setting extends MotionSetting = MotionSetting,
  Message extends MotionMessage = MotionMessage,
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
   * @param contents 受信したコンテンツ
   */
  addMessage(contents: ReceiveContents): Promise<void>;
}
