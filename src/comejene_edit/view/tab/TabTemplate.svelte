<script lang="ts">
  import TabTemplateView from "./TabTemplateView.svelte";
  import TabTemplateEdit from "./TabTemplateEdit.svelte";

  let isEditing = $state(false);

  function startEditing() {
    if (isEditing) return;
    isEditing = true;
  }

  function endEditing() {
    if (!isEditing) return;
    isEditing = false;
  }
</script>

{#if isEditing}
  <TabTemplateEdit {endEditing} />
{:else}
  <TabTemplateView {startEditing} />
{/if}
