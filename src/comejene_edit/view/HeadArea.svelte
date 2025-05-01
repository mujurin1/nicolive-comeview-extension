<script lang="ts">
  import { ComejeneSenderStore } from "../../store/ComejeneSenderStore.svelte";

  function senderReset() {
    ComejeneSenderStore.sendReset();
  }

  function senderDummy() {
    ComejeneSenderStore.sendDummyContent();
  }
</script>

<div class="head-area">
  <button onclick={senderReset} type="button">初期化</button>
  <button onclick={senderDummy} type="button">コメント送信</button>
</div>

<style>
  .head-area {
    padding: 0.4em;
  }
</style>
