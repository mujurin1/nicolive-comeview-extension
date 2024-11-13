import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type MyzState } from "../../lib/Myz/index.svelte";
import type { CustomCss } from "../func";

export type MessageFrameStyle = MyzState<typeof MessageFrameStyleDefinition>;
export const MessageFrameStyle = {
  updateCss: (customCss: CustomCss, style: MessageFrameStyle): void => {
    const baseCss: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
        border: "1px solid purple",
        padding: padToCss(style.padding),
      },
    };

    customCss.updateCss("MessageFrameStyle", [baseCss]);
  },
} as const;

function padToCss(padding: MessageFrameStyle["padding"]): string {
  return [
    padding.top,
    padding.right,
    padding.bottom,
    padding.left,
  ]
    .map(p => `${p}px`)
    .join(" ");

}


export const MessageFrameStyleDefinition = myz.root({
  backColor: myz.color("背景色"),
  padding: myz.switch<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>("余白")
    .add(
      "全て",
      {
        padding: myz.number({ display: "全て" }),
      },
      ({ padding }) => ({ top: padding, right: padding, bottom: padding, left: padding }),
      ({ top }) => ({ padding: top }),
    )
    .add(
      "上下と左右",
      {
        topBottom: myz.number({ display: "上下" }),
        leftRight: myz.number({ display: "左右" }),
      },
      ({ topBottom, leftRight }) => ({ top: topBottom, bottom: topBottom, left: leftRight, right: leftRight }),
      ({ top, left }) => ({ topBottom: top, leftRight: left }),
    )
    .add(
      "個別",
      {
        top: myz.number("上"),
        right: myz.number("右"),
        bottom: myz.number("下"),
        left: myz.number("左"),
      },
      values => values,
      values => values,
    )
    .build(),
});
