<script lang="ts">
  import { ComejeneTemplateStore } from "../../../store/ComejeneTemplateStore.svelte";
  import { DefaultComejeneTemplates, isDefaultComejeneTemplate } from "../../Template/Defaults";
  import RecordList from "../../../components/RecordList.svelte";
  import Details from "../../../components/Details.svelte";
  import { untrack } from "svelte";
  import { notifierStore } from "../../../lib/CustomStore.svelte";
  import { ComejeneSenderStore } from "../../../store/ComejeneSenderStore.svelte";
  import DetailBox from "../../components/DetailBox.svelte";

  let {
    startEditing,
  }: {
    startEditing: () => void;
  } = $props();

  let defaultOpen = $state(true);
  let customOpen = $state(true);

  let selectTemplateId = notifierStore(
    ComejeneTemplateStore.state.useTemplateId,
    () => {
      untrack(() => {
        if (ComejeneTemplateStore.state.useTemplateId !== selectTemplateId.state) {
          ComejeneTemplateStore.setUseTemplateId(selectTemplateId.state);
        }
        ComejeneSenderStore.sendReset(3);
      });
    },
    () => ComejeneTemplateStore.state.useTemplateId,
  );

  const template = $derived(ComejeneTemplateStore.getUseTemplate());
  const isDefault = $derived(isDefaultComejeneTemplate(ComejeneTemplateStore.state.useTemplateId));

  function copyTemplate() {
    const newTemplate = $state.snapshot(template);
    newTemplate.name = `${newTemplate.name} のコピー`;
    ComejeneTemplateStore.addTemplate(newTemplate, true);
  }

  function deleteTemplate() {
    ComejeneTemplateStore.removeTemplate(selectTemplateId.state);
    ComejeneSenderStore.sendReset(3);
  }
</script>

<div class="template-view">
  <DetailBox>
    {#snippet head()}
      <div>{template.name}</div>
    {/snippet}
    {#snippet body()}
      <div>モーション</div>
      <div>{template.motion.name}</div>
    {/snippet}
    {#snippet buttons()}
      <button onclick={copyTemplate} type="button">複製</button>
      <button disabled={isDefault} onclick={startEditing} type="button">編集</button>
      <button disabled={isDefault} onclick={deleteTemplate} type="button">削除</button>
    {/snippet}
  </DetailBox>

  <Details title="ベーステンプレート" bind:open={defaultOpen}>
    {#snippet summary()}
      <RecordList
        nameKey="name"
        records={DefaultComejeneTemplates}
        bind:selectKey={$selectTemplateId}
      />
    {/snippet}
  </Details>

  <Details title="カスタムテンプレート" bind:open={customOpen}>
    {#snippet summary()}
      <RecordList
        nameKey="name"
        records={ComejeneTemplateStore.state.templates}
        bind:selectKey={$selectTemplateId}
      />
    {/snippet}
  </Details>
</div>

<style>
  .template-view {
    display: flex;
    flex-direction: column;
    gap: 2em;
  }
</style>
