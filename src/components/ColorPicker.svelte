<script lang="ts" module>
  type Colors = [number, number, number];

  export interface ColorPickerState {
    /** 色相:0-1 彩度:0-1 明度:0-1 */
    hsv: Colors;
    alpha: number;
    /** `"#RRGGBB"`または`"#RRGGBBAA"` */
    hex: string;

    inputHex: string;
    setFromRgbaText(hexText: string): void;
  }
</script>

<script lang="ts">
  import { onMount, untrack } from "svelte";
  import ColorPickerPanel from "./ColorPickerPanel.svelte";

  let {
    hsv = $bindable([0, 0, 1]),
    alpha = $bindable(1),
    _hex = $bindable("#FFFFFF"),
    forId,
  }: {
    /** ラベルタグと対応づける値 */
    forId?: string;
    /** 色相:0-1 彩度:0-1 明度:0-1 */
    hsv?: Colors;
    alpha?: number;
    /** `"#RRGGBB"`または`"#RRGGBBAA"`. 読み取り専用(値を変更しても反映されません) */
    _hex?: string;
  } = $props();

  let showPanel = $state(false);
  let colorPickerButton: HTMLButtonElement;

  onMount(() => {
    document.addEventListener("mousedown", checkFocus);
    const parent = colorPickerButton.parentElement!;

    return () => {
      document.removeEventListener("mousedown", checkFocus);
    }

    function checkFocus(e: MouseEvent) {
      if (parent.contains(e.target as Node)) return;
      showPanel = false;
    }
  });

  const colorPickerState = $state<ColorPickerState>({
    get hsv() { return hsv; },
    set hsv(value) { hsv = value; },
    get alpha() { return alpha; },
    set alpha(value) { alpha = value; },
    get hex() { return _hex; },
    set hex(value) { _hex = value; },

    get inputHex() { return inputHex; },
    set inputHex(value) { inputHex = value; },
    setFromRgbaText,
  });

  // 初期値をHEXで設定します
  setFromRgbaText(_hex);
  let inputHex = $state(getRgb());

  $effect(() => {
    const hsv = colorPickerState.hsv;
    hsv[0]; hsv[1]; hsv[2];
    colorPickerState.alpha;
    untrack(() => {
      colorPickerState.hex = inputHex = getRgb();
    });
  });

  let hsl = $derived(getHsl());

  /**
   * 16進数のカラーコードで色をセットします
   * @param hexText `"#RRGGBB"`または`"#RRGGBBAA"`
   */
  export function setFromRgbaText(hexText: string) {
    if (!(hexText.length === 7 || hexText.length === 9)) return;
    if (hexText[0] !== "#") return;
    const r = parseInt(hexText.slice(1, 3), 16);
    const g = parseInt(hexText.slice(3, 5), 16);
    const b = parseInt(hexText.slice(5, 7), 16);
    const a = hexText.length === 7 ? 1 : parseInt(hexText.slice(7, 9), 16) / 255;
    if ([r, g, b, a].some(x => isNaN(x))) return;
    colorPickerState.hsv = rgbToHsv(r,g,b);
    colorPickerState.alpha = a;
  }

  function rgbToHsv(r: number, g: number, b: number): Colors {
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h, s, v = max;
    s = max === 0 ? 0 : diff / max;

    if (max === min) {
      h = 0;
    } else {
      h = r === max ? (g - b) / diff + (g < b ? 6 : 0) :
          g === max ? (b - r) / diff + 2 :
          (r - g) / diff + 4;
      h /= 6;
    }

    return [h, s, v];
  }

  function getHsl(): Colors {
    const [h, s, v] = colorPickerState.hsv;
    const l = v * (1 - s / 2);
    const newS = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

    return [h, newS, l];
  }

  function getRgb(): string {
    const [h, s, v] = colorPickerState.hsv;
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if(colorPickerState.alpha != 1) {
      hex += toHex(colorPickerState.alpha);
    }
    return hex;
  }

  function toHex(n: number): string {
    const v = Math.round(n * 255);
    if (v <= 15) return `0${v.toString(16).toUpperCase()}`;
    return v.toString(16).toUpperCase();
  }
</script>

<div
  style:--picker-panel-x={colorPickerState.hsv[1]}
  style:--picker-panel-y={1 - colorPickerState.hsv[2]}
  style:--picker-hue={hsl[0]}
  style:--picker-saturation={hsl[1]}
  style:--picker-lightness={hsl[2]}
  style:--picker-alpha={colorPickerState.alpha}
  class="color-picker"
>
  <button
    bind:this={colorPickerButton}
    id={forId}
    class="color-picker-button"
    aria-label="color-picker-switch"
    onclick={() => {
      showPanel = !showPanel;
    }}
    tabindex="-1"
    type="button"
  >
    <div class="color-picker-button-bg"></div>
  </button>
  {#if showPanel}
    <div class="panel-wrap">
      <ColorPickerPanel {colorPickerState} />
    </div>
  {/if}
</div>

<style>
  :root {
    --translate-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill-opacity=".1"><path d="M8 0h8v8H8zM0 8h8v8H0z" /></svg>');
    --picker-height: 220px;
    --picker-width: 200px;
    --picker-button-height: 14px;
    --picker-button-width: 14px;
    --picker-back-color: #333;
    --picker-slider-height: 24px;
    --picker-ring-color: white;
    --picker-ring-size: 28px;
    --picker-text-size: 16px;
    --picker-text-color: white;
    --picker-text-back-color: #121212;

    --pick-alpha: 1;
  }

  .color-picker {
    display: inline-block;
    user-select: none;
    position: relative;

    --picker-hsl: hsl(
      calc(var(--picker-hue) * 360)
      calc(var(--picker-saturation) * 100%)
      calc(var(--picker-lightness) * 100%)
    );
  }

  .color-picker-button {
    box-sizing: border-box;
    margin: 1px;
    border: 2px solid white;
    border-radius: 2px;
    padding: 0;
    outline: #ccc solid 1px;
    background-image: var(--translate-image);

    .color-picker-button-bg {
      width: var(--picker-button-width);
      height: var(--picker-button-height);
      background-color: var(--picker-hsl);
      opacity: var(--picker-alpha);
    }
  }

  .panel-wrap {
    position: absolute;
    bottom: 100%;
    left: -100px;
    padding: 5px 0;
  }
</style>
