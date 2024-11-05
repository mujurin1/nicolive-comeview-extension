import type { CSSObject } from "@emotion/css/create-instance";
import { MessageContentToStyleType, type MessageContentFrame, type MessageContentType } from ".";
import type { CustomCss } from "../func";
import type { ExpandRecursively } from "../Motion";
import { FlexPosition, FlexPositions, type AsStyleSetting, type StyleDefinition } from "./StyleDefinition";

const MessageContentStyleDefinition = {
  create: <Definition extends StyleDefinition>(definition: Definition): Definition & typeof MessageContentStyleDefinition_Base => ({
    ...MessageContentStyleDefinition_Base,
    ...definition,
  }),
} as const;

/**
 * 全タイプのメッセージの持つ属性
 */
const MessageContentStyleDefinition_Base = {
  /** X,Y 軸上の位置 */
  position: {
    x: FlexPositions,
    y: FlexPositions,
  },
} as const satisfies StyleDefinition;
/**
 * テキストタイプのメッセージの持つ属性
 */
export const MessageContentStyleDefinition_Text = MessageContentStyleDefinition.create({
  textSize: "number",
  textColor: "color",
  noNewLine: "boolean",
  backColor: "color",
} as const);
/**
 * 画像タイプのメッセージの持つ属性
 */
export const MessageContentStyleDefinition_Img = MessageContentStyleDefinition.create({
  /** 画像のサイズ. 未指定時:枠全体を使う */
  imgSize: { width: "number", height: "number", },
} as const);




export const MessageContentStyleDefinitionSet = {
  img: MessageContentStyleDefinition_Img,
  text: MessageContentStyleDefinition_Text,
} as const satisfies Record<MessageContentType, StyleDefinition>;

export const MessageContentStyle = {
  asCss: (type: MessageContentType, style: MessageContentStyle): CSSObject => {
    if (type === "img") return MessageContentStyle.asCss_Img(style as MessageContentStyle_Img);
    // else if(type === "text")
    return MessageContentStyle.asCss_Text(style as MessageContentStyle_Text);
  },
  asCss_Base: (style: MessageContentStyle_Base): CSSObject => {
    return {
      justifyContent: FlexPosition.asCss(style.position.x),
      alignItems: FlexPosition.asCss(style.position.y),
    };
  },
  asCss_Text: (style: MessageContentStyle_Text): CSSObject => {
    const cssObj = MessageContentStyle.asCss_Base(style);

    cssObj[".content"] = {
      fontSize: style.textSize,
      color: style.textColor,
      whiteSpace: style.noNewLine ? "normal" : "pre-wrap",
    };
    return cssObj;
  },
  asCss_Img: (style: MessageContentStyle_Img): CSSObject => {
    const cssObj = MessageContentStyle.asCss_Base(style);
    cssObj[".content"] = {
      width: `${style.imgSize.width}px`,
      height: `${style.imgSize.height}px`,
    };
    return cssObj;
  },
} as const;


export type MessageContentStyle = MessageContentStyle_Text | MessageContentStyle_Img;
type MessageContentStyle_Base = AsStyleSetting<typeof MessageContentStyleDefinition_Base>;
export type MessageContentStyle_Text = ExpandRecursively<AsStyleSetting<typeof MessageContentStyleDefinition_Text>>;
export type MessageContentStyle_Img = ExpandRecursively<AsStyleSetting<typeof MessageContentStyleDefinition_Img>>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MessageContentsStyle = {
  icon: MessageContentStyle_Img | undefined;
  name: MessageContentStyle_Text | undefined;
  message: MessageContentStyle_Text | undefined;
};
export const MessageContentsStyle = {
  new: (
    icon: MessageContentStyle_Img | undefined,
    name: MessageContentStyle_Text | undefined,
    message: MessageContentStyle_Text | undefined,
  ): MessageContentsStyle => ({
    icon,
    name,
    message,
  }),
  updateCss: (customCss: CustomCss, style: MessageContentsStyle): void => {
    const cssObj: CSSObject = {};

    for (const [frameName_, content] of Object.entries(style)) {
      const frameName = frameName_ as MessageContentFrame;
      if (content == null) {
        cssObj[`.content-frame.${frameName}`] = { display: "none" };
      } else {
        cssObj[`.content-frame.${frameName}`] = MessageContentStyle.asCss(
          MessageContentToStyleType[frameName],
          content,
        );
      }
    }

    customCss.updateCss("MessageContentsStyle", cssObj);
  },
} as const;
