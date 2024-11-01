import { type MessageFrameStyle, type MotionNames, type MotionSetting, MessageContentsStyle } from "../../comejene_share";
import type { MessageContainerTemplateNames } from "./MessageContainer_Templates";



export interface Template {
  motion: {
    name: MotionNames;
    setting: MotionSetting;
  };
  containerTemplateName: typeof MessageContainerTemplateNames[number];
  style: {
    frame: MessageFrameStyle;
    contents: MessageContentsStyle;
  };
}

export const Templates = {
  sample: (): Template => ({
    motion: {
      name: "sample",
      setting: {},
    },
    containerTemplateName: "L:I-N-C",
    style: Templates.stackA().style,
  }),
  stackB: (): Template => {
    const v = Templates.stackA();
    v.containerTemplateName = "L:I-N-C";
    return v;
  },
  stackA: (): Template => ({
    motion: {
      name: "stack",
      setting: {
        direction: "column",
        reverseOrder: false,
        reverseGap: false,
        reverseMargine: false,
      },
    },
    containerTemplateName: "L:I-{N_C}",
    style: {
      frame: {
        backColor: "#aaffcc",
        size: {
          x: "FULL",
          y: "FULL",
        },
      },
      contents: MessageContentsStyle.new(
        {
          position: { x: "center", y: "center" },
          imgSize: { width: 30, height: 30 }
        },
        {
          position: { x: "center", y: "center" },
          textSize: 13,
          noNewLine: true,
          textColor: "#000000",
          backColor: "#000000",
        },
        {
          position: { x: "center", y: "center" },
          textSize: 13,
          noNewLine: true,
          textColor: "#000000",
          backColor: "#000000",
        },
      ),
    }
  }),
} as const satisfies Record<string, () => Template>;


export const TemplateNames = Object.keys(Templates) as TemplateName[];
export type TemplateName = keyof typeof Templates;
