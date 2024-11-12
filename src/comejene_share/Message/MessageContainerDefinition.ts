import { type Ignore, type ZodDefinition, type ZodModel, type ZodRaw, my } from "../../function/MyZod";

export type StyleDefinition<R extends ZodRaw = ZodRaw> = ZodDefinition<R & Default_Raw>;
export type StyleSettingModel<D extends ZodDefinition = ZodDefinition> = ZodModel<D>;

export const FlexPositions = ["start", "center", "end"] as const;
export type FlexPosition = typeof FlexPositions[number];
export const FlexPosition = {
  asCss: (position: FlexPosition): string => {
    if (position === "center") return position;
    return `flex-${position}`;
  }
} as const;

export const MessageContentStyleDefinition = {
  create: <Raw extends Ignore<ZodRaw, Default_Raw>>(
    myParams: Parameters<typeof my.object>[0],
    raw: Raw,
  ): StyleDefinition<Raw> => my.object(myParams)({
    ...Default_Raw,
    ...raw,
  }),
} as const;


/**
 * 全タイプの共通のデータ
 */
const Default_Raw = {
  /** X,Y 軸上の位置 */
  position: my.object({
    display: "位置",
  })({
    x: my.list({})(...FlexPositions)(),
    y: my.list({})(...FlexPositions)(),
  }),
} as const satisfies ZodRaw;
type Default_Raw = typeof Default_Raw;
