import { css } from "@emotion/css";
import type { CSSObject } from "@emotion/css/create-instance";
import type { MessageContentFrame } from ".";

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
  toCss: ({ rows, cols, contents }: MessageContainerLayout): string => {
    const cssObj: CSSObject = {
      height: "100%",
      width: "100%",

      ".motion": {},
      // .message-container は下で追加する
      ".content-frame": {
        display: "flex",
        flexWrap: "wrap",
      },

      ".message-container": {
        // flex: "1 0 0",
        // width: "100%",
        display: "grid",
        gridTemplateRows: rows.map(ContainerGridSize.toCss).join(" "),
        gridTemplateColumns: cols.map(ContainerGridSize.toCss).join(" "),
      },
      // .content-frame.フレーム名 は下で追加する
    };

    for (const [frameName, content] of Object.entries(contents)) {
      if (content == null) {
        cssObj[`.content-frame.${frameName}`] = { display: "none" };
      } else {
        cssObj[`.content-frame.${frameName}`] = {
          gridRow: GridPoint.toCss(content.row),
          gridColumn: GridPoint.toCss(content.col),
        };
      }
    }

    return css(cssObj);
  }
} as const;


export interface MessageContainerGrid {
  rows: ContainerGridSize[];
  cols: ContainerGridSize[];
}

/** number:*px FIT:auto FLEX:1fr */
export type ContainerGridSize = number | "FIT" | "FLEX";
export const ContainerGridSize = {
  toCss: (size: ContainerGridSize): string => {
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
  toCss: (point: GridPoint): string => `${point.start} / ${point.end + 1}`,
} as const;
