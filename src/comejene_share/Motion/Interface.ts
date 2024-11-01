import type { ReceiveContents } from "../type";

export type MotionSetting = Record<string, string | number | boolean>;
export type MotionSettingDefinitionColumn = "string" | "number" | "boolean" | readonly string[];
export type MotionSettingDefinition = { readonly [K in string]: MotionSettingDefinitionColumn };

export type AsMotionSetting<T extends MotionSettingDefinition> = {
  -readonly [K in keyof T]:
  T[K] extends "string" ? string :
  T[K] extends "number" ? number :
  T[K] extends "boolean" ? boolean :
  T[K] extends readonly string[] ? T[K][number] : never;
};


export interface MotionSettingStyle<Definition extends MotionSettingDefinition> {
  definition: Definition & typeof MotionSettingDefinitionDefault,
  toCss: (setting: ExpandRecursively<AsMotionSetting<Definition & typeof MotionSettingDefinitionDefault>>) => string,
}

export const MotionSettingStyle = {
  create: <Definition extends MotionSettingDefinition>(
    definition: Definition,
    toCss: (setting: ExpandRecursively<AsMotionSetting<Definition>>) => string,
  ): MotionSettingStyle<Definition> => ({
    definition,
    toCss,
  })
} as const;

/** 全モーション共通で定義したい設定がある時に備えて */
export const MotionSettingDefinitionDefault = {
  // default: "boolean"
} as const satisfies MotionSettingDefinition;



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



/** 完全に展開された型を得るためのヘルパー型 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: O[K] }
  : never : T;
