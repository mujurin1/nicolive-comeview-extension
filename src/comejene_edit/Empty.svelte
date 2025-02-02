<script lang="ts" module>
  let loaded = $state(false);
  export const init = {
    get loaded() {
      return loaded;
    },
  };
  storageInit().then(() => (loaded = true));
</script>

<script lang="ts">
  import { storageInit } from "../lib/Storage";
  import ComejeneEdit from "./ComejeneEdit.svelte";
</script>

{#if init.loaded}
  <ComejeneEdit />
{/if}
