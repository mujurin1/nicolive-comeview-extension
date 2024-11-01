<script lang="ts">
  import { onMount } from "svelte";
  import { Nicolive } from "../Platform";
  import Setting from "./setting/Setting.svelte";
  import { setting, settingViewStore } from "./view";

  let settingPage = $state<Setting>();
  onMount(() => {
    setting.page = settingPage!;
  });
</script>

<div class="header">
  <div class="left">
    <div class="head-item connect-item">
      <input placeholder="URL (lv ch user/)" size="18" type="text" bind:value={Nicolive.url} />
      {#if Nicolive.state === "opened"}
        <button onclick={() => Nicolive.close()} type="button">切断</button>
      {:else if Nicolive.state == "none" || Nicolive.state === "closed"}
        <button onclick={() => Nicolive.connect()} type="button">接続</button>
        {#if Nicolive.state === "closed"}
          <button onclick={() => Nicolive.reconnect()} type="button">再接続</button>
        {/if}
      {:else}
        <button disabled type="button">接続中</button>
        <button onclick={() => Nicolive.close()} type="button">切断</button>
      {/if}
    </div>

    {#if Nicolive.canFetchBackwardMessage}
      <div class="head-item">
        {#if Nicolive.isFetchingBackwardMessage}
          <div title="１セグメント毎の待機時間は１秒">過去コメント取得中‥</div>
          <button onclick={() => Nicolive.stopFetchBackward()} type="button"> 中断 </button>
        {:else}
          <div>過去コメント</div>
          <button
            onclick={() => Nicolive.fetchBackword(1)}
            title="過去コメントを500件ほど取得します"
            type="button"
          >
            少し
          </button>
          <button
            onclick={() => Nicolive.fetchBackword(1e10)}
            title="過去コメントを全て取得します"
            type="button"
          >
            全て
          </button>
        {/if}
      </div>
    {/if}

    <div class="head-item">
      <label for="speak">読み上げ</label>
      <input id="speak" type="checkbox" bind:checked={$settingViewStore.yomiage.isSpeak} />
    </div>

    <!-- <a href="./comejene.html" target="_blank">コメジェネXXXXXXXXXXXXXXXXXX</a> -->
  </div>

  <button class="setting-btn" onclick={() => settingPage?.switchOpen(true)} type="button">
    設定
  </button>
</div>

<Setting bind:this={settingPage} />

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
