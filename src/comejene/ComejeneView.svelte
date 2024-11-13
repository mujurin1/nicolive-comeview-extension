<script generics="Setting extends MotionSetting, State extends MotionState" lang="ts">
  import { type MotionState } from "../comejene_share";
  import type { MotionSetting } from "../comejene_share/Motion/Interface";
  import type { ComejeneViewState } from "./ComejeneViewState.svelte";

  let { viewState }: { viewState: ComejeneViewState<Setting, State> } = $props();
</script>

<viewState.Component bind:this={viewState.component as any} setting={viewState.motionSetting} />
