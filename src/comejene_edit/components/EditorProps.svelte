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

  let editTemplate = notifierStore(
    template,
    () => {
      template = editTemplate.state;
    },
    // () => template
  );

  let motionSetting = notifierStore(
    $editTemplate.motion.setting,
    resetMotionSetting,
    () => $editTemplate.motion.setting,
  );
  let messageStyle = notifierStore(
    $editTemplate.style,
    resetMessageStyle,
    () => $editTemplate.style,
  );
</script>

<!-- eslint-disable-next-line svelte/sort-attributes -->
<Setting
  motionName={$editTemplate.motion.name}
  bind:motionSetting={$motionSetting}
  bind:messageStyle={$messageStyle}
/>
