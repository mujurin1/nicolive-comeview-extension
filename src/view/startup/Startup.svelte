<script lang="ts">
  import Tab from "../../components/Tab.svelte";
  import Features from "./Features.svelte";
  import PinnLives from "./PinnLives.svelte";

  const names = [
    ["pinned", "ピン留め"],
    ["feature", "機能紹介"],
  ] as const;
</script>

<div class="main">
  <Tab {names} currentTab="pinned">
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
    margin-top: 5px;
    height: 100%;

    .content {
      margin-top: 5px;
      padding: 5px 5px 50px 5px;
      overflow-y: auto;
    }

    :global(.tab-header) {
      background-color: #eee;

      :global(& > .tab-name) {
        flex: 1;
        height: auto;
        background-color: rgb(228, 228, 228);
        font-size: 18px;

        :global(&:not(.selected):hover) {
          background-color: rgb(223, 223, 223);
          box-shadow: 1px 1px 1px #aaa;
        }
        :global(&.selected) {
          background-color: rgb(245, 245, 245);
          box-shadow: 1px 1px 1px #aaa;
        }

        :global(&.feature) {
          background-color: hsl(350, 70%, 94%);
            :global(&:not(.selected):hover) {
            background-color: hsl(350, 70%, 92%);
          }
          :global(&.selected) {
            background-color: hsl(350, 80%, 94%);
          }
        }
      }
    }
  }
</style>
