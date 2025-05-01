<script lang="ts">
  import {
    ComejeneSenderStateText,
    ComejeneTypeText,
    type ComejeneSender,
    type ComejeneSenderOption,
  } from "../comejene_share/ViewEnvironment";
  import { ComejeneSenderStore } from "../store/ComejeneSenderStore.svelte";

  const {
    sender,
  }: {
    sender: ComejeneSender;
  } = $props();

  const statusText = $derived(ComejeneSenderStateText[sender.state]);
  const typeText = $derived(ComejeneTypeText[sender.type]);
  const isBrowserEx = $derived(sender.type === "browserEx");

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

<div class="comejene_connector" class:browserEx={isBrowserEx}>
  <div class="grid-status" title={statusText.title}>{statusText.kao}</div>
  <div class="grid-buttons">
    <button
      disabled={sender.state === "connecting"}
      onclick={() => connectOrClose(sender)}
      type="button"
    >
      {statusText.btn}
    </button>
    <button onclick={() => ComejeneSenderStore.sendResetAt(sender)} type="button">初期化</button>
    <button disabled={isBrowserEx} onclick={() => deleteSender(sender)} type="button">削除</button>
  </div>
  <div class="text">名前</div>
  <input disabled={isBrowserEx} type="text" bind:value={sender.option.name} />
  <div class="text">URL</div>
  <input disabled={isBrowserEx} type="text" bind:value={sender.option.url} />
</div>

<style>
  .comejene_connector {
    background-color: hsl(38, 93%, 83%);
    display: grid;
    width: 100%;
    box-sizing: border-box;
    padding: 0.5em;
    border-radius: 10px;

    grid-template:
      "status buttons   " auto
      "name   name-input" auto
      "url    url-input " auto / auto 1fr;
    grid-gap: 0.4em 0.3em;

    &.browserEx {
      order: -1;
      background-color: hsl(207, 93%, 83%);
    }

    > input[type="text"] {
      box-sizing: border-box;
    }

    > div {
      align-self: center;
      justify-self: center;
      padding: 0 0.1em;
    }

    > .text {
      font-weight: bold;
    }

    > .grid-status {
      grid-area: status;
      justify-self: center;
      font-size: 1.5em;
    }

    > .grid-buttons {
      display: flex;
      gap: 0.8em;
      grid-area: buttons;
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
