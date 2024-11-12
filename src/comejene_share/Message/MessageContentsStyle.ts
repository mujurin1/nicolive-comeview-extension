import type { CSSObject } from "@emotion/css/create-instance";
import { MessageContentToStyleType, type MessageContentFrame, type MessageContentType } from ".";
import { my, type ExpandRecursively } from "../../function/MyZod";
import type { CustomCss } from "../func";
import { FlexPosition, MessageContentStyleDefinition, type StyleDefinition, type StyleSettingModel } from "./MessageContainerDefinition";

type MessageContentStyle = MessageContentStyle_Text | MessageContentStyle_Img;
type MessageContentStyle_Text = ExpandRecursively<StyleSettingModel<typeof MessageContentStyleDefinitionSet.text>>;
type MessageContentStyle_Img = ExpandRecursively<StyleSettingModel<typeof MessageContentStyleDefinitionSet.img>>;

export const MessageContentStyleDefinitionSet = {
  /** テキストタイプのメッセージの持つ属性 */
  text: MessageContentStyleDefinition.create(
    {},
    {
      textSize: my.number({
        display: "文字サイズ",
      })(),
      textColor: my.color({
        display: "文字色",
      })(),
      backColor: my.color({
        display: "背景色",
      })(),
      banNewLine: my.boolean({
        display: "改行禁止",
        // TODO: こういう風に書きたい. controller を介することで依存関係を整理する
        // changed: (newValue, controller) => {
        //   controller.disable("noNewLine", newValue);
        // },
      })(),
      noNewLine: my.boolean({
        display: "改行文字無視",
      })(),
    }),
  /** 画像タイプのメッセージの持つ属性 */
  img: MessageContentStyleDefinition.create(
    {},
    {
      /** 画像のサイズ */
      imgSize: my.object({})({
        width: my.number({ display: "width" })(),
        height: my.number({ display: "height" })(),
      }),
    }),
} as const satisfies Record<MessageContentType, StyleDefinition>;

export const MessageContentStyle = {
  asCss: (type: MessageContentType, style: MessageContentStyle): CSSObject => {
    if (type === "img") return MessageContentStyle.asCss_Img(style as MessageContentStyle_Img);
    // else if(type === "text")
    return MessageContentStyle.asCss_Text(style as MessageContentStyle_Text);
  },
  asCss_Base: (style: StyleSettingModel): CSSObject => {
    return {
      justifyContent: FlexPosition.asCss(style.position.x),
      alignItems: FlexPosition.asCss(style.position.y),
      overflow: "clip",
    };
  },
  asCss_Text: (style: MessageContentStyle_Text): CSSObject => {
    const cssObj = MessageContentStyle.asCss_Base(style);

    cssObj[".content"] = {
      fontSize: style.textSize,
      color: style.textColor,
      whiteSpace: style.banNewLine ? "nowrap" : style.noNewLine ? "normal" : "pre-wrap",
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


export interface MessageContentsStyle {
  icon: MessageContentStyle_Img | undefined;
  name: MessageContentStyle_Text | undefined;
  message: MessageContentStyle_Text | undefined;
}

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

    customCss.updateCss("MessageContentsStyle", [cssObj]);
  },
} as const;
