import { css } from "@emotion/css";
import type { CSSObject } from "@emotion/css/create-instance";
import type { MessageContentFrame } from ".";
import type { CustomCss } from "../func";

export interface MessageContainerLayout {
  rows: ContainerGridSize[];
  cols: ContainerGridSize[];
  contents: Record<MessageContentFrame, ContentFrameLayout | undefined>;
}
export const MessageContainerLayout = {
  new: (
    rows: ContainerGridSize[],
    cols: ContainerGridSize[],
    contents: Record<MessageContentFrame, ContentFrameLayout | undefined>,
  ): MessageContainerLayout => ({
    rows,
    cols,
    contents,
  }),
  updateCss: (customCss: CustomCss, { rows, cols, contents }: MessageContainerLayout): void => {
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
        gridTemplateRows: rows.map(ContainerGridSize.asCss).join(" "),
        gridTemplateColumns: cols.map(ContainerGridSize.asCss).join(" "),
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
    customCss.updateCss("MessageContainerLayout", [cssObj]);
  }
} as const;


export interface MessageContainerGrid {
  rows: ContainerGridSize[];
  cols: ContainerGridSize[];
}

/** number:*px FIT:auto FLEX:1fr */
export type ContainerGridSize = number | "FIT" | "FLEX";
export const ContainerGridSize = {
  asCss: (size: ContainerGridSize): string => {
    if (typeof size === "number") return `${size}px`;
    return size === "FIT" ? "auto" : "1fr";
  },
} as const;


export interface ContentFrameLayout {
  row: GridPoint;
  col: GridPoint;
}

export interface GridPoint {
  /** グリッドの座標 (開始位置) */
  start: number;
  /** グリッドの座標 (終了位置) */
  end: number;
}
export const GridPoint = {
  // css では半開区間 (終わりを含まない) ので +1 する
  asCss: (point: GridPoint): string => `${point.start} / ${point.end + 1}`,
} as const;
