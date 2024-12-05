import type { CSSObject } from "@emotion/css/create-instance";
import { MessageContentToStyleType, type MessageContentFrame, type MessageContentType } from ".";
import { myz } from "../../lib/Myz";
import type { CustomCss } from "../func";
import { FlexPosition, MessageContentRoot, type MessageContent } from "./MessageContent";

type MessageContentStyle = MessageContentStyle_Text | MessageContentStyle_Img;
type MessageContentStyle_Text = MessageContent<typeof MessageContentStyleRootSet.text>;
type MessageContentStyle_Img = MessageContent<typeof MessageContentStyleRootSet.img>;

export const MessageContentStyleRootSet = {
  /** テキストタイプのメッセージの持つ属性 */
  text: MessageContentRoot.create(
    {
      textSize: myz.number({ display: "文字サイズ", min: 10 }),
      textColor: myz.color("文字色"),
      backColor: myz.color("背景色", "optional"),
      banNewLine: myz.boolean("改行禁止"),
      // TODO: こういう風に書きたい. controller を介することで依存関係を整理する
      // changed: (newValue, controller) => {
      //   controller.disable("noNewLine", newValue);
      // },
      noNewLine: myz.boolean("改行文字無視"),
    }),
  /** 画像タイプのメッセージの持つ属性 */
  img: MessageContentRoot.create(
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
} as const satisfies Record<MessageContentType, MessageContentRoot>;

export const MessageContentStyle = {
  asCss: (type: MessageContentType, style: MessageContentStyle): CSSObject => {
    if (type === "img") return MessageContentStyle.asCss_Img(style as MessageContentStyle_Img);
    // else if(type === "text")
    return MessageContentStyle.asCss_Text(style as MessageContentStyle_Text);
  },
  asCss_Base: (style: MessageContent): CSSObject => {
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
      background: style.backColor,
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
