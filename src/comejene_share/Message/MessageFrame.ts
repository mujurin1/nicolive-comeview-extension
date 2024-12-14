import { css } from "@emotion/css";
import type { CSSObject } from "@emotion/css/create-instance";
import type { CustomCss } from "../func";
import type { ComejeneContentKeys } from "./ContentType";

export interface ComejeneMessageFrame {
  rows: ComejeneMessageGridSize[];
  cols: ComejeneMessageGridSize[];
  contents: Record<ComejeneContentKeys, ContentFrameLayout | undefined>;
}

export const ComejeneMessageFrame = {
  new: (
    rows: ComejeneMessageGridSize[],
    cols: ComejeneMessageGridSize[],
    contents: Record<ComejeneContentKeys, ContentFrameLayout | undefined>,
  ): ComejeneMessageFrame => ({
    rows,
    cols,
    contents,
  }),
  updateCss: (customCss: CustomCss, { rows, cols, contents }: ComejeneMessageFrame): void => {
    const cssObj: CSSObject = {
      ".comejene-container": {
        overflow: "clip",
        width: "100%",
        height: "100%",
      },

      ".motion": {},
      ".content-frame": {
        display: "flex",
        flexWrap: "wrap",
      },

      ".message-container": {
        display: "grid",
        gridTemplateRows: rows.map(ComejeneMessageGridSize.asCss).join(" "),
        gridTemplateColumns: cols.map(ComejeneMessageGridSize.asCss).join(" "),
      },
      // .content-frame.フレーム名 は下で追加する
    };

    for (const [frameName, content] of Object.entries(contents)) {
      if (content == null) {
        cssObj[`.content-frame.${frameName}`] = { display: "none" };
      } else {
        cssObj[`.content-frame.${frameName}`] = {
          gridRow: GridPoint.asCss(content.row),
          gridColumn: GridPoint.asCss(content.col),
        };
      }
    }

    css(cssObj);
    customCss.updateCss("ComejeneMessageFrame", [cssObj]);
  }
} as const;

/** number:*px FIT:auto FLEX:1fr */
type ComejeneMessageGridSize = number | "FIT" | "FLEX";
const ComejeneMessageGridSize = {
  asCss: (size: ComejeneMessageGridSize): string => {
    if (typeof size === "number") return `${size}px`;
    return size === "FIT" ? "auto" : "1fr";
  },
} as const;


interface ContentFrameLayout {
  row: GridPoint;
  col: GridPoint;
}

interface GridPoint {
  /** グリッドの座標 (開始位置) */
  start: number;
  /** グリッドの座標 (終了位置) */
  end: number;
}
const GridPoint = {
  // css では半開区間 (終わりを含まない) ので +1 する
  asCss: (point: GridPoint): string => `${point.start} / ${point.end + 1}`,
} as const;
