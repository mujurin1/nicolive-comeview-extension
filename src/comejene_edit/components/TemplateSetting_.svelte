<script lang="ts">
  import { MessageContent, MessageContentFrames, MessageContentStyleRootSet, MessageContentToStyleType, MessageFrameRoot, MotionDefinitions, type MessageContentFrame, type MotionDefinition, type MotionNames, type MotionSetting } from "../../comejene_share";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import MyzRootView from "../../lib/Myz/MyzRootView.svelte";
  import MyzViewArea from "../../lib/Myz/MyzViewArea.svelte";

  let {
    motionName,
    messageContent: _messageContent = $bindable(),
    motionSetting: _motionSetting = $bindable(),
  }: {
    motionName: MotionNames;
    messageContent: MessageContent;
    motionSetting: MotionSetting;
  } = $props();

  let messageContent = notifierStore(
    _messageContent,
    () => {
      _messageContent = messageContent.state;
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

<MyzViewArea title="モーション設定">
  <MyzRootView path="motion" root={motionDefinition.css.root} bind:style={$motionSetting} />
</MyzViewArea>

<MyzViewArea title="メッセージ枠">
  <MyzRootView path="message" root={MessageFrameRoot} bind:style={$messageContent.frameSate as any} />
</MyzViewArea>

<MyzViewArea title="コンテンツ">
  {#snippet headerItem()}
    <select bind:value={selectContent}>
      {#each MessageContentFrames as content (content)}
        <option value={content}>{content}</option>
      {/each}
    </select>
  {/snippet}

  {@const fr = selectContent}
  {#key fr}
    {#if $messageContent.contentsStyle[fr] == null}
      <div>noen</div>
    {:else}
      {@const root = MessageContentStyleRootSet[MessageContentToStyleType[fr]]}
      <MyzRootView path="content" {root} bind:style={$messageContent.contentsStyle[fr] as any} />
    {/if}
  {/key}
</MyzViewArea>
