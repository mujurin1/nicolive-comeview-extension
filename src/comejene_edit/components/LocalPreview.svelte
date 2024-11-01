<script lang="ts">
  import ComejeneView from "../../comejene/ComejeneView.svelte";
  import { ComejeneViewState } from "../../comejene/ComejeneViewState.svelte";
  import type {
    MessageStyle,
    MotionNames,
    MotionSetting,
    ReceiveContents,
  } from "../../comejene_share";

  let {
    motionName,
    motionSetting,
    messageStyle,
  }: {
    motionName: MotionNames;
    motionSetting: MotionSetting;
    messageStyle: MessageStyle;
  } = $props();

  let comejeneState = $state(createState());

  export function setMotionSetting(setting: MotionSetting): void {
    comejeneState.setMotionSetting(setting);
  }
  export function setMessageStyle(style: MessageStyle): void {
    comejeneState.setMessageStyle(style);
  }
  export function addContents(contents: ReceiveContents): void {
    comejeneState.addContents(contents);
  }

  function createState() {
    return new ComejeneViewState(motionName, motionSetting, messageStyle);
  }
</script>

<ComejeneView {comejeneState} />
