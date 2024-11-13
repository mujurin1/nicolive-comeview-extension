import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz/index.svelte";

export type MessageContentRoot<R extends MyzObjects = MyzObjects> = MyzRoot<R & Default_Objects>;
export type MessageContent<D extends MessageContentRoot = MessageContentRoot> = MyzState<D>;

export const FlexPositions = ["start", "center", "end"] as const;
export type FlexPosition = typeof FlexPositions[number];
export const FlexPosition = {
  asCss: (position: FlexPosition): string => {
    if (position === "center") return position;
    return `flex-${position}`;
  }
} as const;

export const MessageContentRoot = {
  create: <Objects extends Ignore<MyzObjects, Default_Objects>>(
    objects: Objects,
  ): MessageContentRoot<Objects> => myz.root({
    ...Default_Objects,
    ...objects,
  }),
} as const;


/**
 * 全タイプの共通のデータ
 */
const Default_Objects = {
  /** X,Y 軸上の位置 */
  position: myz.block("位置", {
    x: myz.list("x", FlexPositions),
    y: myz.list("y", FlexPositions),
  }),
} as const satisfies MyzObjects;
type Default_Objects = typeof Default_Objects;
