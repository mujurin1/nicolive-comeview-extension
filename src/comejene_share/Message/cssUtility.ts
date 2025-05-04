import type { CSSObject } from "@emotion/css/create-instance";
import type { ColorPickerValue } from "../../components/ColorPicker.svelte";
import { myz, type MyzBlockPart, type MyzSwitchPart } from "../../lib/Myz";

//#region CssConverter
/**
 * 4方向を上右下左の順で`unit`を付けて連結する
 * @param dirNumbers 上下左右の数値
 * @param unit 単位
 * @returns `"{top}{unit} {right}{unit} {bottom}{unit} {left}{unit}"`
 */
export function dirNumbersToCssText(dirNumbers: DirNumbers, unit = "px"): string {
  return [dirNumbers.top, dirNumbers.right, dirNumbers.bottom, dirNumbers.left]
    .map(p => `${p}${unit}`)
    .join(" ");
}

export function borderToCss(border: CssBorders) {
  return {
    borderStyle: border.style,
    borderWidth: border.width,
    borderColor: border.color,
    borderRadius: border.radius,
  } satisfies CSSObject;
}

export function textStyleToCss(textStyle: CssTextStyle) {
  return {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.size,
    color: textStyle.color,
    fontWeight: textStyle.bold ? "bold" : "normal",
  } satisfies CSSObject;
}
//#endregion CssConverter

// TODO: Utility の関数内で型指定したい. createBorderBlock(): CssBorders のように
//#region Utility
export interface DirNumbers {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export function createDirNumbersSwitch(
  displayOrParams: string | MyzSwitchPart,
  defaultSelectKey: "上下左右" | "上下と左右" | "個別" = "上下左右"
) {
  return myz.switch<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>(displayOrParams)
    .addBlock(
      "上下左右",
      {
        padding: myz.number("上下左右"),
      },
      ({ padding }) => ({ top: padding, right: padding, bottom: padding, left: padding }),
      ({ top }) => ({ padding: top }),
    )
    .addBlock(
      "上下と左右",
      {
        topBottom: myz.number("上下"),
        leftRight: myz.number("左右"),
      },
      ({ topBottom, leftRight }) => ({ top: topBottom, bottom: topBottom, left: leftRight, right: leftRight }),
      ({ top, left }) => ({ topBottom: top, leftRight: left }),
    )
    .addBlock(
      "個別",
      {
        top: myz.number("上"),
        bottom: myz.number("下"),
        left: myz.number("左"),
        right: myz.number("右"),
      },
      values => values,
      values => values,
    )
    .build(defaultSelectKey);
}

const BorderStyles = ["none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"] as const;
export type BorderStyle = typeof BorderStyles[number];
export interface CssBorders {
  color: ColorPickerValue;
  width: number;
  radius: number;
  style: BorderStyle;
}
export function createBorderBlock() {
  return myz.block("枠線", {
    style: myz.list("スタイル", BorderStyles),
    color: myz.color("色"),
    width: myz.number({ display: "太さ", max: 20 }),
    radius: myz.number({ display: "丸み", max: 50 }),
  });
}

export interface CssTextStyle {
  size: number;
  fontFamily: string;
  color: ColorPickerValue;
  bold: boolean;
}
export function createTextStyleBlock(displayOrParams: string | MyzBlockPart = "文字スタイル") {
  return myz.block(displayOrParams, {
    color: myz.color("色"),
    bold: myz.boolean("太字"),
    fontFamily: myz.string("フォント"),
    size: myz.number({ display: "サイズ", min: 10 }),
    // shadow: myz.block("縁取り", {
    //   length: myz.number("太さ"),
    // }),
  });
}
//#endregion Utility