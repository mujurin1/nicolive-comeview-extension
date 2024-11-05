import type { CSSObject } from "@emotion/css/create-instance";
import type { CustomCss } from "../func";
import type { ExpandRecursively } from "../Motion";
import type { AsStyleSetting, StyleDefinition } from "./StyleDefinition";


export type MessageFrameStyle = ExpandRecursively<AsStyleSetting<typeof MessageFrameStyleDefinition>>;
export const MessageFrameStyle = {
  updateCss: (customCss: CustomCss, style: MessageFrameStyle): void => {
    const cssObj: CSSObject = {
      ".message-container": {
        backgroundColor: style.backColor,
      }
    };

    customCss.updateCss("MessageFrameStyle", cssObj);
  }
} as const;

export const MessageFrameStyleDefinition = {
  backColor: "color",
  size: {
    x: ["FIT", "FULL"],
    y: ["FIT", "FULL"],
  }
} as const satisfies StyleDefinition;
