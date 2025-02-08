<script lang="ts">
  import { getDummyContent } from "../../comejene_edit/utils";
  import { ComejeneSenderStateText } from "../../comejene_share/ViewEnvironment";
  import { ComejeneSenderController } from "../../service/ComejeneSenderController.svelte";

  const DEFAULT_WS_URL = "ws://localhost:4455";

  function addSender() {
    const setting = ComejeneSenderController.create("obs");
    setting.name = `${setting.type}-${setting.id}`;
    setting.options.url = DEFAULT_WS_URL;
  }

  function dbg_send_content(icon = "", name = "あname", message = getDummyContent()) {
    const content = { icon, name, message };
    ComejeneSenderController.sendContent(content);
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

  {#each ComejeneSenderController.senders as sender (sender)}
    {@const text = ComejeneSenderStateText[sender.state]}
    {@const disableUrl = sender.state === "open" || sender.state === "connecting"}
    {@const urlTitle = disableUrl ? "接続中はURLは変更不可です" : undefined}
    <div><div title={text.title}>{text.kao}</div></div>
    <div>
      {#if sender.state !== "open"}
        <button
          disabled={sender.state === "connecting"}
          onclick={() => ComejeneSenderController.connectAt(sender)}
          type="button"
        >
          接続
        </button>
      {:else}
        <button onclick={() => ComejeneSenderController.closeAt(sender)} type="button">
          切断
        </button>
      {/if}
    </div>
    <div><input class="input-name" type="text" bind:value={sender.name} /></div>
    <div>
      <input
        class="input-url"
        disabled={disableUrl}
        title={urlTitle}
        type="text"
        bind:value={sender.options.url}
      />
    </div>
    <div>
      <button onclick={() => ComejeneSenderController.sendResetAt(sender)} type="button">
        初期化
      </button>
    </div>
    <div>
      <button onclick={() => ComejeneSenderController.closeAndDeleteAt(sender)} type="button">
        削除
      </button>
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
    grid-template: "a b c d e" auto / auto auto 1fr 10em auto auto;

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
