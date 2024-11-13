<script lang="ts">
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import { type Template } from "../Template/Templates";
  import TemplateSetting_ from "./TemplateSetting_.svelte";

  let {
    template = $bindable(),
    resetMotionSetting,
    resetMessageContent: resetMessageContent,
  }: {
    template: Template;
    resetMotionSetting: () => void;
    resetMessageContent: () => void;
  } = $props();

  let editTemplate = notifierStore(template, () => {
    template = editTemplate.state;
  });

  let motionSetting = notifierStore($editTemplate.motion.setting, () => {
    editTemplate.state.motion.setting = motionSetting.state;
    resetMotionSetting();
  });
  let messageContent = notifierStore($editTemplate.style, () => {
    editTemplate.state.style = messageContent.state;
    resetMessageContent();
  });
</script>

<TemplateSetting_
  motionName={$editTemplate.motion.name}
  bind:motionSetting={$motionSetting}
  bind:messageContent={$messageContent}
/>
