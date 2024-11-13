
export type MyzType =
  | "block"
  | "list"  // |"dynamic"
  | "string" | "number" | "boolean" | "color";

export type MyzObject<Type extends MyzType = MyzType> = (
  | MyzBlock | MyzList  // | MyzDynamic
  | MyzString | MyzNumber | MyzBoolean | MyzColor
) & { type: Type; };

export type MyzState<ROOT extends MyzRoot = MyzRoot> = {
  -readonly [K in keyof ROOT["blocks"]]: ROOT["blocks"][K] extends (infer T) ?
  T extends MyzBlock ? MyzState<T>
  : T extends MyzList ? T["choices"][number]
  // : T extends MyzDynamic ? never
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
// export interface MyzDynamic extends MyzObjectBase<"dynamic"> {}
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
  BLOCKS extends Record<string, MyzObject> = Record<string, MyzObject>
> {
  blocks: BLOCKS;
}
//#endregion ROOT




export const myz = {
  root: <BLOCKS extends MyzObjects>(blocks: BLOCKS): MyzRoot<BLOCKS> => {
    return { blocks };
  },

  block: <BLOCKS extends MyzObjects>(displayOrParams: string | Omit<MyzBlock, "type" | "choices">, blocks: BLOCKS): MyzBlock<BLOCKS> => {
    if (typeof displayOrParams === "string")
      return { type: "block", display: displayOrParams, blocks };
    return { ...displayOrParams, type: "block", blocks };
  },
  list: <const Choices extends readonly string[]>(displayOrParams: string | Omit<MyzList, "type" | "choices">, choices: Choices): MyzList<Choices> => {
    if (typeof displayOrParams === "string")
      return { type: "list", display: displayOrParams, choices };
    return { ...displayOrParams, type: "list", choices };
  },

  string: (displayOrParams: string | Omit<MyzString, "type">): MyzString => create("string", displayOrParams),
  number: (displayOrParams: string | Omit<MyzNumber, "type">): MyzNumber => create("number", displayOrParams),
  boolean: (displayOrParams: string | Omit<MyzBoolean, "type">): MyzBoolean => create("boolean", displayOrParams),
  color: (displayOrParams: string | Omit<MyzColor, "type">): MyzColor => create("color", displayOrParams),
} as const;

function create<
  Type extends MyzType,
  Params extends MyzObjectBase<Type>
>(
  type: Type,
  displayOrParams: string | Omit<Params, "type">,
): MyzObjectBase<Type> {
  if (typeof displayOrParams === "string")
    return { type, display: displayOrParams };
  return { ...displayOrParams, type };
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
