<script lang="ts">
    import type { Snippet } from "svelte";

  let { name, noLabelFor, children }: {
    name: string;
    noLabelFor?: boolean;
    children: Snippet;
  } = $props()
</script>

<div class="setting-content">
  <label class="setting-label" for={noLabelFor ? "" : name}>{name}</label>
  <div class="setting-input">
    <!-- <input id={name} type="number" bind:value={contents[key]}> -->
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