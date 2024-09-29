<script lang="ts">
  import NicolivePostComment from "../components/NicolivePostComment.svelte";
  import UserSetting from "../components/UserSetting.svelte";
  import { Nicolive } from "../Platform";
  import { SettingStore } from "../store/SettingStore.svelte";

  let userId = $state<string>();

  export function openUserSetting(_userId: string) {
    userId = _userId;
  }

  type F = () => void;
</script>

{#snippet close(onclick: F)}
  <button class="close-btn" {onclick} type="button">閉じる</button>
{/snippet}

<div class="additional">
  {#if userId != null}
    <div class="format">
      {@render close(() => (userId = undefined))}
      <UserSetting noAccordion={true} platformId="nicolive" {userId} />
    </div>
  {:else if (
      SettingStore.state.nicolive.showPostArea &&
      Nicolive.pageData?.nicoliveInfo?.loginUser != null
    )}
    <NicolivePostComment />
  {/if}
</div>

<style>
  .additional {
    background-color: whitesmoke;
  }

  .close-btn {
    position: absolute;
    top: 5px;
    right: 10px;
  }

  .format {
    height: 200px;
    position: sticky;
    overflow-y: auto;
  }
</style>
