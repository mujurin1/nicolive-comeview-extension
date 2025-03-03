<script lang="ts" module>
  export type NamedColorKey = keyof typeof namedColors;
  export type NamedColor = (typeof namedColors)[NamedColorKey];
  export const namedColors = {
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aqua: "#00FFFF",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    black: "#000000",
    blanchedalmond: "#FFEBCD",
    blue: "#0000FF",
    blueviolet: "#8A2BE2",
    brown: "#A52A2A",
    burlywood: "#DEB887",
    cadetblue: "#5F9EA0",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    cornflowerblue: "#6495ED",
    cornsilk: "#FFF8DC",
    crimson: "#DC143C",
    /** aqua の別名 */
    cyan: "#0FFFFA",
    darkblue: "#00008B",
    darkcyan: "#008B8B",
    darkgoldenrod: "#B8860B",
    darkgray: "#A9A9A9",
    darkgreen: "#006400",
    darkgrey: "#A9A9A9",
    darkkhaki: "#BDB76B",
    darkmagenta: "#8B008B",
    darkolivegreen: "#556B2F",
    darkorange: "#FF8C00",
    darkorchid: "#9932CC",
    darkred: "#8B0000",
    darksalmon: "#E9967A",
    darkseagreen: "#8FBC8F",
    darkslateblue: "#483D8B",
    darkslategray: "#2F4F4F",
    darkslategrey: "#2F4F4F",
    darkturquoise: "#00CED1",
    darkviolet: "#9400D3",
    deeppink: "#FF1493",
    deepskyblue: "#00BFFF",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1E90FF",
    firebrick: "#B22222",
    floralwhite: "#FFFAF0",
    forestgreen: "#228B22",
    fuchsia: "#FF00FF",
    gainsboro: "#DCDCDC",
    ghostwhite: "#F8F8FF",
    gold: "#FFD700",
    goldenrod: "#DAA520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#ADFF2F",
    /** gray の別名 */
    grey: "#808080",
    honeydew: "#F0FFF0",
    hotpink: "#FF69B4",
    indianred: "#CD5C5C",
    indigo: "#4B0082",
    ivory: "#FFFFF0",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lavenderblush: "#FFF0F5",
    lawngreen: "#7CFC00",
    lemonchiffon: "#FFFACD",
    lightblue: "#ADD8E6",
    lightcoral: "#F08080",
    lightcyan: "#E0FFFF",
    lightgoldenrodyellow: "#FAFAD2",
    lightgray: "#D3D3D3",
    lightgreen: "#90EE90",
    lightgrey: "#D3D3D3",
    lightpink: "#FFB6C1",
    lightsalmon: "#FFA07A",
    lightseagreen: "#20B2AA",
    lightskyblue: "#87CEFA",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#B0C4DE",
    lightyellow: "#FFFFE0",
    lime: "#00FF00",
    limegreen: "#32CD32",
    linen: "#FAF0E6",
    /** fuchsia の別名 */
    magenta: "#FF00FF",
    maroon: "#800000",
    mediumaquamarine: "#66CDAA",
    mediumblue: "#0000CD",
    mediumorchid: "#BA55D3",
    mediumpurple: "#9370DB",
    mediumseagreen: "#3CB371",
    mediumslateblue: "#7B68EE",
    mediumspringgreen: "#00FA9A",
    mediumturquoise: "#48D1CC",
    mediumvioletred: "#C71585",
    midnightblue: "#191970",
    mintcream: "#F5FFFA",
    mistyrose: "#FFE4E1",
    moccasin: "#FFE4B5",
    navajowhite: "#FFDEAD",
    navy: "#000080",
    oldlace: "#FDF5E6",
    olive: "#808000",
    olivedrab: "#6B8E23",
    orange: "#FFA500",
    orangered: "#FF4500",
    orchid: "#DA70D6",
    palegoldenrod: "#EEE8AA",
    palegreen: "#98FB98",
    paleturquoise: "#AFEEEE",
    palevioletred: "#DB7093",
    papayawhip: "#FFEFD5",
    peachpuff: "#FFDAB9",
    peru: "#CD853F",
    pink: "#FFC0CB",
    plum: "#DDA0DD",
    powderblue: "#B0E0E6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#FF0000",
    rosybrown: "#BC8F8F",
    royalblue: "#4169E1",
    saddlebrown: "#8B4513",
    salmon: "#FA8072",
    sandybrown: "#F4A460",
    seagreen: "#2E8B57",
    seashell: "#FFF5EE",
    sienna: "#A0522D",
    silver: "#C0C0C0",
    skyblue: "#87CEEB",
    slateblue: "#6A5ACD",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#FFFAFA",
    springgreen: "#00FF7F",
    steelblue: "#4682B4",
    tan: "#D2B48C",
    teal: "#008080",
    thistle: "#D8BFD8",
    tomato: "#FF6347",
    transparent: "#00000000",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    wheat: "#F5DEB3",
    white: "#FFFFFF",
    whitesmoke: "#F5F5F5",
    yellow: "#FFFF00",
    yellowgreen: "#9ACD32",
  } as const;

  export type ColorPickerValue = `#${string}` | NamedColorKey | undefined;

  type Colors = [number, number, number];

  export interface ColorPickerStateBase {
    /** `#RRGGBB` `#RRGGBBAA` `NamedColor` */
    value: string | undefined;
    /** `"#RRGGBB"`または`"#RRGGBBAA"` */
    hex: string | undefined;
    /** 色相:0-1 彩度:0-1 明度:0-1 */
    hsv: Colors | undefined;
    /** 透明度:0-1 */
    alpha: number;
  }

  export interface ColorPickerProps extends Partial<ColorPickerStateBase> {
    /** ラベルタグと対応づける値 */
    forId?: string;
    /**
     * ピッカーを表示するか\
     * `"always"` 常に表示する
     * @default false
     */
    showPicker?: boolean | "always";
  }

  export interface ColorPickerState extends ColorPickerStateBase {
    setHsvAlpha: (hsv: Colors | undefined, alpha: number) => void;
  }

  function getNamedColor(text: string | undefined): NamedColor | undefined {
    return namedColors[text?.toLowerCase() as NamedColorKey];
  }

  /**
   * 任意の文字列を`hsv` `alpha`にします
   * @param text `#RRGGBB` `#RRGGBBAA` `NamedColor`
   * @returns `#RRGGBB` `#RRGGBBAA` `undefiend`
   */
  function customColorToHsv(
    text: string | undefined,
  ): [hsv: Colors | undefined, alpha: number] | undefined {
    let color: string | undefined = getNamedColor(text);
    if (color == null) color = text;
    return hexToHsvAlpha(color);
  }

  /**
   * 16進数のカラーコードを `hsv` `alpha` に変換します
   * @param hex `"#RRGGBB"`または`"#RRGGBBAA"`
   * @returns `hexText` に応じて以下の値を返します
   * * 正しい文字列 => `[Colors, number]`
   * * `"" | undefined` => `[undefined, 1]`
   * * 不正な文字列 => `undefined`
   */
  function hexToHsvAlpha(
    hex: string | undefined,
  ): [hsv: Colors | undefined, alpha: number] | undefined {
    if (hex == null || hex == "") return [undefined, 1];
    if (!(hex.length === 7 || hex.length === 9)) return;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = hex.length === 7 ? 1 : parseInt(hex.slice(7, 9), 16) / 255;
    if ([r, g, b, a].some(x => isNaN(x))) return;
    return [rgbToHsv(r, g, b), a];
  }

  /**
   * @param r 0-255
   * @param g 0-255
   * @param b 0-255
   * @returns `[h,s,v]`
   */
  function rgbToHsv(r: number, g: number, b: number): Colors {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h: number;
    let s: number;
    let v = max;
    s = max === 0 ? 0 : diff / max;

    if (max === min) {
      h = 0;
    } else {
      h =
        r === max
          ? (g - b) / diff + (g < b ? 6 : 0)
          : g === max
            ? (b - r) / diff + 2
            : (r - g) / diff + 4;
      h /= 6;
    }

    return [h, s, v];
  }

  function hsvToHsl(hsv: Colors | undefined): Colors | undefined {
    if (hsv == null) return undefined;
    const [h, s, v] = hsv;
    const l = v * (1 - s / 2);
    const newS = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

    return [h, newS, l];
  }

  function hsvToHex(hsv: Colors | undefined, alpha: number): string | undefined {
    if (hsv == null) return undefined;
    const [h, s, v] = hsv;
    let r = 0;
    let g = 0;
    let b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        (r = v), (g = t), (b = p);
        break;
      case 1:
        (r = q), (g = v), (b = p);
        break;
      case 2:
        (r = p), (g = v), (b = t);
        break;
      case 3:
        (r = p), (g = q), (b = v);
        break;
      case 4:
        (r = t), (g = p), (b = v);
        break;
      case 5:
        (r = v), (g = p), (b = q);
        break;
    }

    let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (alpha != 1) {
      hex += toHex(alpha);
    }
    return hex;
  }

  function toHex(n: number): string {
    const v = Math.round(n * 255);
    if (v <= 15) return `0${v.toString(16).toUpperCase()}`;
    return v.toString(16).toUpperCase();
  }
