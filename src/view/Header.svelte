<script lang="ts">
  import { onMount } from "svelte";
  import { Nicolive } from "../Platform";
  import Setting, { settingStore } from "./setting/Setting.svelte";
  import { setting } from "./view";

  let settingPage = $state<Setting>();
  onMount(() => {
    setting.page = settingPage!;
  });

  // let dbgCommentId = 1;
  // let dbgComment = $state("@こて@よび");
  // function sendDbgComment() {
  //   Nicolive.dbgAddMessage({
  //     type: "user",
  //     is184: true,
  //     messageId: `${dbgCommentId++}`,
  //     userId: "#1",
  //     no: -1,
  //     iconUrl: undefined,
  //     name: undefined,
  //     time: "time",
  //     content: dbgComment,
  //     link: undefined,
  //     includeSharp: false,
  //   });
  // }
</script>

<div class="header">
  <div class="left">
    <div class="head-item connect-item">
      <input type="text" bind:value={Nicolive.url} size="18" placeholder="URL (lv ch user/)" />
      {#if Nicolive.state === "none" || Nicolive.state === "disconnected"}
        <button type="button" onclick={() => Nicolive.connect()}>接続</button>
      {:else if Nicolive.state === "opened"}
        <button type="button" onclick={() => Nicolive.close()}>切断</button>
      {:else}
        <button type="button" disabled>接続中</button>
      {/if}
    </div>

    <!-- デバッグ用
      <div>
        <button type="button" onclick={sendDbgComment}>テスト</button>
        <input type="text" bind:value={dbgComment} />
      </div>
     -->

    <div class="head-item">
      {#if Nicolive.state === "none"}
        <div title="接続状態を表すアイコンです">😶</div>
      {:else if Nicolive.state === "opened"}
        <div title="接続に問題はありません！">😀</div>
      {:else if Nicolive.state === "connecting"}
        <div
          title={`接続中・・・
ws:${Nicolive.connectWs ? "ON" : "off"} co:${Nicolive.connectComment ? "ON" : "off"}
    ws: ウェブソケットの接続状態
    co: メッセージ(コメント)の接続状態
        `}
        >
          🙄
        </div>
      {:else if Nicolive.state === "reconnecting" || Nicolive.state === "reconnect_failed"}
        <div title={`ネットワークエラーまたは再接続要求により再接続中です`}>😥 再接続中‥</div>
      {:else if Nicolive.state === "disconnected"}
        <div title="現在接続していませんが、過去コメントがある場合は取得できます">😴</div>
      {/if}

      {#if Nicolive.errorMessages.length > 0}
        <div title={Nicolive.errorMessages.join("\n")}>😡 {Nicolive.errorMessages.length}件</div>
      {/if}
    </div>

    {#if Nicolive.canFetchBackwaardMessage}
      <div class="head-item">
        {#if Nicolive.isFetchingBackwardMessage}
          <div title="１セグメント毎の待機時間は１秒">過去コメント取得中‥</div>
          <button type="button" onclick={() => Nicolive.client?.stopFetchBackwardMessages()}>
            中断
          </button>
        {:else}
          <div>過去コメント</div>
          <button
            type="button"
            title="過去コメントを500件ほど取得します"
            onclick={() => Nicolive.fetchBackword(1)}
          >
            少し
          </button>
          <button
            type="button"
            title="過去コメントを全て取得します"
            onclick={() => Nicolive.fetchBackword(1e10)}
          >
            全て
          </button>
        {/if}
      </div>
    {/if}

    <div class="head-item">
      <label for="speak">読み上げ</label>
      <input type="checkbox" id="speak" bind:checked={$settingStore.yomiage.isSpeak} />
    </div>
  </div>

  <button class="setting-btn" type="button" onclick={() => settingPage?.switchOpen(true)}>
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
