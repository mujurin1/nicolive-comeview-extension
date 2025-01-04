<script lang="ts">
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import { ComejeneSenderController } from "../../service/ComejeneSenderController.svelte";
  import type { ComejeneTemplate } from "../Template/ComejeneTemplate";
  import TemplateSetting_ from "./TemplateSetting_.svelte";

  let {
    template = $bindable(),
    edited = $bindable(),
  }: {
    template: ComejeneTemplate;
    /** このビューにより編集された時に`true`になる*/
    edited?: boolean;
  } = $props();

  // これは template のバインディングに Store(notifierStore) を使っていた場合に、
  // effect を発生させるために必要
  let editTemplate = notifierStore(template, () => {
    template = editTemplate.state;
  });

  let motionSetting = notifierStore($editTemplate.motion.setting, () => {
    editTemplate.state.motion.setting = motionSetting.state;
    ComejeneSenderController.sendMotionSetting();
    edited = true;
  });
  let comejeneStyle = notifierStore($editTemplate.style, () => {
    editTemplate.state.style = comejeneStyle.state;
    ComejeneSenderController.sendComejeneStyle();
    edited = true;
  });
</script>

<TemplateSetting_
  motionName={$editTemplate.motion.name}
  bind:motionSetting={$motionSetting}
  bind:comejeneStyle={$comejeneStyle}
/>
