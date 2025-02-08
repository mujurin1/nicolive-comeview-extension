<script
  generics="Setting extends ComejeneMotionSetting, State extends ComejeneMotionState"
  lang="ts"
>
  import type { ComejeneMotionSetting, ComejeneMotionState } from "../comejene_share/Motion";
  import type { ComejeneViewState } from "./ComejeneViewState.svelte";

  let { viewState }: { viewState: ComejeneViewState<Setting, State> } = $props();
</script>

<viewState.Component bind:this={viewState.component as any} setting={viewState.motionSetting} />
