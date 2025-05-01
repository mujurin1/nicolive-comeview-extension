<script lang="ts" module>
  import { storageInit } from "../lib/Storage";
  import { ComejeneSenderStore } from "../store/ComejeneSenderStore.svelte";

  let loaded = $state(false);

  export const init = {
    get loaded() {
      return loaded;
    },
  } as const;

  storageInit().then(async () => {
    const sender = ComejeneSenderStore.addSender(ComejeneSenderBrowser.createDefault());
    await sender.connect();

    loaded = true;
  });
</script>

<script lang="ts">
  import ComejeneEditMain from "./view/ComejeneEditMain.svelte";

  import { ComejeneSenderBrowser } from "../comejene_share/ViewEnvironment/BrowserEx.svelte";
</script>

{#if init.loaded}
  <ComejeneEditMain />
  <!-- <ComejeneEdit_ /> -->
{:else}
  <div>Loading...</div>
{/if}
