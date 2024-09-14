<script lang="ts">
    import NicolivePostComment from "../components/NicolivePostComment.svelte";
    import UserSetting from "../components/UserSetting.svelte";
    import { Nicolive } from "../Platform";

  let userId = $state<string>();

  export function openUserSetting(_userId: string) {
    userId = _userId;
  }
</script>

{#snippet close(onclick: () => void)}
  <button class="close-btn" type="button" {onclick}>閉じる</button>
{/snippet}

<div class="additional">
  {#if userId != null}
    <div class="format">
      {@render close(() => (userId = undefined))}
      <UserSetting platformId="nicolive" {userId} noAccordion={true} />
    </div>
  {:else if Nicolive.client != null && Nicolive.client.info.loginUser != null}
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
