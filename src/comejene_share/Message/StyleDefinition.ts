import type { ExpandRecursively } from "../Motion";

export type StyleColumn = "string" | "number" | "boolean" | "color" | readonly string[] | StyleDefinition;
export type StyleDefinition = { readonly [K in string]: StyleColumn };

export type StyleSetting = Record<string, string | number | boolean | { [K in string]: string | number | boolean } | undefined>;
export type AsStyleSetting<T extends StyleDefinition> = {
  -readonly [K in keyof T]:
  T[K] extends "string" ? string :
  T[K] extends "number" ? number :
  T[K] extends "boolean" ? boolean :
  T[K] extends "color" ? `#${string}` | undefined :
  T[K] extends readonly string[] ? T[K][number] :
  T[K] extends StyleDefinition ? ExpandRecursively<AsStyleSetting<T[K]>> : never;
};

export const FlexPositions = ["start", "center", "end"] as const;
export type FlexPosition = typeof FlexPositions[number];
export const FlexPosition = {
  toCss: (position: FlexPosition): string => {
    if (position === "center") return position;
    return `flex-${position}`;
  }
} as const;
