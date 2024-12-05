import { MessageContentsStyle, type MessageContent, type MotionNames, type MotionSettings } from "../../comejene_share";
import { MessageContainerTemplates } from "./MessageContainer_Templates";


export interface Template<Name extends MotionNames = MotionNames> {
  motion: {
    name: Name;
    setting: MotionSettings[Name];
  };
  style: MessageContent,
}

export const Templates = {
  sample: (): Template<"sample"> => ({
    motion: {
      name: "sample",
      setting: {},
    },
    style: {
      ...Templates.縦並び().style,
      containerLayout: MessageContainerTemplates["L:I-N-C"](),
    },
  }),
  横並び: (): Template<"stack"> => {
    const v = Templates.縦並び();
    v.style.containerLayout = MessageContainerTemplates["L:I-N-C"]();
    v.motion.setting.isVertical = false;
    v.motion.setting.verticalGrow = false;
    return v;
  },
  縦並び: (): Template<"stack"> => ({
    motion: {
      name: "stack",
      setting: {
        isVertical: true,
        reverseOrder: false,
        maxWidth: 0,
        verticalGrow: true,
        listAnimation: true,

        reverseGap: false,
        reverseMargine: false,
      },
    },
    style: {
      frameSate: {
        backColor: "#aaffcc",
        padding: {
          top: 5,
          left: 5,
          right: 5,
          bottom: 5,
        },
      },
      containerLayout: MessageContainerTemplates["L:I-{N_C}"](),
      contentsStyle: MessageContentsStyle.new(
        {
          position: { x: "center", y: "center" },
          imgSize: { width: 30, height: 30 }
        },
        {
          position: { x: "start", y: "center" },
          textSize: 13,
          textColor: "#000000",
          backColor: "#00000000",
          banNewLine: true,
          noNewLine: true,
        },
        {
          position: { x: "center", y: "center" },
          textSize: 13,
          textColor: "#000000",
          backColor: "#00000000",
          banNewLine: false,
          noNewLine: true,
        },
      ),
    }
  }),
} as const satisfies Record<string, () => Template>;


export const TemplateNames = Object.keys(Templates) as TemplateName[];
export type TemplateName = keyof typeof Templates;
