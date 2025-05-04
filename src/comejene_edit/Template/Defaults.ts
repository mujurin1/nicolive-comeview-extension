import { ComejeneContentStyleSet, ComejeneMessageFrame } from "../../comejene_share/Message";
import type { ComejeneTemplate } from "./ComejeneTemplate";

export const DefaultComejeneFrames = {
  "I-{N_/C}": () => ComejeneMessageFrame.new(
    ["FIT", "FLEX"],
    ["FIT", "FIT", "FLEX"],
    {
      icon: {
        row: { start: 1, end: 2 },
        col: { start: 1, end: 1 },
      },
      name: {
        row: { start: 1, end: 1 },
        col: { start: 2, end: 2 },
      },
      message: {
        row: { start: 2, end: 2 },
        col: { start: 2, end: 3 },
      },
    },
  ),
  "I-N-C": () => ComejeneMessageFrame.new(
    ["FLEX"],
    ["FIT", "FIT", "FLEX"],
    {
      icon: {
        row: { start: 1, end: 1 },
        col: { start: 1, end: 1 },
      },
      // name: {
      //   row: { start: 1, end: 1 },
      //   col: { start: 2, end: 2 },
      // },
      name: undefined,
      message: {
        row: { start: 1, end: 1 },
        col: { start: 3, end: 3 },
      },
    },
  ),
} as const satisfies Record<string, () => ComejeneMessageFrame>;


const デバッグ用 = (): ComejeneTemplate<"sample"> => ({
  name: "デバッグ用",
  motion: {
    name: "sample",
    setting: {},
  },
  style: {
    ...縦並び().style,
    messageFrame: DefaultComejeneFrames["I-N-C"](),
  },
});
const 横並び = (): ComejeneTemplate<"stack"> => {
  const v = 縦並び();
  v.name = "横並び";
  v.style.messageFrame = DefaultComejeneFrames["I-N-C"]();
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
      verticalGrow: false,

      reverseOrder: false,
      maxWidth: 0,
      gap: 8,

      listAnimation: true,

      reverseGap: false,
      reverseMargine: false,
    },
  },
  style: {
    messageStyle: {
      backColor: "#D6D8FF",
      border: { style: "solid", color: "#923DFF81", width: 6, radius: 20 },
      padding: { top: 8, left: 8, right: 8, bottom: 8 },
    },
    messageFrame: DefaultComejeneFrames["I-{N_/C}"](),
    contentsStyle: ComejeneContentStyleSet.new({
      icon: {
        visible: true,
        position: { x: "center", y: "center" },
        // backColor: undefined,
        fitContent: false,
        backColor: "aqua",
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 5, bottom: 0, left: 0 },
        imgSize: { width: 42, height: 42 },
        border: { style: "solid", color: undefined, width: 0, radius: 0 },
      },
      name: {
        visible: true,
        position: { x: "center", y: "center" },
        // backColor: undefined,
        backColor: "azure",
        fitContent: false,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        textStyle: {
          fontFamily: "メイリオ",
          size: 24,
          color: "black",
          bold: false,
        },
        banNewLine: true,
        noNewLine: true,
        border: { style: "solid", color: undefined, width: 0, radius: 0 },
      },
      message: {
        visible: true,
        position: { x: "center", y: "center" },
        // backColor: undefined,
        backColor: "#FFDCDC",
        fitContent: false,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        textStyle: {
          fontFamily: "メイリオ",
          size: 24,
          color: "black",
          bold: false,
        },
        banNewLine: false,
        noNewLine: true,
        border: { style: "solid", color: undefined, width: 0, radius: 0 },
      },
    }),
  }
});

export const DefaultComejeneTemplates = {
  __default__Debug: デバッグ用(),
  __default__Tate: 縦並び(),
  __default__Yoko: 横並び(),
} as const;

export function isDefaultComejeneTemplate(id: string): boolean {
  return DefaultComejeneTemplates[id as keyof typeof DefaultComejeneTemplates] != null;
}
