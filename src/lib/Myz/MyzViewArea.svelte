<script lang="ts">
    import type { Snippet } from "svelte";

  let { title, children, headerItem }: {
    title: string;
    children: Snippet;
    headerItem?: Snippet;
  } = $props();
</script>

<div class="myz-area">
  <div class="myz-area-header-container">
    <div class="myz-area-header-title">{title}</div>
    {#if headerItem != null}
      <div class="myz-area-header-item">
        {@render headerItem()}
      </div>
    {/if}
  </div>

  <div class="myz-area-content">
    {@render children()}
  </div>
</div>

<style>
  .myz-area { }

  .myz-area-header-container {
    display: flex;
    align-items: center;
    padding: 0 5px;
    gap: 15px;
    background-color: hsl(224, 81%, 92%);

    & > .myz-area-header-title {
      flex: 0 0 fit-content;
      font-size: 1.2em;
    }
    & > .myz-area-header-item {
      flex: 1 1 100%;
    }
  }

  .myz-area-content {
    background-color: hsl(222, 100%, 94%);
    padding: 3px 5px;
  }
</style>