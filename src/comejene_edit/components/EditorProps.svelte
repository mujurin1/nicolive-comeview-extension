<script lang="ts">
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import { type Template } from "../Template/Templates";
  import Setting from "./Setting.svelte";

  let {
    template = $bindable(),
    resetMotionSetting,
    resetMessageStyle,
  }: {
    template: Template;
    resetMotionSetting: () => void;
    resetMessageStyle: () => void;
  } = $props();

  let editTemplate = notifierStore(template, () => {
    template = editTemplate.state;
  });

  let motionSetting = notifierStore($editTemplate.motion.setting, () => {
    editTemplate.state.motion.setting = motionSetting.state;
    resetMotionSetting();
  });
  let messageStyle = notifierStore($editTemplate.style, () => {
    editTemplate.state.style = messageStyle.state;
    resetMessageStyle();
  });
</script>

<Setting
  motionName={$editTemplate.motion.name}
  bind:motionSetting={$motionSetting}
  bind:messageStyle={$messageStyle}
/>
