import { my, type Ignore, type ZodDefinition, type ZodModel, type ZodRaw } from "../../function/MyZod";
import type { CustomCss } from "../func";
import type { ReceiveContents } from "../type";

export type MotionSettingDefinition<R extends ZodRaw = ZodRaw> = ZodDefinition<R & Default_Raw>;
export type MotionSettingModel<D extends MotionSettingDefinition = MotionSettingDefinition> = ZodModel<D>;

/** 全モーション共通で定義したい設定がある時に備えて */
const Default_Raw = {
  // d: my.boolean({})(),
} as const satisfies ZodRaw;
type Default_Raw = typeof Default_Raw;

export interface MotionSettingStyle<Definition extends MotionSettingDefinition> {
  definition: Definition,
  updateCss: (customCss: CustomCss, setting: MotionSettingModel<Definition>) => void,
}

export const MotionSettingStyle = {
  create: <Raw extends Ignore<ZodRaw, Default_Raw>>(
    myParams: Parameters<typeof my.object>[0],
    raw: Raw,
    updateCss: (customCss: CustomCss, setting: MotionSettingModel<MotionSettingDefinition<Raw>>) => void,
  ): MotionSettingStyle<MotionSettingDefinition<Raw>> => ({
    definition: my.object(myParams)({
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
