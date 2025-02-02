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

<button class="head-item" data-expand={show} onclick={() => (show = !show)} type="button">
  {title}
</button>

{#if show}
  {@render children()}
{/if}

<style>
  .head-item {
    font-size: 1em;
    text-align: left;
    border: none;
    background-color: unset;
    padding: unset;
    width: 100%;
    padding-left: var(--indent);

    &::before {
      content: "▶ ";
    }
    &[data-expand="true"] {
      &::before {
        content: "▼ ";
      }
    }
  }
</style>
