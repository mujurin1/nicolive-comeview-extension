import { MessageContentsStyle, type MessageStyle, type MotionNames, type MotionSetting } from "../../comejene_share";
import { MessageContainerTemplates } from "./MessageContainer_Templates";



export interface Template {
  motion: {
    name: MotionNames;
    setting: MotionSetting;
  };
  style: MessageStyle,
  // style: {
  //   frame: MessageFrameStyle;
  //   contents: MessageContentsStyle;
  // };
}

export const Templates = {
  sample: (): Template => ({
    motion: {
      name: "sample",
      setting: {},
    },
    style: {
      ...Templates.stackA().style,
      containerLayout: MessageContainerTemplates["L:I-N-C"](),
    },
  }),
  stackB: (): Template => {
    const v = Templates.stackA();
    v.style.containerLayout = MessageContainerTemplates["L:I-N-C"]();
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
    style: {
      frameStyle: {
        backColor: "#aaffcc",
        size: {
          x: "FULL",
          y: "FULL",
        },
      },
      containerLayout: MessageContainerTemplates["L:I-{N_C}"](),
      contentsStyle: MessageContentsStyle.new(
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
