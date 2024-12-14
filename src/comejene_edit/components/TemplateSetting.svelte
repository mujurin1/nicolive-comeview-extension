<script lang="ts">
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import { type ComejeneTemplate } from "../Template/ComejeneTemplate";
  import TemplateSetting_ from "./TemplateSetting_.svelte";

  let {
    template = $bindable(),
    resetMotionSetting,
    resetComejeneStyle: resetComejeneStyle,
  }: {
    template: ComejeneTemplate;
    resetMotionSetting: () => void;
    resetComejeneStyle: () => void;
  } = $props();

  let editTemplate = notifierStore(template, () => {
    template = editTemplate.state;
  });

  let motionSetting = notifierStore($editTemplate.motion.setting, () => {
    editTemplate.state.motion.setting = motionSetting.state;
    resetMotionSetting();
  });
  let comejeneStyle = notifierStore($editTemplate.style, () => {
    editTemplate.state.style = comejeneStyle.state;
    resetComejeneStyle();
  });
</script>

<TemplateSetting_
  motionName={$editTemplate.motion.name}
  bind:motionSetting={$motionSetting}
  bind:comejeneStyle={$comejeneStyle}
/>
