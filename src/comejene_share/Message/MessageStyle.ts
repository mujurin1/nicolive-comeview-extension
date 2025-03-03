import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import { borderToCss, createBorderBlock, createDirNumbersSwitch, dirNumbersToCssText } from "./cssUtility";

export type ComejeneMessageStyle = MyzState<typeof ComejeneMessageStyleRoot>;
export const ComejeneMessageStyle = {
  updateCss: (customCss: CustomCss, style: ComejeneMessageStyle): void => {
    const baseCss: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
        padding: dirNumbersToCssText(style.padding),
        ...borderToCss(style.border)
      },
    };

    customCss.updateCss("MessageFrameState", [baseCss]);
  },
} as const;

export const ComejeneMessageStyleRoot = myz.root({
  backColor: myz.color("背景色", "optional"),
  border: createBorderBlock(),
  padding: createDirNumbersSwitch("余白 (内)", "上下左右"),
});
