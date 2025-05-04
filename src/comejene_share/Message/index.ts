export * from "./ContentStyle";
export * from "./ContentType";
export * from "./MessageFrame";
export * from "./MessageStyle";

import type { CustomCss } from "../func";
import { ComejeneContentStyleSet } from "./ContentStyle";
import { ComejeneMessageFrame } from "./MessageFrame";
import { ComejeneMessageStyle } from "./MessageStyle";

export interface ComejeneStyle {
  messageStyle: ComejeneMessageStyle;
  messageFrame: ComejeneMessageFrame;
  contentsStyle: ComejeneContentStyleSet;
}

export const ComejeneStyle = {
  updateCss: (customCss: CustomCss, style: ComejeneStyle): void => {
    ComejeneMessageStyle.updateCss(customCss, style.messageStyle);
    ComejeneMessageFrame.updateCss(customCss, style.messageFrame);
    ComejeneContentStyleSet.updateCss(customCss, style.contentsStyle);
  },
} as const;
