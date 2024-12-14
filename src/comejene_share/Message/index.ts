export * from "./ContentStyle";
export * from "./ContentType";
export * from "./MessageFrame";
export * from "./MessageStyle";

import type { CustomCss } from "../func";
import { ComejeneContentStyleSet } from "./ContentStyle";
import { ComejeneMessageFrame } from "./MessageFrame";
import { ComejeneMessageStyle } from "./MessageStyle";

export interface ComejeneStyle {
  frameSate: ComejeneMessageStyle;
  containerLayout: ComejeneMessageFrame;
  contentsStyle: ComejeneContentStyleSet;
}

export const ComejeneStyle = {
  updateCss: (customCss: CustomCss, style: ComejeneStyle): void => {
    ComejeneMessageStyle.updateCss(customCss, style.frameSate);
    ComejeneMessageFrame.updateCss(customCss, style.containerLayout);
    ComejeneContentStyleSet.updateCss(customCss, style.contentsStyle);
  },
} as const;
