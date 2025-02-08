import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import { borderToCssObject, createBorderBlock, createDirNumbersSwitch, dirNumbersToCss } from "./cssUtility";

export type ComejeneMessageStyle = MyzState<typeof ComejeneMessageStyleRoot>;
export const ComejeneMessageStyle = {
  updateCss: (customCss: CustomCss, style: ComejeneMessageStyle): void => {
    const baseCss: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
        padding: dirNumbersToCss(style.padding),
        margin: dirNumbersToCss(style.margin),
        ...borderToCssObject(style.border)
      },
    };

    customCss.updateCss("MessageFrameState", [baseCss]);
  },
} as const;

export const ComejeneMessageStyleRoot = myz.root({
  backColor: myz.color("背景色", "optional"),
  border: createBorderBlock(),
  padding: createDirNumbersSwitch("余白 (内)", "上下と左右"),
  margin: createDirNumbersSwitch("余白 (外)", "上下と左右"),
});
