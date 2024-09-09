<script lang="ts">
  import UserSetting from "../components/UserSetting.svelte";

  let userId = $state<number | string>();

  export function openListenerSetting(_userId: number | string) {
    userId = _userId;
  }
</script>

{#snippet close(onclick: () => void)}
  <button class="close-btn" type="button" {onclick}>閉じる</button>
{/snippet}

<div style="position: sticky;">
  {#if userId != null}
    {@render close(() => (userId = undefined))}
    <UserSetting {userId} noAccordion={true} />
  {/if}
</div>

<style>
  .close-btn {
    position: absolute;
    top: 5px;
    right: 10px;
  }
</style>
