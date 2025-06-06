import type { ColorPickerValue } from "../../components/ColorPicker.svelte";

interface MyzBase<TYPE extends MyzObjectType = MyzObjectType> {
  type: TYPE;
  /** 表示名 */
  display: string;
  /** 表示グループ */
  group?: string;
}

export type MyzState<BLOCK extends { block: MyzObjects; } = MyzBlock> = {
  -readonly [K in keyof BLOCK["block"]]: BLOCK["block"][K] extends (infer T) ?
  T extends MyzBlock ? MyzState<T>
  : T extends MyzSwitch<infer S, any> ? S
  : T extends MyzValue ? MyzStateExtra<T> : never : never;
};
type MyzStateExtra<T extends MyzValue> =
  true extends T["extra"][MyzOptional]
  ? MyzValueState<T> | undefined
  : MyzValueState<T>;

type MyzValueState<T extends MyzValue> =
  T extends MyzSwitch<infer S, any> ? S
  : T extends MyzString ? string
  : T extends MyzNumber ? number
  : T extends MyzBoolean ? boolean
  : T extends MyzList ? T["choices"][number]
  : T extends MyzColor ? ColorPickerValue
  : never;

export interface MyzRoot<BLOCK extends MyzObjects = MyzObjects> { block: BLOCK; }

export type MyzObjectType<TYPE extends MyzRooterType | MyzValueType = MyzRooterType | MyzValueType> = TYPE;
export type MyzObject<Type extends MyzRooter | MyzValue = MyzRooter | MyzValue> = Type;
export type MyzObjects = Record<string, MyzObject>;

export type MyzRooter<TYPE extends MyzRooterType = MyzRooterType> = (MyzBlock | MyzSwitch) & { type: TYPE; };
// export type MyzRooter<TYPE extends MyzBlock | MyzSwitch = MyzBlock | MyzSwitch> = TYPE;
export type MyzRooterType = "block" | "switch";

export type MyzValue<TYPE extends MyzValueType = MyzValueType> = (MyzString | MyzNumber | MyzBoolean | MyzList | MyzColor) & { type: TYPE; };
// export type MyzValue<TYPE extends MyzString | MyzNumber | MyzBoolean | MyzList | MyzColor = MyzString | MyzNumber | MyzBoolean | MyzList | MyzColor> = TYPE;
export type MyzValueType = "string" | "number" | "boolean" | "list" | "color";
export interface MyzValueable<
  TYPE extends MyzValueType = MyzValueType,
  EXTRA extends MyzExtraTypes = never,
> extends MyzBase<TYPE> {
  desc?: string;
  extra: MyzExtraRecord<EXTRA>;
}


//#region
//#region MyzRooter
export interface MyzBlock<BLOCK extends MyzObjects = MyzObjects> extends MyzBase<"block"> {
  block: BLOCK;
  defaultOpen?: boolean;
}

export interface MyzSwitch<
  STATE extends MyzState = MyzState,
  BLOCKS extends Record<string, MyzSwitchBlock<STATE>> = Record<string, MyzSwitchBlock<STATE>>,
> extends MyzBase<"switch"> {
  blocks: BLOCKS;
  // MEMO: ここが unknown な理由は少し下のダウンキャストの説明と同じ
  // selectKey: (value: STATE) => keyof BLOCKS;
  selectKey: (status: unknown) => keyof BLOCKS;
  /** 項目を変更したら状態を更新するか */
  updateWithChangeKey?: boolean;
}
//#region SWITCH
interface MyzSwitchBlock<
  STATE extends MyzState = MyzState,
  KEY extends string = string,
  BLOCK extends MyzObjects = MyzObjects,
> {
  key: KEY;
  block: BLOCK;
  // MEMO: 「MyzSwitchBlockを実装した型」を「MyzSwitchBlock」にダウンキャストした場合に
  //       関数の引数の型は不正なキャストが発生するため、正しい型をつけることが不可能になっている
  // bind: (value: MyzState<{ block: BLOCK; }>) => STATE;
  // toBlockState: (state: STATE) => MyzState<{ block: BLOCK; }>;
  bind: (value: unknown) => STATE;
  toBlockState: (state: unknown) => MyzState<{ block: BLOCK; }>;
}
interface MyzSwitchBuilder<
  STATE extends MyzState,
  BLOCKS extends Record<string, MyzSwitchBlock<STATE>>,
> {
  addBlock: <KEY extends string, BLOCK extends MyzObjects>(
    key: KEY,
    blocks: BLOCK,
    bind: (value: STATE & MyzState<{ block: BLOCK; }>) => STATE,
    toBlockState: (state: STATE) => MyzState<{ block: BLOCK; }>,
  ) => MyzSwitchBuilder<
    STATE,
    BLOCKS & { [K in KEY]: MyzSwitchBlock<STATE, KEY, BLOCK>; }
  >;
  build: (defaultSelectKey?: ((status: STATE) => keyof BLOCKS)) => MyzSwitch<STATE, BLOCKS>;
}
//#endregion SWITCH
//#endregion MyzRooter


//#region VALUEABLE
export interface MyzString<EXTRA extends MyzExtraTypes = never> extends MyzValueable<"string", EXTRA> { }
export interface MyzNumber<EXTRA extends MyzExtraTypes = never> extends MyzValueable<"number", EXTRA> {
  /** @default `"range"` */
  control: "number" | "range";
  min?: number;
  max?: number;
  step?: number;
}
export interface MyzBoolean<EXTRA extends MyzExtraTypes = never> extends MyzValueable<"boolean", EXTRA> { }
export interface MyzList<Choices extends readonly string[] = readonly string[], EXTRA extends MyzExtraTypes = never> extends MyzValueable<"list", EXTRA> {
  choices: Choices;
}
export interface MyzColor<EXTRA extends MyzExtraTypes = never> extends MyzValueable<"color", EXTRA> { }
//#endregion VALUEABLE


