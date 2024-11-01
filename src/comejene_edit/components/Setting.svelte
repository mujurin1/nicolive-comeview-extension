<script lang="ts">
  import { MessageContentFrames, MessageContentStyleDefinitionSet, MessageContentToStyleType, MessageFrameStyleDefinition, MessageStyle, MotionDefinitions, type MessageContentFrame, type MotionDefinition, type MotionNames, type MotionSetting } from "../../comejene_share";
  import SettingArea from "./SettingArea.svelte";
  import StyleSetting from "./StyleSetting.svelte";

  let {
    motionName,
    messageStyle,
    motionSetting,
  }: {
    motionName: MotionNames;
    messageStyle: MessageStyle;
    motionSetting: MotionSetting;
  } = $props();


  let motionDefinition = $derived<MotionDefinition<MotionNames>>(MotionDefinitions[motionName]);
  let selectContent = $state<MessageContentFrame>("message");
</script>

<SettingArea title="モーション設定">
  <StyleSetting contents={motionSetting} definition={motionDefinition.css.definition} />
</SettingArea>

<SettingArea title="メッセージ枠">
  <StyleSetting contents={messageStyle.frameStyle} definition={MessageFrameStyleDefinition} />
</SettingArea>

<SettingArea title="コンテンツ">
  {#snippet headerItem()}
    <select bind:value={selectContent}>
      {#each MessageContentFrames as content (content)}
        <option value={content}>{content}</option>
      {/each}
    </select>
  {/snippet}

  {@const fr = selectContent}
  {#if messageStyle.contentsStyle[fr] == null}
    <div>noen</div>
  {:else}
    {@const definition = MessageContentStyleDefinitionSet[MessageContentToStyleType[fr]]}
    <StyleSetting contents={messageStyle.contentsStyle[fr]} {definition} />
  {/if}
</SettingArea>
