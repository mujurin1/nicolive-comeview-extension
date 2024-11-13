import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";


export type MessageFrameStyle = MyzState<typeof MessageFrameStyleDefinition>;
export const MessageFrameStyle = {
  updateCss: (customCss: CustomCss, style: MessageFrameStyle): void => {
    const baseCss: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
        padding: `${style.padding}px`,
        border: "1px solid purple",
      },
    };
    customCss.updateCss("MessageFrameStyle", [baseCss]);
  },
} as const;

export const MessageFrameStyleDefinition = myz.root({
  backColor: myz.color("背景色"),
  padding: myz.number({ display: "余白", min: 0 }),
});

// padding: my.dynamic.new({})(
//   {
//     top: my.number({ display: "上" })(),
//     right: my.number({ display: "右" })(),
//     bottom: my.number({ display: "下" })(),
//     left: my.number({ display: "左" })(),
//   },
//   {
//     ui: {
//       共通: [
//         my.object({})({
//           padding: my.number({ display: "共通" })(),
//         }),
//         ({ padding }, controller) => [value, value, value, value],
//       ],
//       上下と左右: [
//         my.object({})({
//           topBottom: my.number({ display: "上下" })(),
//           leftRight: my.number({ display: "左右" })(),
//         }),
//         ({ topBottom, leftRight }, controller) => [topBottom, leftRight, topBottom, leftRight],
//       ],
//       個別: my.dynamic.default(),
//     }
//   }
// ),