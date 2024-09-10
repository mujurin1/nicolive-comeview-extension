<script lang="ts">
  import Tab from "../../components/Tab.svelte";
  import Features from "./Features.svelte";
  import PinnLives from "./PinnLives.svelte";

</script>

<div class="content-wrap">
  <div class="content">
    <Tab names={["ピン留め", "機能紹介", "フィードバック"]} currentTab="ピン留め">
      {#snippet content(tabId)}
        <div style="margin-top: 20px;">
          {#if tabId === "ピン留め"}
            <PinnLives />
          {:else if tabId === "機能紹介"}
            <Features />
          {:else if tabId === "フィードバック"}
            <div></div>
          {/if}
        </div>
      {/snippet}
    </Tab>
  </div>
</div>

<style>
  .content-wrap {
    box-sizing: border-box;
    height: 100%;
    padding: 15px;
    overflow: hidden;
  }

  .content {
    box-sizing: border-box;
    padding: 15px;
    height: 100%;
    overflow: auto;
    border: 3px solid black;
  }

  * {
    :global(.tab-header) {
      background-color: #eee;

      :global(& > .tab-name) {
        flex: 1;
        height: auto;
        background-color: transparent;
        font-size: 18px;

        :global(&:not(.selected):hover) {
          color: #303030;
          background-color: #e8e8e8;
          box-shadow: 1px 1px 1px #aaa;
        }

        :global(&.selected) {
          background-color: ghostwhite;
          box-shadow: 1px 1px 1px #aaa;
        }
      }
    }
  }
</style>
