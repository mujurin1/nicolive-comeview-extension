<script module>
  import { externalStoreInitialize } from "../lib/ExternalStore";
  import { store } from "../store/store.svelte";
  import { userStore } from "../store/UserStore.svelte";

  // first set stores
  store;
  userStore;
  const promise = externalStoreInitialize();
</script>

<script lang="ts">
  import LegacyCommentList from "../components/LegacyCommentList.svelte";
  import UserSetting from "../components/UserSetting.svelte";
  import { Nicolive } from "../store/Nicolive.svelte";
  import Header from "./Header.svelte";
  import Startup from "./Startup.svelte";

  let startup = $state(true);

  $effect(() => {
    if (startup && Nicolive.state === "opened") startup = false;
  });

  let userId = $state<number | string>();

  export function openListenerSetting(_userId: number | string) {
    userId = _userId;
  }
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
        {#if userId != null}
          <div style="position: sticky;">
            <button class="close-btn" type="button" onclick={() => userId = undefined}>
              閉じる
            </button>
            <UserSetting {userId} noAccordion={true} />
          </div>
        {/if}
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

  .close-btn {
    position: absolute;
    top: 5px;
    right: 10px;
  }
</style>
