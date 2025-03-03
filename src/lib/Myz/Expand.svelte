<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    show = $bindable(),
    children,
  }: {
    title: string;
    show?: boolean;
    children: Snippet;
  } = $props();
</script>

<button class="head-item no-style" data-expand={show} onclick={() => (show = !show)} type="button">
  {title}
</button>

{#if show}
  {@render children()}
{/if}

<style>
  .head-item {
    width: 100%;

    &::before {
      display: inline-block;
      width: 1.1em;
      content: "▶";
    }
    &[data-expand="true"] {
      &::before {
        content: "▼";
      }
    }
  }
</style>
