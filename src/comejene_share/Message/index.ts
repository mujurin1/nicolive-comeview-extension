import { MessageContainerLayout } from "./MessageContainerLayout";
import { MessageContentsStyle } from "./MessageContentsStyle";
import { MessageFrameStyle } from "./MessageFrameStyle";

export * from "./MessageContainer.svelte";
export * from "./MessageContainerLayout";
export * from "./MessageContentsStyle";
export * from "./MessageFrameStyle";
export * from "./StyleDefinition";

/** コメジェネで表示するコンテンツの種類 */
export const MessageContentFrames = ["icon", "name", "message"] as const;
export type MessageContentFrames = typeof MessageContentFrames;
export type MessageContentFrame = MessageContentFrames[number];

export const MessageContentTypes = ["img", "text"] as const;
export type MessageContentTypes = typeof MessageContentTypes;
export type MessageContentType = MessageContentTypes[number];

export const MessageContentToStyleType = {
  icon: "img",
  name: "text",
  message: "text",
} as const satisfies Record<MessageContentFrame, MessageContentType>;


export interface MessageStyle {
  frameStyle: MessageFrameStyle;
  containerLayout: MessageContainerLayout;
  contentsStyle: MessageContentsStyle;
}
export const MessageStyle = {
  toCss: (style: MessageStyle): string => {
    return [
      MessageFrameStyle.toCss(style.frameStyle),
      MessageContainerLayout.toCss(style.containerLayout),
      MessageContentsStyle.toCss(style.contentsStyle),
    ]
      .join(" ");
  },
} as const;
