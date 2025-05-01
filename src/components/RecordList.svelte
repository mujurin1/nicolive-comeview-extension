<script lang="ts" module>
  type Item<X extends string> = {
    readonly [key in X]: string;
  } & {
    readonly [key: string]: any;
  };
</script>

<script generics="K extends string, T extends Record<string,  Item<K>>" lang="ts">
  let {
    records,
    nameKey,
    selectKey = $bindable(),
  }: {
    records: T;
    nameKey: K;
    selectKey: string;
  } = $props();

  function select(id: string) {
    selectKey = id;
  }
</script>

<div class="record-list">
  {#each Object.entries(records) as [id, record] (id)}
    <button
      class="item"
      class:selected={selectKey === id}
      onclick={() => {
        select(id);
      }}
      type="button"
    >
      <div class="name">{record[nameKey]}</div>
    </button>
  {/each}
</div>

<style>
  button {
    border: none;
    text-align: left;
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    background-color: hsl(193, 100%, 92%);
  }

  .item {
    display: flex;
    gap: 5px;
    padding: 5px;
    background-color: hsl(193, 100%, 85%);
    border-radius: 5px;
    font-size: 1.2em;

    .name {
      flex: 1;
    }

    &.selected {
      background-color: hsl(193, 100%, 75%);
    }
  }
</style>
