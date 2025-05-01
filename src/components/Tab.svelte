<script generics="Name extends string" lang="ts">
  import type { Snippet } from "svelte";

  type NameDisplay = readonly (readonly [Name, string])[];

  let {
    names,
    currentTab = $bindable(),
    content,
    switchedTab,
  }: {
    names: readonly Name[] | NameDisplay;
    currentTab: Name;
    content: Snippet<[Name]>;
    switchedTab?: (newTab: Name) => void;
  } = $props();

  const _names = $derived(
    typeof names[0] === "string"
      ? (names.map(name => [name, name] as const) as NameDisplay)
      : (names as NameDisplay),
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
      <button
        class={`tab-name ${name}`}
        class:selected
        onclick={() => tabSwitch(name)}
        type="button"
      >
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
      gap: 0.3em;
      padding: 0.4em;
      height: 100%;
      box-sizing: border-box;

      & > .tab-name {
        font-size: 1.3em;
        color: #3d3d3d;
        background-color: #e2e2e2;

        padding: 0.1em 0.6em;
        border: none;
        border-radius: 8px;

        &:not(.selected):hover {
          filter: sepia(8%);
        }

        &.selected {
          color: black;
          background-color: ghostwhite;
        }
      }
    }
  }
</style>
