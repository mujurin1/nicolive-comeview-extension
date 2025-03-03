<script lang="ts">
  import type { Snippet } from "svelte";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import { ComejeneSenderController } from "../../service/ComejeneSenderController.svelte";
  import type { ComejeneTemplate } from "../Template/ComejeneTemplate";
  import {
    ComejeneMessageStyleRoot,
    ComejeneContentKeys,
    ComejeneContentKeyNames,
    ComejeneContentKeyToType,
    ComejeneContentStyleRoot,
  } from "../../comejene_share/Message";
  import {
    ComejeneMotionDefinitions,
    type ComejeneMotionDefinition,
    type ComejeneMotionNames,
  } from "../../comejene_share/Motion";
  import MyzRootView from "../../lib/Myz/MyzRootView.svelte";
  import MyzView from "../../lib/Myz/MyzView.svelte";
  import MyzViewArea from "../../lib/Myz/MyzViewArea.svelte";

  let {
    selectTemplate,
    templateIsDefault,
    commentTest,
    save: saveToParent,
    closeEditing: closeToParent,
  }: {
    selectTemplate: ComejeneTemplate;
    templateIsDefault: boolean;
    commentTest: () => ReturnType<Snippet>;
    save: (template: ComejeneTemplate) => void;
    closeEditing: () => void;
  } = $props();

  $effect(() => {
    editTemplate.state.motion.setting;
    ComejeneSenderController.sendMotionSetting();
  });
  $effect(() => {
    editTemplate.state.style;
    ComejeneSenderController.sendComejeneStyle();
  });

  ComejeneSenderController._set(() => editTemplate.state);

  let editTemplate = notifierStore(
    structuredClone($state.snapshot(selectTemplate)), //
    () => {
      edited = true;
    },
  );
  let edited = $state(false);

  let motionDefinition = $derived<ComejeneMotionDefinition<ComejeneMotionNames>>(
    ComejeneMotionDefinitions[editTemplate.state.motion.name],
  );
  let selectContent = $state<ComejeneContentKeys>("message");
  let root = $derived(ComejeneContentStyleRoot[ComejeneContentKeyToType[selectContent]]);

  let notExistInMessageFrame = $derived(
    editTemplate.state.style.containerLayout.contents[selectContent] == null,
  );

  function save() {
    if (!edited) return;

    checkForceClose = false;
    saveToParent($state.snapshot(editTemplate.state));
    edited = false;
  }

  let checkForceClose = $state(false);
  function closeEditing() {
    // 保存していない変更がある場合、１度は通知する
    if (edited && !checkForceClose) {
      checkForceClose = true;
      return;
    }
    checkForceClose = false;
    closeToParent();
  }
</script>

<MyzViewArea title="編集中のテンプレート">
  <MyzView object={{ display: "名前" }}>
    <input
      disabled={templateIsDefault}
      title={templateIsDefault ? "最初から存在するテンプレートは名前を変えられません" : ""}
      type="text"
      bind:value={$editTemplate.name}
    />
  </MyzView>
  <MyzView object={{ display: "モーション" }}>
    <div>{$editTemplate.motion.name}</div>
  </MyzView>
</MyzViewArea>

{#if checkForceClose}
  <div class="error">保存していない変更があります！</div>

  <div class="buttons">
    <button class="warn" onclick={closeEditing} type="button">保存せずに戻る</button>
    <button onclick={save} type="button">保存する</button>
  </div>
{:else}
  <div class="buttons">
    <button class="warn" onclick={closeEditing} type="button">戻る</button>
    <button onclick={save} type="button">保存する</button>
  </div>
{/if}

{@render commentTest()}

<MyzViewArea title="モーション設定">
  <MyzRootView
    path="motion"
    root={motionDefinition.css.root}
    bind:style={$editTemplate.motion.setting}
  />
</MyzViewArea>

<MyzViewArea title="メッセージ枠">
  <MyzRootView
    path="message"
    root={ComejeneMessageStyleRoot}
    bind:style={$editTemplate.style.frameSate}
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
    {#if notExistInMessageFrame}
      <div class="hide-content-message">※メッセージ枠で割り当てられていない項目です</div>
      <!-- TODO: メッセージフレームとは関係なく非表示にする項目で false の部分を決定する -->
    {:else if !$editTemplate.style.contentsStyle[selectContent].visible}
      <div class="hide-content-message">※この項目は非表示になっています</div>
    {/if}
    <MyzRootView
      path="content"
      {root}
      bind:style={$editTemplate.style.contentsStyle[selectContent]}
    />
  {/key}
</MyzViewArea>

<div class="empty"><div></div></div>

<style>
  .hide-content-message {
    color: red;
    font-weight: bold;
    font-size: 1.1em;
  }

  .empty > div {
    height: 100vh;
  }
</style>
