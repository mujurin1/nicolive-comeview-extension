<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    summary,
    open = $bindable(true),
  }: {
    title?: string;
    summary: Snippet;
    open?: boolean;
  } = $props();
</script>

<div class="details" class:open>
  <button class="head" onclick={() => (open = !open)} type="button">
    <hr />
    <div class="title">{title}</div>
    <hr />
  </button>

  <div class="content">
    {@render summary()}
  </div>
</div>

<style>
  hr {
    background-color: black;
    height: 1px;
    border: none;
    margin: 0;
  }

  button {
    background: unset;
    border: unset;
    padding: 0;
    width: 100%;
    text-align: left;
  }

  .details {
    > .head {
      display: grid;
      grid-template: "a b c" auto / 1fr auto 1fr;
      align-items: center;

      > .title {
        padding: 0 0.2em;

        &::before {
          content: "▼";
        }
      }
    }

    > .content {
      overflow: hidden;
      margin-top: 0.5em;
    }

    &:not(.open) {
      .title::before {
        content: "▶";
      }
      .content {
        display: none;
      }
    }
  }
</style>
