import type { CSSObject } from "@emotion/css/create-instance";
import type { MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import { _ComejeneContentStyle, _ComejeneContentStyleRoot, type _ComejeneContentStyle_Img, type _ComejeneContentStyle_Text } from "./ContentStyle_inner";
import { ComejeneContentKeys, ComejeneContentKeyToType, type ComejeneContentTypes } from "./ContentType";

export type ComejeneContentStyle<D extends _ComejeneContentStyleRoot = _ComejeneContentStyleRoot> = MyzState<D>;

export interface ComejeneContentStyleSet {
  icon: _ComejeneContentStyle_Img;
  name: _ComejeneContentStyle_Text;
  message: _ComejeneContentStyle_Text;
}

export const ComejeneContentStyleSet = {
  new: (params: {
    icon: _ComejeneContentStyle_Img,
    name: _ComejeneContentStyle_Text,
    message: _ComejeneContentStyle_Text,
  }): ComejeneContentStyleSet => params,
  updateCss: (customCss: CustomCss, style: ComejeneContentStyleSet): void => {
    const cssObj: CSSObject = {};

    for (const frameName of ComejeneContentKeys) {
      const content = style[frameName];
      if (!content.visible) {
        cssObj[`.content-frame.${frameName}`] = { display: "none" };
      } else {
        cssObj[`.content-frame.${frameName}`] = _ComejeneContentStyle.asCss(
          ComejeneContentKeyToType[frameName],
          content,
        );
      }
    }

    customCss.updateCss("MessageContentsStyle", [cssObj]);
  },
} as const;

export const ComejeneContentStyleRoot = {
  text: _ComejeneContentStyleRoot.text,
  img: _ComejeneContentStyleRoot.img,
} as const satisfies Record<ComejeneContentTypes, _ComejeneContentStyleRoot>;
