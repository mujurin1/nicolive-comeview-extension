import { css } from "@emotion/css";
import type { CSSObject } from "@emotion/css/create-instance";
import type { ExpandRecursively } from "../Motion";
import type { AsStyleSetting, StyleDefinition } from "./StyleDefinition";


export type MessageFrameStyle = ExpandRecursively<AsStyleSetting<typeof MessageFrameStyleDefinition>>;
export const MessageFrameStyle = {
  toCss: (style: MessageFrameStyle): string => {
    const cssObj: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
      }
    };

    return css(cssObj);
  }
} as const;

export const MessageFrameStyleDefinition = {
  backColor: "color",
  size: {
    x: ["FIT", "FULL"],
    y: ["FIT", "FULL"],
  }
} as const satisfies StyleDefinition;
