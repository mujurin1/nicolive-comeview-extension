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

<div class="setting-area">
  <!-- このエラーは svelte の不具合ぽいので無視する -->
  <Tab currentTab="template" {names}>
    {#snippet content(tabId)}
      <div class="content">
        <div class:hide={tabId !== "template"}><TabTemplate /></div>
        <div class:hide={tabId !== "frame"}><TabFrame /></div>
        <div class:hide={tabId !== "setting"}><TabSetting /></div>
      </div>
    {/snippet}
  </Tab>
</div>

<style>
  .content {
    height: 100%;

    > div {
      padding: 0 0.5em;
      height: 100%;
    }
  }

  .setting-area {
    height: 100%;

    :global(.tab-header) {
      gap: 0.4em;
      padding-bottom: 1em;

      :global(& > .tab-name) {
        flex: 1 1 max-content;
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

  .hide {
    display: none;
  }
</style>