</script>

<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import ColorPickerPanel from "./ColorPickerPanel.svelte";

  let {
    value = $bindable(),
    hex = $bindable(),
    hsv = $bindable(),
    alpha = $bindable(1),
    forId,
    showPicker = $bindable(false),
  }: ColorPickerProps = $props();

  let colorPickerButton: HTMLButtonElement;

  let _value = $state<string>();
  let _hex = $state<string>();
  let _hsv = $state<Colors>();
  let _alpha = $state(1);
  let pickerState = $state<ColorPickerState>({
    get value() {
      return _value;
    },
    set value(v) {
      if (_value === v) return;
      _value = v;
      if (v == null) {
        pickerState.setHsvAlpha(undefined, 1);
      } else {
        const color = customColorToHsv(v);
        if (color == null) return;
        pickerState.setHsvAlpha(color[0], color[1]);
      }
    },
    get hex() {
      return _hex;
    },
    set hex(v) {
      if (_hex === v) return;
      _hex = v;
      const color = hexToHsvAlpha(v);
      if (color == null) return;
      pickerState.setHsvAlpha(color[0], color[1]);
    },
    get hsv() {
      return _hsv;
    },
    set hsv(v) {
      pickerState.setHsvAlpha(v, _alpha);
    },
    get alpha() {
      return _alpha;
    },
    set alpha(v) {
      pickerState.setHsvAlpha(_hsv, v);
    },

    setHsvAlpha: (h, a) => {
      _hsv = h;
      _alpha = a;
      _hex = hsvToHex(_hsv, _alpha);
      if (_hex !== getNamedColor(_value)) {
        _value = _hex;
      }

      if (!inited) return;
      hsv = _hsv;
      alpha = _alpha;
      hex = _hex;
      value = _value;
    },
  });

  let inited = false;
  onMount(() => {
    document.addEventListener("mousedown", checkFocus);
    const parent = colorPickerButton.parentElement!;

    // 最初の色として使う優先度は
    // value > hex > hsv & alpha
    if (value != null) {
      pickerState.value = value;
    } else if (hex != null) {
      pickerState.hex = hex;
    } else if (hsv != null) {
      pickerState.setHsvAlpha(hsv, alpha ?? 1);
    }

    tick().then(() => (inited = true));
    return () => {
      document.removeEventListener("mousedown", checkFocus);
    };

    function checkFocus(e: MouseEvent) {
      if (showPicker === "always") return;
      if (parent.contains(e.target as Node)) return;
      showPicker = false;
    }
  });

  $effect(() => {
    value;
    untrack(() => {
      if (!inited) return;
      pickerState.value = value;
    });
  });
  $effect(() => {
    hex;
    untrack(() => {
      if (!inited) return;
      pickerState.hex = hex;
    });
  });
  $effect(() => {
    hsv;
    if (hsv != null) {
      hsv[0];
      hsv[1];
      hsv[2];
    }
    alpha;
    untrack(() => {
      if (!inited) return;
      pickerState.setHsvAlpha(hsv, alpha);
    });
  });

  let hsl = $derived(hsvToHsl(pickerState.hsv));
