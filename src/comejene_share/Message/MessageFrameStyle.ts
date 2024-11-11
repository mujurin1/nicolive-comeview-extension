import type { CSSObject } from "@emotion/css/create-instance";
import { my, type ZodModel } from "../../function/MyZod";
import type { CustomCss } from "../func";


export type MessageFrameStyle = ZodModel<typeof MessageFrameStyleDefinition>;
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

export const MessageFrameStyleDefinition = my.object({
  backColor: my.color(),
  size: my.object({
    x: my.list("FIT", "FULL"),
    y: my.list("FIT", "FULL"),
  }),
});
