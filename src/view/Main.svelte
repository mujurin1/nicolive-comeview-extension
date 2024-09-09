<script module>
  import { externalStoreInitialize } from "../lib/ExternalStore";
  import { store } from "../store/store.svelte";
  import { userStore } from "../store/UserStore.svelte";

  // first set stores
  store;
  userStore;
  externalStoreInitialize();
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import LegacyCommentList from "../components/LegacyCommentList.svelte";
  import { Nicolive } from "../store/Nicolive.svelte";
  import Additional from "./Additional.svelte";
  import Header from "./Header.svelte";
  import Startup from "./Startup.svelte";
  import { additional } from "./view";

  let additionalPage = $state<Additional>();

  onMount(() => {
    if(additionalPage == null) return;
    additional.page = additionalPage;
  });
    
  let startup = $state(true);

  $effect(() => {
    if (startup && Nicolive.state === "opened") startup = false;
  });

</script>

<main>
  <div class="view">
    <Header />

    <div class="content" tabindex="-1">
      <div class="content-main">
        {#if startup}
          <Startup />
        {:else}
          <LegacyCommentList />
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

    .content-sub{
      grid-area: sub;
      height: fit-content;
    }
  }
</style>
