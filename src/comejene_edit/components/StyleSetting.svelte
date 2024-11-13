<script generics="Definition extends MyzRoot, Setting extends MyzState<Definition>" lang="ts">
  import ColorPicker from "svelte-awesome-color-picker";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import type { MyzRoot, MyzState } from "../../lib/Myz";
  import SettingColumn from "./SettingColumn.svelte";
  import Self from "./StyleSetting.svelte";

  let {
    style: _style = $bindable(),
    definition,
    indent = 1,
    path,
  }: {
    style: Setting;
    definition: Definition;
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

{#each Object.keys(definition.blocks) as key (key)}
  {@const object = definition.blocks[key]}
  {@const forId = path + key}
  {#if object.type === "number"}
    <SettingColumn {forId} meta={object}>
      <input
        id={forId}
        max={object.max}
        min={object.min}
        step={object.step}
        type="number"
        bind:value={$style[key]}
      >
    </SettingColumn>
  {:else if object.type === "string"}
    <SettingColumn {forId} meta={object}>
      <input id={forId} type="text" bind:value={$style[key]}>
    </SettingColumn>
  {:else if object.type === "boolean"}
    <SettingColumn {forId} meta={object}>
      <input id={forId} type="checkbox" bind:checked={$style[key] as boolean}>
    </SettingColumn>
  {:else if object.type === "color"}
    <SettingColumn meta={object}>
      <div class="color-picker-wrap">
        <ColorPicker
          --input-size="15px"
          --picker-height="150px"
          --picker-width="150px"
          isTextInput={false}
          label={$style[key] as string ?? "透明"}
          nullable
          bind:hex={$style[key] as string}
        />
      </div>
    </SettingColumn>
  {:else if object.type === "list"}
    <SettingColumn {forId} meta={object}>
      <select id={forId} bind:value={$style[key]}>
        {#each object.choices as value (value)}
          <option {value}>{value}</option>
        {/each}
      </select>
    </SettingColumn>
  {:else if object.type === "block"}
  <!-- {:else} -->
    <div class="setting-block-label">{object.display ?? key}</div>
    <div style:--indent={`${indent}em`} class="setting-block-indent">
      <Self
        definition={definition.blocks[key] as any}
        indent={indent+1}
        path={path+key}
        bind:style={$style[key] as any}
      />
    </div>
  {/if}
{/each}

<style>
  input {
    margin: 0;
    padding: 0;

    &[type="number"]{
      width: 100%;
    }
  }


  :global(.setting-block-label) {
    cursor: default;
    padding-left: var(--indent);
  }
  :global(.setting-block-indent) { }

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
