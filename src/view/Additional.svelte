<script lang="ts">
    import PostNicoliveComment from "../components/PostNicoliveComment.svelte";
    import UserSetting from "../components/UserSetting.svelte";
    import { Nicolive } from "../function/Nicolive.svelte";

  let userId = $state<number | string>();

  export function openListenerSetting(_userId: number | string) {
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
      <UserSetting {userId} noAccordion={true} />
    </div>
  {:else if Nicolive.client != null}
    <PostNicoliveComment />
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
