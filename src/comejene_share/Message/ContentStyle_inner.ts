import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type Ignore, type MyzObjects, type MyzRoot } from "../../lib/Myz";
import type { ComejeneContentStyle, ComejeneContentStyleRoot } from "./ContentStyle";
import type { ComejeneContentTypes } from "./ContentType";
import { borderToCss, createBorderBlock, createDirNumbersSwitch, createTextStyleBlock, dirNumbersToCssText, textStyleToCss } from "./cssUtility";

export const _ComejeneContentStyle = {
  asCss: (type: ComejeneContentTypes, style: _ComejeneContentStyle): CSSObject => {
    if (type === "img") return _ComejeneContentStyle.asCss_Img(style as _ComejeneContentStyle_Img);
    // else if(type === "text")
    return _ComejeneContentStyle.asCss_Text(style as _ComejeneContentStyle_Text);
  },
  asCss_Base: (style: ComejeneContentStyle): CSSObject => {
    return {
      justifyContent: FlexPosition.asCss(style.position.x),
      backgroundColor: style.backColor,
      padding: dirNumbersToCssText(style.padding),
      margin: dirNumbersToCssText(style.margin),
      alignItems: FlexPosition.asCss(style.position.y),
      overflow: "clip",
      ...borderToCss(style.border)
    };
  },
  asCss_Text: (style: _ComejeneContentStyle_Text): CSSObject => {
    const cssObj = _ComejeneContentStyle.asCss_Base(style);

    cssObj[".content"] = {
      whiteSpace: style.banNewLine ? "nowrap" : style.noNewLine ? "normal" : "pre-wrap",
      ...textStyleToCss(style.textStyle),
    };
    return cssObj;
  },
  asCss_Img: (style: _ComejeneContentStyle_Img): CSSObject => {
    const cssObj = _ComejeneContentStyle.asCss_Base(style);
    cssObj[".content"] = {
      width: `${style.imgSize.width}px`,
      height: `${style.imgSize.height}px`,
    };
    return cssObj;
  },
} as const;


export type _ComejeneContentStyleRoot<R extends MyzObjects = MyzObjects> = MyzRoot<R & _ComejeneContentStyleBase>;
export type _ComejeneContentStyle = _ComejeneContentStyle_Text | _ComejeneContentStyle_Img;
export type _ComejeneContentStyle_Text = ComejeneContentStyle<typeof ComejeneContentStyleRoot.text>;
export type _ComejeneContentStyle_Img = ComejeneContentStyle<typeof ComejeneContentStyleRoot.img>;

const FlexPositions = ["start", "center", "end"] as const;
type FlexPosition = typeof FlexPositions[number];
const FlexPosition = {
  asCss: (position: FlexPosition): string => {
    if (position === "center") return position;
    return `flex-${position}`;
  }
} as const;

export type _ComejeneContentStyleBase = typeof _ComejeneContentStyleBase;
/** 全タイプの共通のデータ */
export const _ComejeneContentStyleBase = MyzUtil.group("default", {
  /** この項目を表示するかどうか */
  visible: myz.boolean("表示"),
  /** X,Y 軸上の寄せ */
  position: myz.block("位置(寄せ)", {
    x: myz.list("よこ", FlexPositions),
    y: myz.list("たて", FlexPositions),
  }),
  padding: createDirNumbersSwitch("余白 (内)"),
  margin: createDirNumbersSwitch("余白 (外)"),
  backColor: myz.color("背景色", "optional"),
  border: createBorderBlock(),
});

const ComejeneContentStyleRootBase = {
  create: <Objects extends Ignore<MyzObjects, _ComejeneContentStyleBase>>(
    group: string,
    objects: Objects,
  ): _ComejeneContentStyleRoot<Objects> => myz.root({
    ...MyzUtil.group(group, objects),
    ..._ComejeneContentStyleBase,
  }),
} as const;

export const _ComejeneContentStyleRoot = {
  /** テキストタイプのメッセージの持つ属性 */
  text: ComejeneContentStyleRootBase.create("text", {
    textStyle: createTextStyleBlock({ display: "文字スタイル", defaultOpen: true }),
    banNewLine: myz.boolean("改行禁止"),
    noNewLine: myz.boolean("改行文字無視"),
  }),
  /** 画像タイプのメッセージの持つ属性 */
  img: ComejeneContentStyleRootBase.create("image", {
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
