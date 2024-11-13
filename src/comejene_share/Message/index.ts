import type { CustomCss } from "../func";
import { MessageContentLayout } from "./MessageContentLayout";
import { MessageContentsStyle } from "./MessageContentStyle";
import { MessageFrameState } from "./MessageFrame";

export * from "./MessageContainer.svelte";
export * from "./MessageContent";
export * from "./MessageContentLayout";
export * from "./MessageContentStyle";
export * from "./MessageFrame";

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


export interface MessageContent {
  frameSate: MessageFrameState;
  containerLayout: MessageContentLayout;
  contentsStyle: MessageContentsStyle;
}
export const MessageContent = {
  updateCss: (customCss: CustomCss, style: MessageContent): void => {
    MessageFrameState.updateCss(customCss, style.frameSate);
    MessageContentLayout.updateCss(customCss, style.containerLayout);
    MessageContentsStyle.updateCss(customCss, style.contentsStyle);
  },
} as const;
