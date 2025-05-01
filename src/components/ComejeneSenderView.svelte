<script lang="ts">
  import { ComejeneSenderStateText, type ComejeneSender } from "../comejene_share/ViewEnvironment";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { ComejeneSenderStore } from "../store/ComejeneSenderStore.svelte";

  const {
    sender: _sender,
  }: {
    sender: ComejeneSender;
  } = $props();

  const sender = notifierStore(_sender, () => {
    if (sender.state.type === "browserEx") return;
    ComejeneSenderStore.save(sender.state);
  });

  const statusText = $derived(ComejeneSenderStateText[sender.state.state]);
  const isBrowserEx = $derived(sender.state.type === "browserEx");

  function connectOrClose(sender: ComejeneSender) {
    if (sender.state === "open") {
      sender.close();
    } else {
      sender.connect();
    }
  }

  function deleteSender(sender: ComejeneSender) {
    ComejeneSenderStore.deleteSender(sender);
  }
</script>

<div class={`comejene_connector ${sender.state.type}`}>
  <div class="grid-status" title={statusText.title}>{statusText.kao}</div>
  <div class="grid-buttons">
    <button
      disabled={sender.state.state === "connecting"}
      onclick={() => connectOrClose(sender.state)}
      type="button"
    >
      {statusText.btn}
    </button>
    <button onclick={() => ComejeneSenderStore.sendResetAt(sender.state)} type="button">
      初期化
    </button>
    <button disabled={isBrowserEx} onclick={() => deleteSender(sender.state)} type="button">
      削除
    </button>
  </div>

  <div class="text">名前</div>
  <input disabled={isBrowserEx} type="text" bind:value={$sender.option.name} />

  <div class="text">URL</div>
  <input disabled={isBrowserEx} type="text" bind:value={$sender.option.url} />

  <div class="text" title="コメビュを開いた時に自動で接続します">自動接続</div>
  <input disabled={isBrowserEx} type="checkbox" bind:checked={$sender.option.autoConnect} />
</div>

<style>
  .text {
    font-weight: bold;
  }

  .comejene_connector {
    background-color: hsl(207, 93%, 83%);
    display: grid;
    width: 100%;
    box-sizing: border-box;
    padding: 0.5em;
    border-radius: 10px;

    grid-template: "a b" auto / auto 1fr;
    grid-gap: 0.4em 0.3em;

    &.browserEx {
      order: -1;
      background-color: hsl(38, 93%, 83%);
    }

    > input[type="text"] {
      box-sizing: border-box;
    }
    > input[type="checkbox"] {
      box-sizing: border-box;
      aspect-ratio: unset;
    }

    > div {
      align-self: center;
      justify-self: center;
      padding: 0 0.1em;
    }

    > .grid-status {
      justify-self: center;
      font-size: 1.5em;
    }

    > .grid-buttons {
      display: flex;
      gap: 0.8em;
      justify-self: auto;

      button {
        height: auto;
        align-self: center;
      }

      button:last-child {
        margin-left: auto;
      }
    }
  }
</style>
