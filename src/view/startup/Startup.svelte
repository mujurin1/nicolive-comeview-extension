<script lang="ts">
  import Tab from "../../components/Tab.svelte";
  import Features from "./Features.svelte";
  import PinnLives from "./PinnLives.svelte";

  const names = [
    ["pinned", "ピン留め"],
    ["feature", "機能紹介 (v0.3.1)"],
  ] as const;
</script>

<div class="main">
  <Tab currentTab="pinned" {names}>
    {#snippet content(tabId)}
      <div class="content">
        {#if tabId === "pinned"}
          <PinnLives />
        {:else if tabId === "feature"}
          <Features />
        {/if}
      </div>
    {/snippet}
  </Tab>
</div>

<style>
  .main {
    box-sizing: border-box;
    height: 100%;

    .content {
      padding: 5px 5px 50px 5px;
      overflow-y: auto;
    }

    :global(.tab-header) {
      :global(& > .tab-name) {
        flex: 1;
        height: auto;
        background-color: hsl(0, 0%, 95%);
        font-size: 18px;

        :global(&:not(.selected):hover) {
          background-color: hsl(0, 0%, 95%);
          box-shadow: 1px 1px 1px #aaa;
        }
        :global(&.selected) {
          background-color: hsl(0, 0%, 96%);
          box-shadow: 1px 1px 1px #aaa;
        }

        :global(&.feature) {
          background-color: hsl(100, 70%, 94%);
          :global(&:not(.selected):hover) {
            background-color: hsl(100, 70%, 92%);
          }
          :global(&.selected) {
            background-color: hsl(100, 80%, 94%);
          }
        }
      }
    }
  }
</style>
