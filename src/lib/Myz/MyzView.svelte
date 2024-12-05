<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MyzValue } from ".";

  let { forId, object, children }: {
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
    column-gap: 6px;
    align-items: center;
    padding: 1px 0;


    & > .myz-column-label {
      flex: 0 0 0;
      display: inline-block;
      min-width: 100px;
      box-sizing: border-box;
      padding-left: var(--indent);
    }

    & > .myz-column-input {
      flex: 1 1 0;
      display: flex;
      align-items: center;
  }
  }
</style>