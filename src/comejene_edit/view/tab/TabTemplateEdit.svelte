<script lang="ts">
  import { onMount } from "svelte";

  import {
    ComejeneContentKeyNames,
    ComejeneContentKeys,
    ComejeneContentKeyToType,
    ComejeneContentStyleRoot,
    ComejeneMessageStyleRoot,
  } from "../../../comejene_share/Message";
  import { notifierStore } from "../../../lib/CustomStore.svelte";
  import MyzRootView from "../../../lib/Myz/MyzRootView.svelte";
  import MyzViewArea from "../../../lib/Myz/MyzViewArea.svelte";
  import { ComejeneTemplateStore } from "../../../store/ComejeneTemplateStore.svelte";
  import DetailBox from "../../components/DetailBox.svelte";
  import { ComejeneSenderStore } from "../../../store/ComejeneSenderStore.svelte";
  import {
    ComejeneMotionDefinitions,
    type ComejeneMotionDefinition,
    type ComejeneMotionNames,
  } from "../../../comejene_share/Motion";

  let {
    endEditing: parentEndEditing,
  }: {
    endEditing: () => void;
  } = $props();

  const template = notifierStore(
    $state.snapshot(ComejeneTemplateStore.getUseTemplate()), //
    () => {
      unsavedChange = true;
      ComejeneSenderStore.sendMotionSetting(template.state);
      ComejeneSenderStore.sendComejeneStyle(template.state);
    },
  );

  let unsavedChange = $state(false);

  let motionDefinition = $derived<ComejeneMotionDefinition<ComejeneMotionNames>>(
    ComejeneMotionDefinitions[template.state.motion.name],
  );
  let selectContent = $state<ComejeneContentKeys>("message");
  const root = $derived(ComejeneContentStyleRoot[ComejeneContentKeyToType[selectContent]]);

  function save() {
    unsavedChange = false;
    ComejeneTemplateStore.updateUseTemplte(template.state);
  }

  function endEditing() {
    parentEndEditing();
  }
</script>

<div class="template-edit">
  <div class="edit-head">
    <div class="detail">
      <DetailBox>
        {#snippet head()}
          <input class="template-name" type="text" bind:value={$template.name} />
        {/snippet}
        {#snippet body()}
          <div>モーション</div>
          <div>{$template.motion.name}</div>
        {/snippet}
        {#snippet buttons()}
          <button onclick={save} type="button">保存</button>
          <button onclick={endEditing} type="button">編集を終了する</button>
        {/snippet}
      </DetailBox>
    </div>
  </div>

  <div class="edit-area">
    <MyzViewArea title="モーション設定">
      <MyzRootView
        path="motion"
        root={motionDefinition.css.root}
        bind:state={$template.motion.setting}
      />
    </MyzViewArea>

    <MyzViewArea title="メッセージ枠">
      <MyzRootView
        path="message"
        root={ComejeneMessageStyleRoot}
        bind:state={$template.style.messageStyle}
      />
    </MyzViewArea>

    <MyzViewArea title="コンテンツ">
      {#snippet headerItem()}
        <select bind:value={selectContent}>
          {#each ComejeneContentKeys as content (content)}
            <option value={content}>{ComejeneContentKeyNames[content]}</option>
          {/each}
        </select>
      {/snippet}

      <!-- これがないと状態が正しく変化しない (svelte の不具合) -->
      {#key selectContent}
        {#if template.state.style.messageFrame.contents[selectContent] == null}
          <div class="hide-content-message">※メッセージ枠で割り当てられていない項目です</div>
          <!-- TODO: メッセージフレームとは関係なく非表示にする項目で false の部分を決定する -->
        {:else if !$template.style.contentsStyle[selectContent].visible}
          <div class="hide-content-message">※この項目は非表示になっています</div>
        {/if}
        <MyzRootView
          path="content"
          {root}
          bind:state={$template.style.contentsStyle[selectContent]}
        />
      {/key}
    </MyzViewArea>

    <div class="empty"><div></div></div>
  </div>
</div>

<style>
  .template-name {
    box-sizing: border-box;
    margin-bottom: 0.3em;
  }

  .template-edit {
    display: flex;
    gap: 1em;
    flex-direction: column;
    max-height: 100%;
  }

  .edit-head {
    flex: 0 0 min-content;
  }

  .edit-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1em;
    overflow: auto;
    min-height: 0;
  }

  .hide-content-message {
    flex: 1;
    color: red;
    font-weight: bold;
    font-size: 1.1em;
    max-height: 100%;
    overflow: hidden;
  }

  .empty > div {
    height: 100vh;
  }
</style>
