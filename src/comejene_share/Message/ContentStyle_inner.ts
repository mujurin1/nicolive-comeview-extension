import type { CSSObject } from "@emotion/css/create-instance";
import { myz, type Ignore, type MyzObjects, type MyzRoot } from "../../lib/Myz";
import type { ComejeneContentStyle, ComejeneContentStyleRoot } from "./ContentStyle";
import type { ComejeneContentTypes } from "./ContentType";
import { paddingToCss } from "./util";

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
      padding: paddingToCss(style.padding),
      alignItems: FlexPosition.asCss(style.position.y),
      overflow: "clip",
      borderStyle: style.border.style,
      borderWidth: style.border.width,
      borderColor: style.border.color,
      borderRadius: style.border.radius,
    };
  },
  asCss_Text: (style: _ComejeneContentStyle_Text): CSSObject => {
    const cssObj = _ComejeneContentStyle.asCss_Base(style);

    cssObj[".content"] = {
      fontSize: style.textSize,
      color: style.textColor,
      whiteSpace: style.banNewLine ? "nowrap" : style.noNewLine ? "normal" : "pre-wrap",
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
const BorderStyles = ["none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"] as const;

export type _ComejeneContentStyleBase = typeof _ComejeneContentStyleBase;
/** 全タイプの共通のデータ */
export const _ComejeneContentStyleBase = {
  /** この項目を表示するかどうか */
  visible: myz.boolean("表示"),
  /** X,Y 軸上の寄せ */
  position: myz.block("位置(寄せ)", {
    x: myz.list("よこ", FlexPositions),
    y: myz.list("たて", FlexPositions),
  }),
  padding: myz.switch<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>("余白")
    .addBlock("上下左右",
      {
        padding: myz.number("上下左右"),
      },
      ({ padding }) => ({ top: padding, right: padding, bottom: padding, left: padding }),
      ({ top }) => ({ padding: top }),
    )
    .addBlock("上下と左右",
      {
        topBottom: myz.number("上下"),
        leftRight: myz.number("左右"),
      },
      ({ topBottom, leftRight }) => ({ top: topBottom, bottom: topBottom, left: leftRight, right: leftRight }),
      ({ top, left }) => ({ topBottom: top, leftRight: left }),
    )
    .addBlock("個別",
      {
        top: myz.number("上"),
        bottom: myz.number("下"),
        left: myz.number("左"),
        right: myz.number("右"),
      },
      values => values,
      values => values,
    )
    .build("上下と左右"),
  backColor: myz.color("背景色", "optional"),
  border: myz.block("枠線", {
    color: myz.color("色"),
    width: myz.number({ display: "太さ", max: 20 }),
    radius: myz.number({ display: "丸み", max: 50 }),
    style: myz.list("スタイル", BorderStyles),
  }),
} as const satisfies MyzObjects;

const ComejeneContentStyleRootBase = {
  create: <Objects extends Ignore<MyzObjects, _ComejeneContentStyleBase>>(
    objects: Objects,
  ): _ComejeneContentStyleRoot<Objects> => myz.root({
    ..._ComejeneContentStyleBase,
    ...objects,
  }),
} as const;

export const _ComejeneContentStyleRoot = {
  /** テキストタイプのメッセージの持つ属性 */
  text: ComejeneContentStyleRootBase.create(
    {
      textSize: myz.number({ display: "文字サイズ", min: 10 }),
      textColor: myz.color("文字色"),
      banNewLine: myz.boolean("改行禁止"),
      noNewLine: myz.boolean("改行文字無視"),
    }),
  /** 画像タイプのメッセージの持つ属性 */
  img: ComejeneContentStyleRootBase.create(
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
