<script lang="ts">
  import type { Snippet } from "svelte";

  let { title, content, opened = $bindable() }: {
    title: string | Snippet,
    content: string | Snippet,
    opened: bigint,
  } = $props();
</script>

<div class="expand">
  <div class="title">
    {#if typeof title === "string"}
      {title}
    {:else}
      {@render title()}
    {/if}
  </div>
  {#if opened}
    <div class="content">
      {#if typeof content === "string"}
        {content}
      {:else}
        {@render content()}
      {/if}
    </div>
  {/if}
</div>
