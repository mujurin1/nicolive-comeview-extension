<script lang="ts">
  import {
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
        <option value={content}>{content}</option>
      {/each}
    </select>
  {/snippet}

  {@const fr = selectContent}
  {#key fr}
    {#if $comejeneStyle.contentsStyle[fr] == null}
      <div>noen</div>
    {:else}
      {@const root = ComejeneContentStyleRootSet[ComejeneContentKeyToType[fr]]}
      <MyzRootView path="content" {root} bind:style={$comejeneStyle.contentsStyle[fr] as any} />
    {/if}
  {/key}
</MyzViewArea>
