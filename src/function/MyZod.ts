export * from "zod";
import { z } from "zod";

export type ZodRaw = z.ZodRawShape;

export type MyZodTypes = "string" | "number" | "boolean" | "color" | "list" | "object";
export type ZodDefinition<R extends ZodRaw = ZodRaw> = z.ZodObject<R>;
export type ZodModel<D extends ZodDefinition = ZodDefinition> = z.infer<D>;

export interface ZodMeta {
  readonly type: MyZodTypes;
  readonly display?: string;
  readonly desc?: string;
}

declare module "zod" {
  interface ZodType {
    readonly meta: ZodMeta;
  }

  interface ZodUnion<T extends z.ZodUnionOptions> {
    readonly selectors: string[];
  }
}

type MyParams = Omit<ZodMeta, "type">;

export const my = {
  object: (myParams: MyParams): <T extends ZodRaw>(params: T) => z.ZodObject<T> => {
    return <T extends ZodRaw>(params: T) => {
      const obj = z.object<T>(params);
      setMeta(obj, "object", myParams);
      return obj;
    };
  },
  string: (myParams: MyParams): (params?: Parameters<typeof z.string>[0]) => z.ZodString => {
    return params => {
      const obj = z.string(params);
      setMeta(obj, "string", myParams);
      return obj;
    };
  },
  number: (myParams: MyParams): (params?: Parameters<typeof z.number>[0]) => z.ZodNumber => {
    return params => {
      const obj = z.number(params);
      setMeta(obj, "number", myParams);
      return obj;
    };
  },
  boolean: (myParams: MyParams): (params?: Parameters<typeof z.boolean>[0]) => z.ZodBoolean => {
    return params => {
      const obj = z.boolean(params);
      setMeta(obj, "boolean", myParams);
      return obj;
    };
  },
  color: (myParams: MyParams): (params?: Parameters<typeof z.string>[0]) => z.ZodOptional<z.ZodString> => {
    return params => {
      const obj = z.string(params).optional();
      setMeta(obj, "color", myParams);
      return obj;
    };
  },
  list: (myParams: MyParams): <T extends [string, string, ...string[]]>(...types: T) => (params?: Parameters<typeof z.string>[0]) => z.ZodUnion<ToZodLiterals<T>> => {
    return <T extends [string, string, ...string[]]>(...types: T) => params => {
      const x = types.map(t => z.literal(t)) as ToZodLiterals<T>;
      const obj: Readable<z.ZodUnion<ToZodLiterals<T>>> = z.union(x, params);
      setMeta(obj, "list", myParams);
      obj.selectors = types;
      return obj;
    };
  },
} as const;

function setMeta(obj: z.ZodType, type: MyZodTypes, myParams: MyParams) {
  (<Readable<z.ZodType>>obj).meta = {
    ...myParams,
    type,
  };
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
