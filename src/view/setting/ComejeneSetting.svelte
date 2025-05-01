<script lang="ts">
  import { getDummyContent } from "../../comejene_edit/util/utils";
  import {
    ComejeneSenderOBS,
    ComejeneSenderStateText,
    type ComejeneSender,
  } from "../../comejene_share/ViewEnvironment";
  import { ComejeneSenderStore } from "../../store/ComejeneSenderStore.svelte";

  function addSender() {
    ComejeneSenderStore.addSender(ComejeneSenderOBS.createDefault());
  }

  function dbg_send_content(icon = "", name = "あname", message = getDummyContent()) {
    const content = { icon, name, message };
    ComejeneSenderStore.sendContent(content);
  }

  function deleteSender(sender: ComejeneSender) {
    ComejeneSenderStore.deleteSender(sender);
  }
</script>

<div>
  <a href={`chrome-extension://${chrome.runtime.id}/comejene_edit`} target="_blank">
    コメジェネ設定画面
  </a>
  で見た目を編集出来ます
</div>

<div>
  <button onclick={addSender} type="button">追加</button>
  <button type="button">一括初期化</button>
  <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
</div>

<div class="comejene-client-list">
  <div class="list-head">状態</div>
  <div class="list-head">接続</div>
  <div class="list-head">接続名(任意)</div>
  <div class="list-head">URL</div>
  <div class="list-head">初期化</div>
  <div class="list-head">削除</div>

  {#each Object.keys(ComejeneSenderStore.senders) as id (id)}
    {@const sender = ComejeneSenderStore.senders[id]}
    {@const text = ComejeneSenderStateText[sender.state]}
    {@const disableUrl = sender.state === "open" || sender.state === "connecting"}
    {@const urlTitle = disableUrl ? "接続中はURLは変更不可です" : undefined}

    <div title={text.title}>{text.kao}</div>
    <div>
      {#if sender.state !== "open"}
        <button
          disabled={sender.state === "connecting"}
          onclick={() => {
            sender.connect();
          }}
          type="button"
        >
          接続
        </button>
      {:else}
        <button onclick={() => sender.close()} type="button">切断</button>
      {/if}
    </div>
    <div><input class="input-name" type="text" bind:value={sender.option.name} /></div>
    <div>
      <input
        class="input-url"
        disabled={disableUrl}
        title={urlTitle}
        type="text"
        bind:value={sender.option.url}
      />
    </div>
    <div>
      <button onclick={() => ComejeneSenderStore.sendResetAt(sender)} type="button">
        初期化
      </button>
    </div>
    <div>
      <button onclick={() => deleteSender(sender)} type="button">削除</button>
    </div>
  {/each}
</div>

<style>
  button {
    min-width: unset !important;
  }

  input[type="text"] {
    box-sizing: border-box;
    width: 100%;
  }

  .comejene-client-list {
    display: grid;
    gap: 5px 10px;
    grid-template: "a b c d e" auto / auto auto 1fr 1fr auto auto;

    > .list-head {
      font-weight: bold;
    }

    > div {
      white-space: nowrap;
      text-align: center;
      /* background-color: #d75959a0; */
    }
  }
</style>
