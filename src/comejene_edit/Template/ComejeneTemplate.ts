import { ComejeneContentStyleSet, type ComejeneMotionNames, type ComejeneMotionSettings, type ComejeneStyle } from "../../comejene_share";
import { ComejeneTemplates_MessageContainer } from "./ComejeneTemplates_MessageContainer";


export interface ComejeneTemplate<Name extends ComejeneMotionNames = ComejeneMotionNames> {
  motion: {
    name: Name;
    setting: ComejeneMotionSettings[Name];
  };
  style: ComejeneStyle,
}

export const ComejeneTemplates = {
  デバッグ用: (): ComejeneTemplate<"sample"> => ({
    motion: {
      name: "sample",
      setting: {},
    },
    style: {
      ...ComejeneTemplates.縦並び().style,
      containerLayout: ComejeneTemplates_MessageContainer["I-N-C"](),
    },
  }),
  横並び: (): ComejeneTemplate<"stack"> => {
    const v = ComejeneTemplates.縦並び();
    v.style.containerLayout = ComejeneTemplates_MessageContainer["I-N-C"]();
    v.motion.setting.isVertical = false;
    v.motion.setting.verticalGrow = false;
    return v;
  },
  縦並び: (): ComejeneTemplate<"stack"> => ({
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
      containerLayout: ComejeneTemplates_MessageContainer["I-{N_/C}"](),
      contentsStyle: ComejeneContentStyleSet.new(
        {
          position: { x: "center", y: "center" },
          backColor: "#00000000",
          padding: { top: 0, right: 5, bottom: 0, left: 5, },
          imgSize: { width: 30, height: 30 }
        },
        {
          position: { x: "center", y: "center" },
          backColor: "#00000000",
          padding: { top: 0, right: 5, bottom: 0, left: 5, },
          textSize: 13,
          textColor: "#000000",
          banNewLine: true,
          noNewLine: true,
        },
        {
          position: { x: "center", y: "center" },
          backColor: "#00000000",
          padding: { top: 0, right: 0, bottom: 0, left: 0, },
          textSize: 13,
          textColor: "#000000",
          banNewLine: false,
          noNewLine: true,
        },
      ),
    }
  }),
} as const satisfies Record<string, () => ComejeneTemplate>;


export const TemplateNames = Object.keys(ComejeneTemplates) as TemplateName[];
export type TemplateName = keyof typeof ComejeneTemplates;
