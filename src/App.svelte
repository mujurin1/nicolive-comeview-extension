<script lang="ts">
  import { onMount } from "svelte";
  import Main from "./view/Main.svelte";
  import { main } from "./view/view";

  let mainPage = $state<Main>();
  onMount(() => {
    main.page = mainPage!;
  });
</script>

<Main bind:this={mainPage} />
