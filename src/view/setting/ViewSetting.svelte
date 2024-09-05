<script lang="ts">
  import FormatSetting from "../../components/FormatSetting.svelte";
  import { settingStore } from "../Setting.svelte";

  let tabOpened = $state({
    デフォルト: true,
    生主: false,
    システムメッセージ: false,
    初コメ: false,
  });
</script>

<h2 style="margin: 0 0 10px 0; text-align: center;">コメントビュー設定</h2>

<div class="content">
  <details class="item" bind:open={tabOpened.デフォルト}>
    <summary class="tab">デフォルト （全ての項目の初期値）</summary>
    {#if tabOpened.デフォルト}
      <div class="format">
        <FormatSetting bind:format={$settingStore.commentView.commentFormats.default} />
      </div>
    {/if}
  </details>

  <details class="item" bind:open={tabOpened.生主}>
    <summary class="tab">生主</summary>
    {#if tabOpened.生主}
      <div class="format">
        <FormatSetting bind:format={$settingStore.commentView.commentFormats.owner} />
      </div>
    {/if}
  </details>

  <details class="item" bind:open={tabOpened.初コメ}>
    <summary class="tab">初コメ</summary>
    {#if tabOpened.初コメ}
      <div class="format">
        <FormatSetting bind:format={$settingStore.commentView.commentFormats.first} />
      </div>
    {/if}
  </details>

  <details class="item" bind:open={tabOpened.システムメッセージ}>
    <summary class="tab">システムメッセージ</summary>
    {#if tabOpened.システムメッセージ}
      <div class="format">
        <FormatSetting bind:format={$settingStore.commentView.commentFormats.system} />
      </div>
    {/if}
  </details>
</div>

<style>
  .content {
    .item {
      background-color: #dfe7dc97;
      box-sizing: border-box;
      border-radius: 7px;
    }

    & > *:not(:last-child) {
      margin-bottom: 5px;
    }
  }

  .tab {
    padding: 5px;
  }
  .format {
    padding: 0 7px 3px 7px;
  }
</style>
