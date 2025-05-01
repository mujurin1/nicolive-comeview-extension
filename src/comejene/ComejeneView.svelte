<script generics="Setting extends ComejeneFrameSetting, State extends ComejeneFrameState" lang="ts">
  import type { ComejeneFrameSetting, ComejeneFrameState } from "../comejene_share/Frame";
  import type { ComejeneViewState } from "./ComejeneViewState.svelte";

  let { viewState }: { viewState: ComejeneViewState<Setting, State> } = $props();
</script>

<viewState.Component bind:this={viewState.component as any} setting={viewState.frameSetting} />
