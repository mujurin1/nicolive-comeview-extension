import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type Ignore, type MyzObjects, type MyzState } from "../../lib/Myz";
import type { CustomCss } from "../func";
import { _ComejeneContentStyle, _ComejeneContentStyleBase, type _ComejeneContentStyle_Img, type _ComejeneContentStyle_Text, type _ComejeneContentStyleRoot } from "./ContentStyle_inner";
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

const ComejeneContentStyleRoot = {
  create: <Objects extends Ignore<MyzObjects, _ComejeneContentStyleBase>>(
    objects: Objects,
  ): _ComejeneContentStyleRoot<Objects> => myz.root({
    ..._ComejeneContentStyleBase,
    ...objects,
  }),
} as const;

export const ComejeneContentStyleRootSet = {
  /** テキストタイプのメッセージの持つ属性 */
  text: ComejeneContentStyleRoot.create(
    {
      textSize: myz.number({ display: "文字サイズ", min: 10 }),
      textColor: myz.color("文字色"),
      banNewLine: myz.boolean("改行禁止"),
      noNewLine: myz.boolean("改行文字無視"),
    }),
  /** 画像タイプのメッセージの持つ属性 */
  img: ComejeneContentStyleRoot.create(
    {
      imgSize: myz.switch<{
        width: number;
        height: number;
      }>("画像サイズ")
        .addBlock(
          "縦横",
          { size: myz.number("縦横") },
          ({ size }) => ({ width: size, height: size }),
          ({ width }) => ({ size: width }),
        )
        .addBlock(
          "縦と横",
          {
            height: myz.number("縦"),
            width: myz.number("横"),
          },
          value => value,
          value => value,
        )
        .build(),
    }),
} as const satisfies Record<ComejeneContentTypes, _ComejeneContentStyleRoot>;
