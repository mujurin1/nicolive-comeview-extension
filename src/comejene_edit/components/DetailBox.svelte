<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    head,
    body,
    buttons,
  }: {
    head: Snippet;
    body: Snippet;
    buttons: Snippet;
  } = $props();
</script>

<div class="detail-box">
  <div class="head">
    {@render head()}
  </div>

  <div class="body">
    {@render body()}
  </div>

  <div class="buttons">
    {@render buttons()}
  </div>
</div>

<style>
  .detail-box {
    background-color: hsl(38, 93%, 83%);
    padding: 0.5em;
    border-radius: 10px;

    > .head {
      font-size: 1.5em;
      font-weight: bold;
      text-align: center;
    }

    > .body {
      display: grid;
      grid-template: "a b" auto / auto 1fr;
      grid-gap: 1em;
    }

    > .buttons {
      display: flex;
      gap: 0.5em;
      margin-top: 0.5em;

      > :global(button:last-child) {
        margin-left: auto;
      }
    }
  }
</style>
