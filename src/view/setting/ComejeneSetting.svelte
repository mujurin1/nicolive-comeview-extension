<script lang="ts">
  import { getDummyContent } from "../../comejene_edit/util/utils";
  import {
    ComejeneSenderOBS,
    ComejeneSenderStateText,
    type ComejeneSender,
  } from "../../comejene_share/ViewEnvironment";
  import ComejeneSenderView from "../../components/ComejeneSenderView.svelte";
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

<div class="senders">
  {#each Object.keys(ComejeneSenderStore.senders) as id (id)}
    <ComejeneSenderView sender={ComejeneSenderStore.senders[id]} />
  {/each}
</div>

<style>
  .senders {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
</style>
