<script generics="Root extends MyzRoot, Setting extends MyzState<Root>" lang="ts">
  import type { MyzRoot, MyzState } from ".";
  import ColorPicker from "../../components/ColorPicker.svelte";
  import { notifierStore } from "../CustomStore.svelte";
  import Expand from "./Expand.svelte";
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

  let style = notifierStore(_style, () => {
    _style = style.state;
  });
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
      />
    </MyzView>
  {:else if object.type === "string"}
    <MyzView {forId} {object}>
      <input id={forId} type="text" bind:value={$style[key]} />
    </MyzView>
  {:else if object.type === "boolean"}
    <MyzView {forId} {object}>
      <input id={forId} type="checkbox" bind:checked={$style[key] as boolean} />
    </MyzView>
  {:else if object.type === "color"}
    <MyzView {forId} {object}>
      <ColorPicker --picker-left="-100px" {forId} bind:value={$style[key]} />
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
    <Expand show={object.defaultOpen} title={object.display}>
      <div style:--indent={`${indent}em`}>
        <Self
          indent={indent + 1}
          path={path + key}
          root={root.block[key] as any}
          bind:style={$style[key]}
        />
      </div>
    </Expand>
  {:else if object.type === "switch"}
    <MyzSwitchView
      display={object.display}
      path={path + key}
      switch={object as any}
      bind:style={$style[key]}
    />
  {/if}
{/each}
