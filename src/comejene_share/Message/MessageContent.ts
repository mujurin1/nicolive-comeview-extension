import { myz, type Ignore, type MyzObjects, type MyzRoot, type MyzState } from "../../lib/Myz";

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
  /** X,Y 軸上の寄せ */
  position: myz.block("位置(寄せ)", {
    x: myz.list("よこ", FlexPositions),
    y: myz.list("たて", FlexPositions),
  }),
  padding: myz.switch<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>("余白")
    .addBlock(
      "上下左右",
      {
        padding: myz.number("上下左右"),
      },
      ({ padding }) => ({ top: padding, right: padding, bottom: padding, left: padding }),
      ({ top }) => ({ padding: top }),
    )
    .addBlock(
      "上下と左右",
      {
        topBottom: myz.number("上下"),
        leftRight: myz.number("左右"),
      },
      ({ topBottom, leftRight }) => ({ top: topBottom, bottom: topBottom, left: leftRight, right: leftRight }),
      ({ top, left }) => ({ topBottom: top, leftRight: left }),
    )
    .addBlock(
      "個別",
      {
        top: myz.number("上"),
        bottom: myz.number("下"),
        left: myz.number("左"),
        right: myz.number("右"),
      },
      values => values,
      values => values,
    )
    .build("上下と左右"),
  backColor: myz.color("背景色", "optional"),
} as const satisfies MyzObjects;
type Default_Objects = typeof Default_Objects;
