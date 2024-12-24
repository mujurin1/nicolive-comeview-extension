<script lang="ts">
  import {
      ComejeneContentKeyNames,
      ComejeneContentKeyToType,
      ComejeneContentKeys,
      ComejeneContentStyleRootSet,
      ComejeneMessageStyleRoot,
      ComejeneMotionDefinitions,
      ComejeneStyle,
      type ComejeneMotionDefinition,
      type ComejeneMotionNames,
      type ComejeneMotionSetting
  } from "../../comejene_share";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import MyzRootView from "../../lib/Myz/MyzRootView.svelte";
  import MyzViewArea from "../../lib/Myz/MyzViewArea.svelte";

  let {
    motionName,
    comejeneStyle: _comejeneStyle = $bindable(),
    motionSetting: _motionSetting = $bindable(),
  }: {
    motionName: ComejeneMotionNames;
    comejeneStyle: ComejeneStyle;
    motionSetting: ComejeneMotionSetting;
  } = $props();

  let comejeneStyle = notifierStore(_comejeneStyle, () => {
    _comejeneStyle = comejeneStyle.state;
  });
  let motionSetting = notifierStore(_motionSetting, () => {
    _motionSetting = motionSetting.state;
  });

  let motionDefinition = $derived<ComejeneMotionDefinition<ComejeneMotionNames>>(ComejeneMotionDefinitions[motionName]);
  let selectContent = $state<ComejeneContentKeys>("message");
  let root = $derived(ComejeneContentStyleRootSet[ComejeneContentKeyToType[selectContent]]);

  let notExistInMessageFrame = $derived($comejeneStyle.containerLayout.contents[selectContent] == null);
</script>

<MyzViewArea title="モーション設定">
  <MyzRootView path="motion" root={motionDefinition.css.root} bind:style={$motionSetting} />
</MyzViewArea>

<MyzViewArea title="メッセージ枠">
  <MyzRootView
    path="message"
    root={ComejeneMessageStyleRoot}
    bind:style={$comejeneStyle.frameSate as any}
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
    {:else if !$comejeneStyle.contentsStyle[selectContent].visible}
      <div class="hide-content-message">※この項目は非表示になっています</div>
    {/if}
    <MyzRootView path="content" {root} bind:style={$comejeneStyle.contentsStyle[selectContent] as any} />
  {/key}
</MyzViewArea>

<style>
  .hide-content-message {
    color: red;
    font-weight: bold;
    font-size: 1.1em;
  }
</style>
