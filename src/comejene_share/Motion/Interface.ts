import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import type { ReceiveContents } from "../type";

export type MotionSettingDefinition<R extends MyzObjects = MyzObjects> = MyzRoot<R & Default_Raw>;
export type MotionSettingModel<D extends MotionSettingDefinition = MotionSettingDefinition> = MyzState<D>;

/** 全モーション共通で定義したい設定がある時に備えて */
const Default_Raw = {
  // d: myz.block("", {
  //   a: myz.boolean(""),
  // }),
} as const satisfies MyzObjects;
type Default_Raw = typeof Default_Raw;

export interface MotionSettingStyle<Definition extends MotionSettingDefinition> {
  definition: Definition,
  updateCss: (customCss: CustomCss, setting: MotionSettingModel<Definition>) => void,
}

export const MotionSettingStyle = {
  create: <Raw extends Ignore<MyzObjects, Default_Raw>>(
    raw: Raw,
    updateCss: (customCss: CustomCss, setting: MotionSettingModel<MotionSettingDefinition<Raw>>) => void,
  ): MotionSettingStyle<MotionSettingDefinition<Raw>> => ({
    definition: myz.root({
      ...Default_Raw,
      ...raw,
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
  Setting extends MotionSettingModel = MotionSettingModel,
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
