<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ZodMeta } from "../../function/MyZod";

  let { name, meta, noLabelFor, children }: {
    name: string;
    meta: Partial<ZodMeta>;
    noLabelFor?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="setting-content">
  <label class="setting-label" for={noLabelFor ? "" : name} title={meta.desc}>
    {meta.display ?? name}
  </label>
  <div class="setting-input">
     {@render children()}
  </div>
</div>

<style>
  .setting-content {
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