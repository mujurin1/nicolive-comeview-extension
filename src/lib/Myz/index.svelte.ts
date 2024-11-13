
export type MyzType =
  | "block"
  | "list" | "switch"
  | "string" | "number" | "boolean" | "color";

export type MyzObject<Type extends MyzType = MyzType> = (
  | MyzBlock | MyzList | MyzSwitch
  | MyzString | MyzNumber | MyzBoolean | MyzColor
) & { type: Type; };

export type MyzState<ROOT extends { blocks: MyzObjects; } = MyzRoot> = {
  -readonly [K in keyof ROOT["blocks"]]: ROOT["blocks"][K] extends (infer T) ?
  T extends MyzBlock ? MyzState<T>
  : T extends MyzList ? T["choices"][number]
  : T extends MyzSwitch ? T extends MyzSwitch<infer S, any> ? S : never
  : T extends MyzString ? string
  : T extends MyzNumber ? number
  : T extends MyzBoolean ? boolean
  : T extends MyzColor ? `#${string}`
  : never : never;
};



//#region TYPEs
interface MyzObjectBase<Type extends MyzType = MyzType> {
  type: Type;
  display: string;
  desc?: string;
}

export interface MyzBlock<BLOCKS extends MyzObjects = MyzObjects> extends MyzObjectBase<"block">, MyzRoot<BLOCKS> { }
export interface MyzList<Choices extends readonly string[] = readonly string[]> extends MyzObjectBase<"list"> {
  choices: Choices;
}
export interface MyzSwitch<
  STATE extends MyzState = MyzState,
  ITEMS extends Record<string, MyzSwitchItem<STATE>> = Record<string, MyzSwitchItem<STATE>>,
> extends MyzObjectBase<"switch"> {
  items: ITEMS;
}
//#region SWITCH
export interface MyzSwitchItem<
  STATE extends MyzState = MyzState,
  KEY extends string = string,
  BLOCKS extends MyzObjects = MyzObjects,
> extends MyzRoot<BLOCKS> {
  key: KEY;
  bind: (values: MyzState<{ blocks: BLOCKS; }>) => STATE;
  createState: (state: STATE) => MyzState<{ blocks: BLOCKS; }>;
}
export interface MysSwitchBuilder<
  STATE extends MyzState,
  ITEMS extends Record<string, MyzSwitchItem<STATE>>,
> {
  add: <KEY extends string, BLOCKS extends MyzObjects>(
    key: KEY,
    blocks: BLOCKS,
    bind: (value: MyzState<{ blocks: BLOCKS; }>) => STATE,
    stateInitialize: (state: STATE) => MyzState<{ blocks: BLOCKS; }>,
  ) => MysSwitchBuilder<
    STATE,
    ITEMS & { KEY: MyzSwitchItem<STATE, KEY, BLOCKS>; }
  >;
  build: () => MyzSwitch<STATE, ITEMS>;
}
//#endregion SWITCH


export interface MyzString extends MyzObjectBase<"string"> { }
export interface MyzNumber extends MyzObjectBase<"number"> {
  min?: number;
  max?: number;
  step?: number;
}
export interface MyzBoolean extends MyzObjectBase<"boolean"> { }
export interface MyzColor extends MyzObjectBase<"color"> { }
//#endregion TYPEs


//#region ROOT
export type MyzObjects = Record<string, MyzObject>;
export interface MyzRoot<
  BLOCKS extends MyzObjects = MyzObjects
> {
  blocks: BLOCKS;
}
//#endregion ROOT




export const myz = {
  root: <BLOCKS extends MyzObjects>(blocks: BLOCKS): MyzRoot<BLOCKS> => {
    return { blocks };
  },

  block: <BLOCKS extends MyzObjects>(displayOrParams: string | Omit<MyzBlock, "type" | "choices">, blocks: BLOCKS): MyzBlock<BLOCKS> => {
    return { ...asParams("block", displayOrParams), blocks };
  },
  list: <const Choices extends readonly string[]>(displayOrParams: string | Omit<MyzList, "type" | "choices">, choices: Choices): MyzList<Choices> => {
    return { ...asParams("list", displayOrParams), choices };
  },
  switch: <STATE extends MyzState>(
    displayOrParams: string | Omit<MyzSwitch, "type" | "items">,
  ): MysSwitchBuilder<STATE, {}> => {
    const items: Record<string, MyzSwitchItem<STATE>> = {};

    const builder: MysSwitchBuilder<STATE, {}> = {
      add: (
        key,
        blocks,
        bind,
        stateInitialize,
      ) => {
        items[key] = {
          key,
          blocks,
          bind: bind as any,
          createState: (state) => {
            const itemState = stateInitialize(state);
            return itemState;
          },
        };
        return builder as any;
      },
      build: () => ({
        ...asParams("switch", displayOrParams),
        items,
      }),
    };

    return builder;
  },

  string: (displayOrParams: string | Omit<MyzString, "type">): MyzString => create("string", displayOrParams),
  number: (displayOrParams: string | Omit<MyzNumber, "type">): MyzNumber => create("number", displayOrParams),
  boolean: (displayOrParams: string | Omit<MyzBoolean, "type">): MyzBoolean => create("boolean", displayOrParams),
  color: (displayOrParams: string | Omit<MyzColor, "type">): MyzColor => create("color", displayOrParams),
} as const;



function asParams<Type extends MyzType>(
  type: Type,
  displayOrParams: string | Omit<MyzObjectBase, "type">
): MyzObjectBase<Type> {
  if (typeof displayOrParams === "string")
    return { display: displayOrParams, type };
  return { ...displayOrParams, type };
}

function create<Type extends MyzType, Params extends MyzObjectBase<Type>>(
  type: Type,
  displayOrParams: string | Omit<Params, "type">,
): MyzObjectBase<Type> {
  return asParams(type, displayOrParams);
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
