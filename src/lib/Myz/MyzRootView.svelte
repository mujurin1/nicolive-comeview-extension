<script generics="Root extends MyzRoot, Setting extends MyzState<Root>" lang="ts">
  import ColorPicker from "svelte-awesome-color-picker";
  import type { MyzRoot, MyzState } from ".";
  import { notifierStore } from "../CustomStore.svelte";
  import Self from "./MyzRootView.svelte";
  import MyzSwitchView from "./MyzSwitchView.svelte";
  import MyzView from "./MyzView.svelte";

  let {
    style: _style = $bindable(),
    root,
    indent = 1,
    path,
  }: {
    style: Setting;
    root: Root;
    indent?: number;
    path: string;
  } = $props();

  let style = notifierStore(
    _style,
    () => {
      _style = style.state;
    }
  );
</script>

{#each Object.keys(root.block) as key (key)}
  {@const object = root.block[key]}
  {@const forId = path + key}
  {#if object.type === "number"}
    <MyzView {forId} {object}>
      {#if object.control === "range"}
        <div style:width="2em">{$style[key]}</div>
      {/if}
      <input
        id={forId}
        max={object.max}
        min={object.min}
        step={object.step}
        type={object.control}
        bind:value={$style[key]}
      >
    </MyzView>
  {:else if object.type === "string"}
    <MyzView {forId} {object}>
      <input id={forId} type="text" bind:value={$style[key]}>
    </MyzView>
  {:else if object.type === "boolean"}
    <MyzView {forId} {object}>
      <input id={forId} type="checkbox" bind:checked={$style[key] as boolean}>
    </MyzView>
  {:else if object.type === "color"}
    <MyzView {object}>
      <div class="color-picker-wrap">
        <ColorPicker
          --input-size="15px"
          --picker-height="150px"
          --picker-width="150px"
          isTextInput={false}
          label={$style[key] ?? "透明"}
          nullable={object.extra.optional}
          bind:hex={$style[key]}
        />
      </div>
    </MyzView>
  {:else if object.type === "list"}
    <MyzView {forId} {object}>
      <select id={forId} bind:value={$style[key]}>
        {#each object.choices as value (value)}
          <option {value}>{value}</option>
        {/each}
      </select>
    </MyzView>
  {:else if object.type === "block"}
    <div class="myz-block-label">{object.display}</div>
    <div style:--indent={`${indent}em`}>
      <Self
        indent={indent+1}
        path={path+key}
        root={root.block[key] as any}
        bind:style={$style[key]}
      />
    </div>
  {:else if object.type === "switch"}
    <MyzSwitchView
      display={object.display}
      path={path+key}
      switch={object as any}
      bind:style={$style[key]}
    />
  {/if}
{/each}

<style>
  .myz-block-label {
    cursor: default;
    padding-left: var(--indent);
  }

  /* svelte-awesome-color-picker 内のCSSを変えているのでバージョンが変わると壊れる可能性 */
  .color-picker-wrap {
    display: flex;

    /* #7桁以外の値をいれると重くなる対策 */
    :global(& input[type="color"]) {
      display: none;
    }

    :global(& > * .color-picker > label) {
      display: flex;
      align-items: center;
      margin: 0;
    }

    :global(& > * .wrapper) {
      top: 0px;
      transform: translate(-50%, -100%);
    }
  }
</style>
