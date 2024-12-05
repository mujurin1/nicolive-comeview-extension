<script lang="ts" module>
  import { storageInit } from "../lib/Storage";

  storageInit();
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import LegacyCommentView from "../components/LegacyCommentView.svelte";
  import { Nicolive } from "../Platform";
  import Additional from "./Additional.svelte";
  import Header from "./Header.svelte";
  import Startup from "./startup/Startup.svelte";
  import { additional } from "./view";

  let additionalPage = $state<ReturnType<typeof Additional>>();

  onMount(() => {
    if (additionalPage == null) return;
    additional.page = additionalPage;
  });

  let startup = $derived(Nicolive.state === "none");
</script>

<main>
  <div class="view">
    <Header />

    <div class="content" tabindex="-1">
      <div class="content-main">
        {#if startup}
          <Startup />
        {:else}
          <LegacyCommentView />
        {/if}
      </div>
      <div class="content-sub">
        <Additional bind:this={additionalPage} />
      </div>
    </div>
  </div>
</main>

<style>
  .view {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100vh;
  }

  .content {
    display: grid;
    grid-template:
      "main" 1fr
      "sub" auto / 1fr auto;
    background-color: ghostwhite;
    height: 100%;
    overflow: hidden;

    &:focus {
      outline: none;
    }

    .content-main {
      grid-area: main;
      overflow: hidden;
    }

    .content-sub {
      grid-area: sub;
      height: fit-content;
    }
  }
</style>
