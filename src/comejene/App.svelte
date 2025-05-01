<script lang="ts">
  import { ComejeneState } from "./ComejeneState.svelte";
  import ComejeneView from "./ComejeneView.svelte";

  const comejeneState = new ComejeneState();
</script>

{#if comejeneState.viewState == null}
  <div class="initialize-message">
    <div>実行環境: {comejeneState.env}</div>
    <div>コメントビューアで「初期化」をして下さい</div>
  </div>
{:else}
  {#key comejeneState.viewState}
    <ComejeneView viewState={comejeneState.viewState} />
  {/key}
{/if}

<style>
  .initialize-message {
    color: blue;
    font-size: 3rem;
  }
</style>
