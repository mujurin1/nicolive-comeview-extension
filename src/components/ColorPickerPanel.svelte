<script lang="ts">
  import { onMount } from "svelte";
  import { handleElementInteraction } from "../lib/DomEvent";
  import type { ColorPickerState } from "./ColorPicker.svelte";

  let { pickerState }: { pickerState: ColorPickerState } = $props();

  let pickerPanel: HTMLDivElement;
  let hueSlider: HTMLDivElement;
  let alphaSlider: HTMLDivElement;

  onMount(() => {
    const disposes = [
      handleElementInteraction(pickerPanel, {
        start: setSaturationAndLightness,
        mouseMove: setSaturationAndLightness,
      }),
      handleElementInteraction(hueSlider, {
        start: setHue,
        mouseMove: setHue,
      }),
      handleElementInteraction(alphaSlider, {
        start: setAlpha,
        mouseMove: setAlpha,
      }),
    ];

    return () => {
      for (const dispose of disposes) dispose();
    };
  });

  function setSaturationAndLightness(e: MouseEvent) {
    if (e.target == null) return;
    const { x, y } = pickerPanel.getBoundingClientRect();

    pickerState.setHsvAlpha(
      [
        pickerState.hsv?.[0] ?? 0,
        Math.max(0, Math.min(1, (e.clientX - x) / pickerPanel.clientWidth)),
        1 - Math.max(0, Math.min(1, (e.clientY - y) / pickerPanel.clientHeight)),
      ],
      pickerState.alpha
    );
    // if (colorPickerState.hsv == null) colorPickerState.hsv = [0, 0, 0];
    // colorPickerState.hsv[1] = Math.max(0, Math.min(1, (e.clientX - x) / pickerPanel.clientWidth));
    // colorPickerState.hsv[2] = 1 - Math.max(0, Math.min(1, (e.clientY - y) / pickerPanel.clientHeight));
  }
  function setHue(e: MouseEvent) {
    if (e.target == null) return;
    const { x } = hueSlider.getBoundingClientRect();
    pickerState.setHsvAlpha(
      [
        Math.max(0, Math.min(1, (e.clientX - x) / hueSlider.clientWidth)),
        pickerState.hsv?.[1] ?? 0,
        pickerState.hsv?.[2] ?? 0,
      ],
      pickerState.alpha
    );
    // if (colorPickerState.hsv == null) colorPickerState.hsv = [0, 0, 0];
    // colorPickerState.hsv[0] = Math.max(0, Math.min(1, (e.clientX - x) / hueSlider.clientWidth));
  }
  function setAlpha(e: MouseEvent) {
    if (e.target == null) return;
    const { x } = alphaSlider.getBoundingClientRect();
    pickerState.setHsvAlpha(
      pickerState.hsv,
      Math.max(0, Math.min(1, (e.clientX - x) / alphaSlider.clientWidth))
    );
    // colorPickerState.alpha = Math.max(0, Math.min(1, (e.clientX - x) / alphaSlider.clientWidth));
  }
</script>

<div class="color-picker-panel">
  <div class="picker-panel-wrap">
    <div bind:this={pickerPanel} class="picker-panel">
      {@render Pick()}
    </div>
  </div>
  <div class="picker-dummy"></div>
  <div bind:this={hueSlider} class="hue-slider">
    {@render Pick()}
  </div>
  <div bind:this={alphaSlider} class="alpha-slider">
    <div class="alpha-slider-bg">
      {@render Pick()}
    </div>
  </div>
  <div class="input-area">
    <input
      class="hex-input"
      placeholder="(未設定)"
      type="text"
      bind:value={pickerState.value}
    />
  </div>
</div>

{#snippet Pick()}
  <div class="picker-pick" tabindex="-1">
    <div class="pick-color"></div>
  </div>
{/snippet}

<style>
  * {
    box-sizing: border-box;
    --picker-hsl-non-null: var(--picker-hsl, hsl(0, 0% , 0%));
    --picker-hue-non-null: var(--picker-hue, 0);
  }

  .color-picker-panel {
    display: flex;
    flex-direction: column;
    background-color: var(--picker-back-color);
    height: var(--picker-height);
    width: var(--picker-width);
    padding: 6px;
    border-radius: 8px;
  }

  .picker-panel-wrap {
    flex: 1 1 0;
    padding-bottom: 12px;
    background-color: black;
    border-radius: 8px 8px 0 0;

    .picker-panel {
      height: 100%;
      background-image: linear-gradient(0deg, #000, #0000), linear-gradient(90deg, #fff, #0000);
      background-color: hsl(calc(var(--picker-hue-non-null) * 360) 100% 50%);
      border-radius: inherit;

      .picker-pick {
        --pick-top: calc(var(--picker-panel-y) * 100%);
        --pick-left: calc(var(--picker-panel-x) * 100%);
        --pick-color: var(--picker-hsl-non-null);
      }
    }
  }

  .hue-slider {
    flex: 0 0 auto;
    height: var(--picker-slider-height);
    background: linear-gradient(
      90deg, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red
    );

    .picker-pick {
      --pick-top: 50%;
      --pick-left: calc(var(--picker-hue-non-null) * 100%);
      --pick-color: hsl(calc(var(--picker-hue-non-null) * 360) 100% 50%);
    }
  }

  .alpha-slider {
    flex: 0 0 auto;
    height: var(--picker-slider-height);
    background-color: white;
    background-image: var(--translate-image);

    .alpha-slider-bg {
      width: 100%;
      height: 100%;
      background-image: linear-gradient(90deg, #0000, var(--picker-hsl-non-null));

      .picker-pick {
        --pick-top: 50%;
        --pick-left: calc(var(--picker-alpha) * 100%);
        --pick-color: var(--picker-hsl-non-null);
        --pick-alpha: var(--picker-alpha);
      }
    }
  }
  .input-area {
    flex: 0 0 auto;
    height: var(--picker-slider-height);

    .hex-input {
      width: 100%;
      height: 100%;
      border: none;
      font-size: var(--picker-text-size);
      padding: 0 4px;

      &:focus {
        outline: none;
      }
    }
  }

  .picker-pick {
    position: relative;
    width: var(--picker-ring-size);
    height: var(--picker-ring-size);
    transform: translate(-50%, -50%);
    border: 3px solid var(--picker-ring-color);
    border-radius: 50%;

    top: var(--pick-top);
    left: var(--pick-left);
    background-color: white;
    background-image: var(--translate-image);

    .pick-color {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background-color: var(--pick-color);
      opacity: var(--pick-alpha);
    }

    /* 親がフォーカスされたらこの要素にフォーカスすれば完璧 */
    &:focus-within,
    &:hover {
      outline: none;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
</style>
