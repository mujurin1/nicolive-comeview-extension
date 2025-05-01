<script lang="ts">
  import Tab from "../../components/Tab.svelte";
  import TabFrame from "./tab/TabFrame.svelte";
  import TabSetting from "./tab/TabSetting.svelte";
  import TabTemplate from "./tab/TabTemplate.svelte";

  const names = [
    ["template", "テンプレート"],
    ["frame", "フレーム"],
    ["setting", "一般設定&ヘルプ"],
  ] as const;
</script>

<div class="main">
  <!-- このエラーは svelte の不具合ぽいので無視する -->
  <Tab currentTab="setting" {names}>
    {#snippet content(tabId)}
      <div class="content">
        {#if tabId === "template"}
          <TabTemplate />
        {:else if tabId === "frame"}
          <TabFrame />
        {:else if tabId === "setting"}
          <TabSetting />
        {/if}
      </div>
    {/snippet}
  </Tab>
</div>

<style>
  .content {
    padding: 0 0.5em;
  }

  .main {
    :global(.tab-header) {
      gap: 0.4em;
      padding-bottom: 1em;

      :global(& > .tab-name) {
        flex: 1 1 max-content;
        height: auto;
        background-color: hsl(192, 30%, 92%);
        font-size: 1em;

        :global(&:not(.selected):hover) {
          box-shadow: 1px 1px 1px #aaa;
        }
        :global(&.selected) {
          background-color: hsl(51, 80%, 93%);
          box-shadow: 1px 1px 1px #aaa;
        }

        /* 特定のヘッダーのみ */
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
