import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz/index.svelte";

export type StyleDefinition<R extends MyzObjects = MyzObjects> = MyzRoot<R & Default_Raw>;
export type StyleSettingModel<D extends StyleDefinition = StyleDefinition> = MyzState<D>;

export const FlexPositions = ["start", "center", "end"] as const;
export type FlexPosition = typeof FlexPositions[number];
export const FlexPosition = {
  asCss: (position: FlexPosition): string => {
    if (position === "center") return position;
    return `flex-${position}`;
  }
} as const;

export const MessageContentStyleDefinition = {
  create: <Raw extends Ignore<MyzObjects, Default_Raw>>(
    raw: Raw,
  ): StyleDefinition<Raw> => myz.root({
    ...Default_Raw,
    ...raw,
  }),
} as const;


/**
 * 全タイプの共通のデータ
 */
const Default_Raw = {
  /** X,Y 軸上の位置 */
  position: myz.block("位置", {
    x: myz.list("x", FlexPositions),
    y: myz.list("y", FlexPositions),
  }),
} as const satisfies MyzObjects;
type Default_Raw = typeof Default_Raw;
