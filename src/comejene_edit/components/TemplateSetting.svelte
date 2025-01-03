<script lang="ts">
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import { ComejeneSenderController } from "../../service/ComejeneSenderController.svelte";
  import { type ComejeneTemplate } from "../Template/ComejeneTemplate";
  import TemplateSetting_ from "./TemplateSetting_.svelte";

  let {
    template = $bindable(),
  }: {
    template: ComejeneTemplate;
  } = $props();

  let editTemplate = notifierStore(template, () => {
    template = editTemplate.state;
  });

  let motionSetting = notifierStore($editTemplate.motion.setting, () => {
    editTemplate.state.motion.setting = motionSetting.state;
    ComejeneSenderController.sendMotionSetting();
  });
  let comejeneStyle = notifierStore($editTemplate.style, () => {
    editTemplate.state.style = comejeneStyle.state;
    ComejeneSenderController.sendComejeneStyle();
  });
</script>

<TemplateSetting_
  motionName={$editTemplate.motion.name}
  bind:motionSetting={$motionSetting}
  bind:comejeneStyle={$comejeneStyle}
/>
