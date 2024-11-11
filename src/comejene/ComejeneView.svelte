<script generics="Setting extends MotionSettingModel, State extends MotionState" lang="ts">
  import { type MotionState } from "../comejene_share";
  import type { MotionSettingModel } from "../comejene_share/Motion/Interface";
  import type { ComejeneViewState } from "./ComejeneViewState.svelte";

  let { viewState }: { viewState: ComejeneViewState<Setting, State> } = $props();
</script>

<viewState.Component bind:this={viewState.component as any} setting={viewState.motionSetting} />
