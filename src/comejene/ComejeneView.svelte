<script generics="Setting extends MotionSetting, State extends MotionState" lang="ts">
  import { onMount } from "svelte";
  import {
      type MotionState
  } from "../comejene_share";
  import type { MotionSetting } from "../comejene_share/Motion/Interface";
  import type { ComejeneViewState } from "./ComejeneViewState.svelte";

  let { comejeneState }: { comejeneState: ComejeneViewState<Setting, State> } = $props();

  onMount(() => {
    return () => {
      comejeneState.reset();
    }
  });
</script>

<comejeneState.Component bind:this={comejeneState.component as any} setting={comejeneState.motionSetting} />
