<script lang="ts">
    import type { Snippet } from "svelte";

  let { title, children, headerItem }: {
    title: string;
    children: Snippet;
    headerItem?: Snippet;
  } = $props();
</script>

<div class="setting-area">
  <div class="setting-area-header-container">
    <div class="setting-area-header-title">{title}</div>
    {#if headerItem != null}
      <div class="setting-area-header-item">
        {@render headerItem()}
      </div>
    {/if}
  </div>

  <div class="setting-area-content">
    {@render children()}
  </div>
</div>

<style>
  .setting-area {
  }

  .setting-area-header-container {
    display: flex;
    align-items: center;
    padding: 0 5px;
    gap: 15px;
    background-color: #d9e2fb;

    & > .setting-area-header-title {
      flex: 0 0 fit-content;
      font-size: 1.2em;
    }
    & > .setting-area-header-item {
      flex: 1 1 100%;
    }
  }

  .setting-area-content {
    background-color: #e1eaff;
    padding: 3px 5px;
  }
</style>