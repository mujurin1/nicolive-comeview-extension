<script lang="ts">
  let { value = $bindable() }: { value: string } = $props();

  let edit = $state(false);

  let inputElement = $state<HTMLInputElement>();
  let divElement = $state<HTMLDivElement>();

  async function dblClick() {
    edit = true;
  }

  $effect.pre(() => {
    if (inputElement == null) return;
    inputElement.focus();
  });

  $effect.pre(() => {
    if (divElement == null) return;
    const _edit = divElement;

    _edit.addEventListener("dblclick", dblClick);

    return () => _edit.removeEventListener("dblclick", dblClick);
  });
</script>

{#if edit}
  <div class="edit">
    <button onclick={() => (edit = false)} type="button">保存</button>
    <input bind:this={inputElement} size="13" type="text" bind:value />
  </div>
{:else}
  <div bind:this={divElement} class="not-edit">{value}</div>
{/if}

<style>
  input {
    width: 100%;
  }

  .edit {
    display: flex;
    width: 100%;
    white-space: nowrap;

    & > *:not(:last-child) {
      margin-right: 5px;
    }
  }

  .not-edit {
    cursor: pointer;
    background-color: lightgray;
    height: 18px;
    width: 100%;
  }
</style>
