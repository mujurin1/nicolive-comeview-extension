export * from "zod";
import { z } from "zod";

export type ZodRaw = z.ZodRawShape;

export type MyZodTypes = "string" | "number" | "boolean" | "color" | "list" | "object";
export type ZodDefinition<R extends ZodRaw = ZodRaw> = z.ZodObject<R>;
export type ZodModel<D extends ZodDefinition = ZodDefinition> = z.infer<D>;

declare module "zod" {
  interface ZodType {
    readonly type: MyZodTypes;
    readonly display?: string;
    readonly desc?: string;
  }

  interface ZodUnion<T extends z.ZodUnionOptions> {
    readonly selectors: string[];
  }
}

export const my = {
  object: <T extends ZodRaw>(args: T): z.ZodObject<T> => {
    const obj = z.object<T>(args);
    setType(obj, "object");
    return obj;
  },
  string: (...args: Parameters<typeof z.string>): z.ZodString => {
    const obj = z.string(...args);
    setType(obj, "string");
    return obj;
  },
  number: (...args: Parameters<typeof z.number>): z.ZodNumber => {
    const obj = z.number(...args);
    setType(obj, "number");
    return obj;
  },
  // bigint: (...args: Parameters<typeof z.bigint>): z.ZodBigInt => {
  //   const obj = z.bigint(...args);
  //   setType(obj, "bigint");
  //   return obj;
  // },
  boolean: (...args: Parameters<typeof z.boolean>): z.ZodBoolean => {
    const obj = z.boolean(...args);
    setType(obj, "boolean");
    return obj;
  },
  // date: (...args: Parameters<typeof z.date>): z.ZodDate => {
  //   const obj = z.date(...args);
  //   setType(obj, "date");
  //   return obj;
  // },
  // symbol: (...args: Parameters<typeof z.symbol>): z.ZodSymbol => {
  //   const obj = z.symbol(...args);
  //   setType(obj, "symbol");
  //   return obj;
  // },

  color: (...args: Parameters<typeof z.string>): z.ZodOptional<z.ZodString> => {
    const obj = z.string(...args).optional();
    setType(obj, "color");
    return obj;
  },
  list: <T extends [string, string, ...string[]]>(...types: T): z.ZodUnion<ToZodLiterals<T>> => {
    const x = types.map(t => z.literal(t)) as ToZodLiterals<T>;
    const obj: Readable<z.ZodUnion<ToZodLiterals<T>>> = z.union(x);
    obj.type = "list";
    obj.selectors = types;
    return obj;
  },
} as const;

function setType(obj: z.ZodType, type: MyZodTypes) {
  (<Readable<z.ZodType>>obj).type = type;
}

type ToZodLiterals<T extends readonly any[]> = {
  readonly [K in keyof T]: z.ZodLiteral<T[K]>
};
type Readable<T> = { - readonly [K in keyof T]: T[K] };


export type Ignore<A, B> = {
  [K in keyof A]: K extends keyof B ? never : A[K]
};

/** 完全に展開された型を得るためのヘルパー型 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: O[K] }
  : never : T;
