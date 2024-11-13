<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MyzObject } from "../../lib/Myz/index.svelte";

  let { forId, object, children }: {
    forId?: string;
    object: Partial<Omit<MyzObject, "type">>;
    children: Snippet;
  } = $props();
</script>

<div class="setting-column">
  <label class="setting-label" for={forId} title={object.desc}>
    {object.display}
  </label>
  <div class="setting-input">
     {@render children()}
  </div>
</div>

<style>
  .setting-column {
    display: flex;
    /* justify-content: space-between; */
    column-gap: 6px;
    align-items: center;
    padding: 1px 0;


    & > .setting-label {
      flex: 0 0 0;
      display: inline-block;
      min-width: 100px;
      box-sizing: border-box;
      padding-left: var(--indent);
    }

    & > .setting-input {
      flex: 1 1 0;
      display: flex;
      align-items: center;
  }
  }
</style>