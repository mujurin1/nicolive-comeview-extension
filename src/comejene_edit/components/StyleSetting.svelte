<script lang="ts">
  import ColorPicker from "svelte-awesome-color-picker";
  import { type StyleColumn, type StyleDefinition, type StyleSetting } from "../../comejene_share";
  import SettingColumn from "./SettingColumn.svelte";
  import Self from "./StyleSetting.svelte";

  let {
    contents,
    definition,
    indent = 1,
  }: {
    contents: StyleSetting;
    definition: StyleDefinition;
    indent?: number;
  } = $props();
</script>


{#each Object.keys(definition) as key (key)}
{@const column: StyleColumn = definition[key]}
  {#if column === "number"}
    <SettingColumn name={key}>
      <input id={key} type="number" bind:value={contents[key]}>
    </SettingColumn>
  {:else if column === "string"}
    <SettingColumn name={key}>
      <input id={key} type="text" bind:value={contents[key]}>
    </SettingColumn>
  {:else if column === "boolean"}
    <SettingColumn name={key}>
      <input id={key} type="checkbox" bind:checked={contents[key] as boolean}>
    </SettingColumn>
  {:else if column === "color"}
    <SettingColumn name={key} noLabelFor>
      <div class="color-picker-wrap">
        <ColorPicker
          --input-size="15px"
          --picker-height="150px"
          --picker-width="150px"
          isTextInput={false}
          label={contents[key] as string ?? "透明"}
          nullable
          bind:hex={contents[key] as string}
        />
      </div>
    </SettingColumn>
  {:else if Array.isArray(column)}
    <SettingColumn name={key}>
      <select id={key} bind:value={contents[key]}>
        {#each column as value (value)}
          <option {value}>{value}</option>
        {/each}
      </select>
    </SettingColumn>
  {:else}
    <div class="setting-block-label">{key}</div>
    <div style:--indent={`${indent}em`} class="setting-block-indent">
      <Self
        contents={contents[key] as StyleSetting}
        definition={column as StyleDefinition}
        indent={indent+1}
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
