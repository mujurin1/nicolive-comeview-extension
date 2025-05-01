<script lang="ts">
  import { onMount } from "svelte";
  import App from "../../comejene/App.svelte";
  import HeadArea from "./HeadArea.svelte";
  import SettingArea from "./SettingArea.svelte";
  import { ComejeneSenderStore } from "../../store/ComejeneSenderStore.svelte";

  onMount(() => {
    ComejeneSenderStore.sendReset();
    ComejeneSenderStore.sendDummyContent();
    ComejeneSenderStore.sendDummyContent();
    ComejeneSenderStore.sendDummyContent();
  });
</script>

<div class="main">
  <div class="main-container">
    <div class="head-area"><HeadArea /></div>
    <div class="setting-area"><SettingArea /></div>
  </div>

  <div class="preview-area"><App /></div>
</div>

<style>
  .main {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .main-container {
    flex: 0 0 50%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .head-area {
      flex: 0 0 min-content;
      background-color: hsl(51, 100%, 93%);
    }

    .setting-area {
      flex: 1;
      min-height: 0;
      background-color: hsl(193, 100%, 92%);
    }
  }

  .preview-area {
    flex: 1;
    /* MEMO: Flex Box の最小幅は自身のコンテンツなのでこれより小さくするための指定 */
    min-width: 0;
    background-color: hsl(159, 100%, 85%);
  }
</style>
