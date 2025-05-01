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

<div class="comejene-edit">
  <div class="main-container">
    <div class="head-area"><HeadArea /></div>
    <div class="setting-area"><SettingArea /></div>
  </div>

  <div class="preview-area"><App /></div>
</div>

<style>
  .comejene-edit {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    flex: 0 0 50%;
    box-sizing: border-box;

    .head-area {
      flex: 0 0 min-content;
      background-color: hsl(51, 100%, 93%);
    }

    .setting-area {
      flex: 1 1 0;
      background-color: hsl(193, 100%, 92%);
      /* display: flex;
      flex-direction: column;
      row-gap: 10px;
      padding: 5px;
      overflow-y: auto; */
    }
  }

  .preview-area {
    flex: 1 1 0;
    /* MEMO: Flex Box の最小幅は自身のコンテンツなのでこれより小さくするための指定 */
    min-width: 0;
    background-color: hsl(159, 100%, 85%);
  }
</style>
