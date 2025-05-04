<script lang="ts">
  import { onMount } from "svelte";
  import ComejeneMessageContainer from "../../Message/ComejeneMessageContainer.svelte";
  import { SampleMotionState, type SampleMotionSetting } from "./SampleState.svelte";

  let {
    setting,
  }: {
    setting: SampleMotionSetting;
  } = $props();

  export const state = new SampleMotionState(setting);

  onMount(() => {
    return state.onMount();
  });
</script>

<div class="comejene-container">
  {#each state.messages as message (message)}
    <ComejeneMessageContainer {message} />
  {/each}
</div>
