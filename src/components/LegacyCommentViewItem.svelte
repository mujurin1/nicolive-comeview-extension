
<script lang="ts">
  import type { Snippet } from "svelte";
  import { onErrorImage } from "../Platform";

  let { no, iconUrl, name, time, content }: {
    no?: number;
    iconUrl?: string;
    name?: Snippet | string;
    time?: string;
    content?: Snippet | string;
  } = $props();
</script>

<div class="child no">{no}</div>
<div class="child icon">
  {#if iconUrl != null}
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={iconUrl} onerror={onErrorImage} />
  {/if}
</div>
{#if typeof name === "string"}
  <div class="child name">
    {name}
  </div>
{:else if name != null}
  {@render name()}
{/if}
{#if time != null}
  <div class="child time">{time}</div>
{/if}
{#if typeof content === "string"}
  <div class="child content">{content}</div>
{:else if content != null}
  {@render content()}
{/if}
