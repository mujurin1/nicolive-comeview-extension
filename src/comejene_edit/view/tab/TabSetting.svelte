<script lang="ts">
  import { ComejeneSenderOBS } from "../../../comejene_share/ViewEnvironment";
  import ComejeneSenderView from "../../../components/ComejeneSenderView.svelte";
  import { ComejeneSenderStore } from "../../../store/ComejeneSenderStore.svelte";

  function addSender() {
    ComejeneSenderStore.addSender(ComejeneSenderOBS.createDefault());
  }
</script>

<div class="tab-setting">
  <div class="head-area">
    <button onclick={addSender} type="button">追加 (OBS用)</button>
  </div>

  <div class="senders">
    {#each Object.keys(ComejeneSenderStore.senders) as id (id)}
      <ComejeneSenderView sender={ComejeneSenderStore.senders[id]} />
    {/each}
  </div>
</div>

<style>
  .tab-setting {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
  }

  .senders {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
</style>
