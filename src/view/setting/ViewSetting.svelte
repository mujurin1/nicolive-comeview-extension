<script lang="ts">
  import FormatSetting from "../../components/FormatSetting.svelte";
  import { settingViewStore } from "../view";

  let tabOpened = $state({
    default: true,
    owner: false,
    system: false,
    first: false,
  });
</script>

<h2 style:font-size="1.3rem" style:margin="0 0 10px 0" style:text-align="center">
  コメントフォーマット設定
</h2>

<div class="content">
  <details class="item" bind:open={tabOpened.default}>
    <summary class="tab">デフォルト （全てのコメントフォーマットの初期値）</summary>
    {#if tabOpened.default}
      <div class="format">
        <FormatSetting bind:format={$settingViewStore.commentView.commentFormats.default} />
      </div>
    {/if}
  </details>

  <details class="item" bind:open={tabOpened.owner}>
    <summary class="tab">生主</summary>
    {#if tabOpened.owner}
      <div class="format">
        <FormatSetting bind:format={$settingViewStore.commentView.commentFormats.owner} />
      </div>
    {/if}
  </details>

  <details class="item" bind:open={tabOpened.first}>
    <summary class="tab">初コメ</summary>
    {#if tabOpened.first}
      <div class="format">
        <FormatSetting bind:format={$settingViewStore.commentView.commentFormats.first} />
      </div>
    {/if}
  </details>

  <details class="item" bind:open={tabOpened.system}>
    <summary class="tab">システムメッセージ</summary>
    {#if tabOpened.system}
      <div class="format">
        <FormatSetting bind:format={$settingViewStore.commentView.commentFormats.system} />
      </div>
    {/if}
  </details>
</div>

<div style:font-size="10px" style:color="#999">
  ※コメントビューの詳細な見た目の設定は対応予定
  （アイコンや名前など項目の並び替えや非表示。枠線の色の変更など）
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
