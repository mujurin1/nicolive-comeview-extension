<script lang="ts" generics="Name extends string">
  import type { Snippet } from "svelte";

  type NameDisplay = readonly (readonly [Name, string])[];

  let { names, currentTab = $bindable(), content, switchedTab }: {
    names: readonly Name[] | NameDisplay;
    currentTab: Name;
    content: Snippet<[Name]>;
    switchedTab?: (newTab: Name) => void;
  } = $props();

  const _names = $derived(
    typeof names[0] === "string"
      ? names.map(name => [name, name] as const) as NameDisplay
      : names as NameDisplay
  );

  function tabSwitch(newTab: Name) {
    if (currentTab === newTab) return;
    currentTab = newTab;
    switchedTab?.(newTab);
  }
</script>

<div class="tab">
  <div class="tab-header" role="tablist">
    {#each _names as [name, displayName] (name)}
      {@const selected = name === currentTab}
      <button class={`tab-name ${name}`} class:selected={selected} type="button" onclick={() => tabSwitch(name)}>
        {displayName}
      </button>
    {/each}
  </div>

  {@render content(currentTab)}
</div>

<style>
  .tab {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  @layer {
    .tab-header {
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      gap: 3px;
      padding: 5px 5px 5px 5px;
      height: 100%;
      box-sizing: border-box;

      & > .tab-name {
        height: 26px;
      
        font-size: 16px;
        color: #3d3d3d;
        background-color: #e2e2e2;

        padding: 1px 10px;
        min-width: 60px;
        border: none;
        border-radius: 8px;

        &:not(.selected):hover {
          opacity: .85;
        }

        &.selected {
          color: black;
          background-color: ghostwhite;
        }
      }
    }
  }
</style>
