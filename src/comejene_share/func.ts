import { serializeStyles, type CSSObject } from "@emotion/serialize";
import cssFlatten from "css-flatten";

export type CustomCss = ReturnType<typeof createCustomCss>;
export type CssFunc = (cssObject: CSSObject) => void;

export function createCustomCss() {
  const styleTags = new Map<string, HTMLStyleElement>();

  const obj = {
    /**
     * キーに固有のCSS (styleタグ) を更新する
     * @param id キー. 生成されるstyleタグのidにも利用される
     * @param cssObject 適用するCSS
     * @description
     * emotion/css と異なり`cssObject`に直接CSSを含めるのはダメ
     * @example
     * css(
     *   "key-name",  
     *   {
     *     // width: "100%",   // これはダメ
     *     .className: { ... } // 必ずこのように指定する
     *   },
     * );
     */
    updateCss: (id: string, cssObjects: CSSObject[]): void => {
      const style = getOrCreate(id);
      const parsedCss = parseCssObject(cssObjects);
      if (style.innerHTML !== parsedCss) style.innerHTML = parsedCss;
    },
    getUpdateCss: (id: string): ((cssObjects: CSSObject[]) => void) => {
      return cssObjects => obj.updateCss(id, cssObjects);
    },
    removeAll: () => {
      for (const style of styleTags.values()) {
        document.head.removeChild(style);
      }
      styleTags.clear();
    }
  } as const;

  return obj;

  function getOrCreate(id: string): HTMLStyleElement {
    let style = styleTags.get(id);
    if (style == null) {
      style = document.createElement("style");
      style.id = `inject-${id}`;
      styleTags.set(id, style);
      document.head.appendChild(style);
    }
    return style;
  }
}

function parseCssObject(cssObjects: CSSObject[]) {
  const serialized = serializeStyles(cssObjects);
  return cssFlatten(serialized.styles);
}