</script>

<div
  style:--picker-panel-x={pickerState.hsv?.[1] ?? 0}
  style:--picker-panel-y={1 - (pickerState.hsv?.[2] ?? 0)}
  style:--picker-hue={hsl?.[0]}
  style:--picker-saturation={hsl?.[1]}
  style:--picker-lightness={hsl?.[2]}
  style:--picker-alpha={pickerState.alpha}
  class="color-picker"
>
  <button
    bind:this={colorPickerButton}
    id={forId}
    class="color-picker-button"
    aria-label="color-picker-switch"
    onclick={() => {
      if (showPicker === "always") return;
      showPicker = !showPicker;
    }}
    type="button"
  >
    <div class="color-picker-button-bg"></div>
  </button>
  {#if showPicker}
    <div class="panel-wrap">
      <ColorPickerPanel bind:pickerState />
    </div>
  {/if}
</div>

<style>
  :root {
    --translate-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill-opacity=".1"><path d="M8 0h8v8H8zM0 8h8v8H0z" /></svg>');
    --picker-height: 220px;
    --picker-width: 200px;
    --picker-button-size: 100%;
    --picker-back-color: #333;

    --picker-slider-height: 24px;
    --picker-color-dummy-height: 12px;
    --picker-ring-color: white;
    --picker-ring-size: 28px;
    --picker-ring-border: 3px;
    --picker-text-size: 1.2em;
    --picker-text-color: white;
    --picker-text-back-color: #121212;
    --picker-z-index: 1;

    --picker-top: unset;
    --picker-bottom: unset;
    --picker-left: unset;

    --pick-alpha: 1;

    --picker-btn-index: 1;
  }

  .color-picker {
    user-select: none;
    position: relative;
    height: 100%;
    box-sizing: border-box;

    --picker-hsl: hsl(
      calc(var(--picker-hue) * 360) calc(var(--picker-saturation) * 100%)
        calc(var(--picker-lightness) * 100%)
    );
  }

  .color-picker-button {
    background-image: var(--translate-image);
    box-sizing: border-box;
    min-width: unset;
    width: auto;
    height: var(--picker-button-size);
    aspect-ratio: 1;

    margin: 1px;
    padding: 0;
    border: 2px solid white;
    border-radius: 2px;
    outline: #ccc solid 1px;

    &:focus {
      outline-style: revert;
      outline-color: black;
      outline-width: 3px;
      outline-offset: 4px;
    }

    .color-picker-button-bg {
      width: 100%;
      height: 100%;
      background-color: var(--picker-hsl);
      opacity: var(--picker-alpha);
    }
  }

  .panel-wrap {
    z-index: var(--picker-z-index);
    position: absolute;
    top: var(--picker-top);
    bottom: var(--picker-bottom);
    left: var(--picker-left);
    padding: 5px 0;
  }
</style>
