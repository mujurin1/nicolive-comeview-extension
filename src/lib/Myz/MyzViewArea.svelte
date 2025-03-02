<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    opened = $bindable(true),
    children,
    headerItem,
  }: {
    title?: string;
    opened?: boolean;
    children: Snippet;
    headerItem?: Snippet;
  } = $props();
</script>

<div class="myz-area">
  <div class="myz-area-header-container">
    <button class="myz-area-header-title no-style" onclick={() => (opened = !opened)} type="button">
      {title}
    </button>
    {#if headerItem != null}
      <div class="myz-area-header-item">
        {@render headerItem()}
      </div>
    {/if}
  </div>

  {#if opened}
    <div class="myz-area-content">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .myz-area-header-container {
    display: flex;
    align-items: center;
    padding: 0 5px;
    gap: 15px;
    background-color: hsl(224, 81%, 92%);

    & > .myz-area-header-title {
      flex: 0 0 fit-content;
      font-size: 1.2em;

      /* 1文字分の高さを確保 */
      &::before {
        content: "";
        display: inline-block;
      }
    }

    & > :last-child {
      flex: 1 1 100%;
    }
    /*
    & > .myz-area-header-item {
    }
    */
  }

  .myz-area-content {
    background-color: hsl(222, 100%, 94%);
    padding: 3px;
  }

  :global(select, input) {
    font-size: unset;
  }
</style>
