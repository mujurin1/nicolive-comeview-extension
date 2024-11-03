<script lang="ts">
  import { MessageContentFrames, MessageContentStyleDefinitionSet, MessageContentToStyleType, MessageFrameStyleDefinition, MessageStyle, MotionDefinitions, type MessageContentFrame, type MotionDefinition, type MotionNames, type MotionSetting } from "../../comejene_share";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import SettingArea from "./SettingArea.svelte";
  import StyleSetting from "./StyleSetting.svelte";

  let {
    motionName,
    messageStyle: _messageStyle = $bindable(),
    motionSetting: _motionSetting = $bindable(),
  }: {
    motionName: MotionNames;
    messageStyle: MessageStyle;
    motionSetting: MotionSetting;
  } = $props();

  let messageStyle = notifierStore(
    _messageStyle,
    () => {
      _messageStyle = messageStyle.state;
    }
  )
  let motionSetting = notifierStore(
    _motionSetting,
    () => {
      _motionSetting = motionSetting.state;
    }
  )

  let motionDefinition = $derived<MotionDefinition<MotionNames>>(MotionDefinitions[motionName]);
  let selectContent = $state<MessageContentFrame>("message");
</script>

<SettingArea title="モーション設定">
  <StyleSetting definition={motionDefinition.css.definition} bind:style={$motionSetting} />
</SettingArea>

<SettingArea title="メッセージ枠">
  <StyleSetting definition={MessageFrameStyleDefinition} bind:style={$messageStyle.frameStyle as any} />
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
  {#key fr}
    {#if $messageStyle.contentsStyle[fr] == null}
      <div>noen</div>
    {:else}
      {@const definition = MessageContentStyleDefinitionSet[MessageContentToStyleType[fr]]}
      <StyleSetting {definition} bind:style={$messageStyle.contentsStyle[fr] as any} />
    {/if}
  {/key}
</SettingArea>
