<script generics="Key extends string, Items extends Key[]" lang="ts">
  let {
    value = $bindable(),
    items = $bindable(),
    size = 1,
  }: {
    value: Key;
    items: Items;
    size: number | undefined;
  } = $props();
</script>

<select class="simple-list" {size} bind:value>
  {#each items as name (name)}
    {@const select = name === value}
    <option class="item" class:select>{name}</option>
  {/each}
</select>

<style>
  .simple-list {
    width: 100%;
  }
</style>
