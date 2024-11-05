<script lang="ts">
  import { onMount } from "svelte";
  import MessageContainer from "../../Message/MessageContainer.svelte";
  import { StackMotionState, type StackMotionSetting } from "./StackState.svelte";

  let {
    setting,
  }: {
    setting: StackMotionSetting;
  } = $props();

  export const state = new StackMotionState(setting);

  onMount(() => {
    return state.onMount();
  });
</script>

<div bind:this={state.comejeneContainerDiv} class="comejene-container">
  <div bind:this={state.messageAreaDiv} class="message-area">
    <div bind:this={state.paddingDiv} class="padding"></div>
    <!-- TODO: each-key を正しい値に設定する -->
    {#each state.messages as message (message)}
      <MessageContainer {message} />
    {/each}
  </div>
</div>
