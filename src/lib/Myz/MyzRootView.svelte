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
    indent = 0,
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

  const map = createMap();

  function createMap() {
    const map = new Map<string, MyzRoot["block"]>();
    for (const [key, value] of Object.entries(root.block)) {
      const group = value.group ?? "undefined";
      const root = map.get(group);
      if (root == null) {
        map.set(group, { [key]: value });
        continue;
      }
      root[key] = value;
    }
    return map;
  }
</script>

<div class="myz-wrap" style:--indent={`${indent}em`}>
  {#each map.keys() as key (key)}
    {@const block = map.get(key)!}
    <div class="myz-gruop">
      {@render ShowContents(block)}
    </div>
  {/each}
</div>

{#snippet ShowContents(block: MyzRoot["block"])}
  {#each Object.keys(block) as key (key)}
    {@const object = block[key]}
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
        <Self
          indent={indent + 1}
          path={path + key}
          root={block[key] as any}
          bind:style={$style[key]}
        />
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
{/snippet}

<style>
  .myz-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 3px;
    padding-left: var(--indent);

    .myz-gruop {
      flex: 1;
      background-color: #a3a3ff6f;
    }
  }
</style>
