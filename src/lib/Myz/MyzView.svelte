<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MyzValue } from ".";

  let {
    forId,
    object,
    children,
  }: {
    forId?: string;
    object: Partial<Omit<MyzValue, "type">>;
    children: Snippet;
  } = $props();
</script>

<div class="myz-column">
  <label class="myz-column-label" for={forId} title={object.desc}>
    {object.display}
  </label>
  <div class="myz-column-input">
    {@render children()}
  </div>
</div>

<style>
  .myz-column {
    display: flex;
    /* justify-content: space-between; */
    column-gap: 0.6px;
    align-items: stretch;
    padding: 1px 0;
    min-height: 2em;

    & > .myz-column-label {
      flex: 0 0 8em;
      padding-left: var(--indent);
      align-self: center;
      height: min-content;
      box-sizing: border-box;
      width: 140px;
    }

    & > .myz-column-input {
      flex: 1 1 140px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 4px;
      width: 140px;

      :global(& > *) {
        height: 100%;
      }
    }
  }

  :global(input[type="checkbox"]) {
    width: auto;
    aspect-ratio: 1;
  }
</style>
