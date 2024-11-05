import { serializeStyles, type CSSObject } from "@emotion/serialize";

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
    updateCss: (id: string, cssObject: CSSObject): void => {
      const style = getOrCreate(id);
      const parsed = parseCssObject(cssObject);
      if (style.innerHTML !== parsed.styles) style.innerHTML = parsed.styles;
    },
    getUpdateCss: (id: string): ((cssObject: CSSObject) => void) => {
      return (cssObject) => obj.updateCss(id, cssObject);
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

function parseCssObject(cssObject: CSSObject) {
  const serialized = serializeStyles([cssObject]);

  return serialized;
}
