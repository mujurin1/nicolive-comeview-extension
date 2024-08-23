<script lang="ts">
  import { Nicolive } from "../store/Nicolive.svelte";
  import { store } from "../store/store.svelte";
  import Setting from "./Setting.svelte";

  let showSetting = $state(false);
</script>

<div class="header">
  <div class="left">
    <div class="head-item connect-item">
      <input bind:value={Nicolive.url} size="18" placeholder="URL (lv ch user/)" />
      {#if Nicolive.connectComment}
        <button type="button" onclick={() => Nicolive.close()}>切断</button>
      {:else}
        <button type="button" onclick={() => Nicolive.connect()}>接続</button>
      {/if}
    </div>

    <div class="head-item connect-item">
      {#if Nicolive.connectWs && Nicolive.connectComment}
        <div title="接続に問題はありません！">😀</div>
      {:else if Nicolive.connectWs || Nicolive.connectComment}
        <div
          title={`接続中・・・
ws:${Nicolive.connectWs ? "ON" : "off"} co:${Nicolive.connectComment ? "ON" : "off"}
    ws: ウェブソケットの接続状態
    co: メッセージ(コメント)の接続状態
        `}
        >
          🙄
        </div>
      {:else if Nicolive.client != null}
        <div title="接続はありませんが過去コメントがある場合は取得できます">😴</div>
      {:else}
        <div title="接続状態を表すアイコンです">😶</div>
      {/if}

      {#if Nicolive.errorMessages.length > 0}
        <div title={Nicolive.errorMessages.join("\n")}>😡 {Nicolive.errorMessages.length}件</div>
      {/if}
    </div>

    {#if !Nicolive.allReceivedBackward}
      <div class="head-item">
        {#if Nicolive.client == null}
          <div>過去コメント －－</div>
        {:else}
          <div>過去コメント</div>
          <button
            type="button"
            title="過去コメントを1000件取得"
            onclick={() => Nicolive.fetchBackword(1000)}
          >
            千
          </button>
          <button
            type="button"
            title="過去コメントを全て取得"
            onclick={() => Nicolive.fetchBackword(1e10)}
          >
            全
          </button>
        {/if}
      </div>
    {/if}

    <div class="head-item">
      <label for="speak">読み上げ</label>
      <input type="checkbox" id="speak" bind:checked={store.yomiage.isSpeak} />
    </div>
  </div>

  <button class="setting-btn" type="button" onclick={() => (showSetting = !showSetting)}>
    設定
  </button>
</div>

<Setting bind:show={showSetting} />

<style>
  .header {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    white-space: nowrap;
    margin: 2px 4px;

    & > .left {
      display: flex;
      justify-content: space-between;
      white-space: nowrap;
      height: 100%;
      width: min-content;
      overflow: hidden;
    }
  }

  .head-item {
    display: flex;
    font-size: 1rem;
    height: 26px;
    box-sizing: border-box;

    &:not(:last-child) {
      margin-right: 10px;
    }

    &:not(.connect-item) {
      border-bottom: 2px solid dimgray;
    }

    &.connect-item {
      margin-right: 20px;
    }

    & > *:not(datalist) {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }

  .setting-btn {
    margin-right: 10px;
  }
</style>
