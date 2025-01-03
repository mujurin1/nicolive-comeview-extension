import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import { paddingToCss } from "./ContentStyle_inner";

export type ComejeneMessageStyle = MyzState<typeof ComejeneMessageStyleRoot>;
export const ComejeneMessageStyle = {
  updateCss: (customCss: CustomCss, style: ComejeneMessageStyle): void => {
    const baseCss: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
        border: "1px solid purple",
        padding: paddingToCss(style.padding),
      },
    };

    customCss.updateCss("MessageFrameState", [baseCss]);
  },
} as const;

export const ComejeneMessageStyleRoot = myz.root({
  backColor: myz.color("背景色", "optional"),
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
    .build(),
});
