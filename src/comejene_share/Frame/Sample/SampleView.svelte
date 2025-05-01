<script lang="ts">
  import { onMount } from "svelte";
  import ComejeneMessageContainer from "../../Message/ComejeneMessageContainer.svelte";
  import { SampleFrameState, type SampleFrameSetting } from "./SampleState.svelte";

  let {
    setting,
  }: {
    setting: SampleFrameSetting;
  } = $props();

  export const state = new SampleFrameState(setting);

  onMount(() => {
    return state.onMount();
  });
</script>

<div class="comejene-container">
  {#each state.messages as message (message)}
    <ComejeneMessageContainer {message} />
  {/each}
</div>