//#region TYPE EXTRA
export type MyzExtraRecord<EXTRA extends MyzExtraTypes = never> =
  [EXTRA] extends [never]
  ? Partial<{ [K in MyzExtraType]: true | undefined }>
  : EXTRA extends null ? Record<Exclude<MyzExtraTypes, EXTRA | null>, undefined>
  : Record<Exclude<EXTRA, null>, true> & Partial<Record<Exclude<MyzExtraTypes, EXTRA | null>, undefined>>;
export type MyzExtraTypes = null | MyzExtraType;
export type MyzExtraType = MyzOptional;// | MyzNullable;
export type MyzOptional = "optional";
// export type MyzNullable = "nullable";
//#endregion TYPE EXTRA
//#endregion


//#region MyzPart
type MyzPart<
  T extends MyzRooter | MyzValue,
  K extends keyof Omit<T, "type" | "extra"> = never
> = Partial<Omit<T, "type" | "extra" | K>> & Pick<MyzBase, "display">;
export type MyzBlockPart = MyzPart<MyzBlock>;
export type MyzSwitchPart = MyzPart<MyzSwitch, "blocks">;
export type MyzStringPart = MyzPart<MyzString>;
export type MyzNumberPart = MyzPart<MyzNumber>;
export type MyzBooleanPart = MyzPart<MyzBoolean>;
export type MyzListPart = MyzPart<MyzList, "choices">;
export type MyzColorPart = MyzPart<MyzColor>;
//#endregion MyzPart

export const myz = {
  root: <BLOCK extends MyzObjects>(block: BLOCK): MyzRoot<BLOCK> => {
    return { block };
  },

  block: <BLOCK extends MyzObjects>(displayOrParams: string | MyzBlockPart, block: BLOCK): MyzObject<MyzBlock<BLOCK>> => {
    return { ...toBase("block", displayOrParams), block };
  },
  switch: <STATE extends MyzState>(
    displayOrParams: string | MyzSwitchPart,
  ): MyzSwitchBuilder<STATE, {}> => {
    const blocks: Record<string, MyzSwitchBlock<STATE>> = {};

    const builder: MyzSwitchBuilder<STATE, {}> = {
      addBlock: (key, block, bind, toBlockState) => {
        blocks[key] = {
          key,
          block,
          bind: bind as any,
          toBlockState: toBlockState as any,
        };
        return builder as any;
      },
      build: params => ({
        ...toBase("switch", displayOrParams),
        blocks,
        selectKey: typeof params === "function"
          ? params as any
          : () => blocks[0].key,
      }),
    };

    return builder;
  },

  string: <EXTRA extends MyzExtraTypes = null>(displayOrParams: string | MyzStringPart, ...extras: Exclude<EXTRA, null>[]): MyzString<EXTRA> => {
    return { ...toValue("string", displayOrParams, extras) };
  },
  number: <EXTRA extends MyzExtraTypes = null>(displayOrParams: string | MyzNumberPart, ...extras: Exclude<EXTRA, null>[]): MyzNumber<EXTRA> => {
    return { control: "range", ...toValue("number", displayOrParams, extras) };
  },
  boolean: <EXTRA extends MyzExtraTypes = null>(displayOrParams: string | MyzBooleanPart, ...extras: Exclude<EXTRA, null>[]): MyzBoolean<EXTRA> => {
    return { ...toValue("boolean", displayOrParams, extras) };
  },
  list: <const Choices extends readonly string[], EXTRA extends MyzExtraTypes = null>(
    displayOrParams: string | MyzListPart, choices: Choices, ...extras: Exclude<EXTRA, null>[]
  ): MyzList<Choices, EXTRA> => {
    return { ...toValue("list", displayOrParams, extras), choices };
  },
  color: <EXTRA extends MyzExtraTypes = null>(displayOrParams: string | MyzColorPart, ...extras: Exclude<EXTRA, null>[]): MyzColor<EXTRA> => {
    return { ...toValue("color", displayOrParams, extras) };
  },
} as const;


function toBase<Type extends MyzObjectType>(
  type: Type,
  displayOrParams: string | Omit<MyzBase, "type">
): MyzBase<Type> {
  if (typeof displayOrParams === "string")
    return { display: displayOrParams, type };
  return { ...displayOrParams, type };
}
function toValue<Type extends MyzValueType, EXTRA extends MyzExtraTypes>(
  type: Type,
  displayOrParams: string | Omit<MyzBase, "type">,
  extras: Exclude<EXTRA, null>[],
): MyzBase<Type> & { extra: MyzExtraRecord<EXTRA>; } {
  const extra = toExtraRecord(extras) as MyzExtraRecord<EXTRA>;
  if (typeof displayOrParams === "string")
    return { display: displayOrParams, type, extra };
  return { ...displayOrParams, type, extra };
}

function toExtraRecord<EXTRA extends MyzExtraType>(extras: EXTRA[]): MyzExtraRecord<EXTRA> {
  return extras.reduce(
    (prev, current) => {
      prev[current] = true;
      return prev;
    },
    {} as MyzExtraRecord<EXTRA>,
  );
}


/** 完全に展開された型を得るためのヘルパー型 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: O[K] }
  : never : T;

export type Readable<T> = { - readonly [K in keyof T]: T[K] };

export type Ignore<A, B> = ExpandRecursively<{
  [K in keyof A]: K extends keyof B ? never : A[K]
}>;

export type DeepIgnore<A, B> = ExpandRecursively<{
  [K in keyof A]: K extends keyof B
  ? A[K] extends object ? DeepIgnore<A[K], B[K]> : never
  : A[K];
}>;
