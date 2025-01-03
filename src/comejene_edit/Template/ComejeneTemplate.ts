import { ComejeneContentStyleSet, type ComejeneMotionNames, type ComejeneMotionSettings, type ComejeneStyle } from "../../comejene_share";
import { ComejeneTemplates_MessageContainer } from "./ComejeneTemplates_MessageContainer";


export interface ComejeneTemplate<Name extends ComejeneMotionNames = ComejeneMotionNames> {
  name: string;
  motion: {
    name: Name;
    setting: ComejeneMotionSettings[Name];
  };
  style: ComejeneStyle;
}

const デバッグ用 = (): ComejeneTemplate<"sample"> => ({
  name: "デバッグ用",
  motion: {
    name: "sample",
    setting: {},
  },
  style: {
    ...縦並び().style,
    containerLayout: ComejeneTemplates_MessageContainer["I-N-C"](),
  },
});
const 横並び = (): ComejeneTemplate<"stack"> => {
  const v = 縦並び();
  v.name = "横並び";
  v.style.containerLayout = ComejeneTemplates_MessageContainer["I-N-C"]();
  v.motion.setting.isVertical = false;
  v.motion.setting.verticalGrow = false;
  return v;
};
const 縦並び = (): ComejeneTemplate<"stack"> => ({
  name: "縦並び",
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
    contentsStyle: ComejeneContentStyleSet.new({
      icon: {
        visible: true,
        position: { x: "center", y: "center" },
        backColor: "#00000000",
        padding: { top: 0, right: 5, bottom: 0, left: 5, },
        imgSize: { width: 30, height: 30 }
      },
      name: {
        visible: true,
        position: { x: "center", y: "center" },
        backColor: "#00000000",
        padding: { top: 0, right: 5, bottom: 0, left: 5, },
        textSize: 13,
        textColor: "#000000",
        banNewLine: true,
        noNewLine: true,
      },
      message: {
        visible: true,
        position: { x: "center", y: "center" },
        backColor: "#00000000",
        padding: { top: 0, right: 0, bottom: 0, left: 0, },
        textSize: 13,
        textColor: "#000000",
        banNewLine: false,
        noNewLine: true,
      },
    }),
  }
});

export const ComejeneTemplateFirstId = "$default$";
export const ComejeneTemplates = {
  [`${ComejeneTemplateFirstId}Debug`]: デバッグ用(),
  [`${ComejeneTemplateFirstId}Tate`]: 横並び(),
  [`${ComejeneTemplateFirstId}Yoko`]: 縦並び(),
} as const;


// export const TemplateNames = Object.keys(ComejeneTemplates) as TemplateName[];
// export type TemplateName = keyof typeof ComejeneTemplates;
