<script lang="ts" generics="Name extends string">
  import type { Snippet } from "svelte";

  let { names, currentTab = $bindable(), content, switchedTab }: {
    names: readonly Name[];
    currentTab: Name;
    content: Snippet<[Name]>;
    switchedTab?: (newTab: Name) => void;
  } = $props();

  function tabSwitch(newTab: Name) {
    if (currentTab === newTab) return;
    currentTab = newTab;
    switchedTab?.(newTab);
  }
</script>

<div class="tab">
  <div class="tab-header" role="tablist">
    {#each names as tabName (tabName)}
      {@const selected = tabName === currentTab}
      <button class="tab-name" class:selected={selected} type="button" onclick={() => tabSwitch(tabName)}>{tabName}</button>
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
