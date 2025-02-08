import type { CSSObject } from "@emotion/css/create-instance";
import type { ColorPickerValue } from "../../components/ColorPicker.svelte";
import { myz, type MyzSwitchPart } from "../../lib/Myz";

export interface DirNumbers {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const BorderStyles = ["none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"] as const;
export type BorderStyle = typeof BorderStyles[number];
export interface CssBorders {
  color: ColorPickerValue;
  width: number;
  radius: number;
  style: BorderStyle;
}

//#region CssConverter
/**
 * 4方向を上右下左の順で`unit`を付けて連結する
 * @param dirNumbers 上下左右の数値
 * @param unit 単位
 * @returns `"{top}{unit} {right}{unit} {bottom}{unit} {left}{unit}"`
 */
export function dirNumbersToCss(dirNumbers: DirNumbers, unit = "px"): string {
  return [dirNumbers.top, dirNumbers.right, dirNumbers.bottom, dirNumbers.left]
    .map(p => `${p}${unit}`)
    .join(" ");
}

export function boolToBold(isBold: boolean): "normal" | "bold" {
  return isBold ? "bold" : "normal";
}

export function borderToCssObject(border: CssBorders) {
  return {
    borderStyle: border.style,
    borderWidth: border.width,
    borderColor: border.color,
    borderRadius: border.radius,
  } satisfies CSSObject;
}
//#endregion CssConverter


//#region Utility
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

export function createBorderBlock() {
  return myz.block("枠線", {
    color: myz.color("色"),
    width: myz.number({ display: "太さ", max: 20 }),
    radius: myz.number({ display: "丸み", max: 50 }),
    style: myz.list("スタイル", BorderStyles),
  });
}
//#endregion Utility