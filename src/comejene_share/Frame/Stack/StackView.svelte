<script lang="ts">
  import { onMount } from "svelte";
  import ComejeneMessageContainer from "../../Message/ComejeneMessageContainer.svelte";
  import { StackFrameState, type StackFrameSetting } from "./StackState.svelte";

  let {
    setting,
  }: {
    setting: StackFrameSetting;
  } = $props();

  export const state = new StackFrameState(setting);

  onMount(() => {
    return state.onMount();
  });
</script>

<div bind:this={state.comejeneContainerDiv} class="comejene-container">
  <div bind:this={state.messageAreaDiv} class="message-area">
    <div bind:this={state.paddingDiv} class="padding"></div>
    <!-- TODO: each-key を正しい値に設定する -->
    {#each state.messages as message (message)}
      <ComejeneMessageContainer {message} />
    {/each}
  </div>
</div>
