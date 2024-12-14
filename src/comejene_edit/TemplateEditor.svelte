<script lang="ts">
  import App from "../comejene/App.svelte";
  import {
    ComejeneMotionDefinitions,
    type ComejeneMotionDefinition,
    type ComejeneMotionNames,
  } from "../comejene_share";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import MyzView from "../lib/Myz/MyzView.svelte";
  import MyzViewArea from "../lib/Myz/MyzViewArea.svelte";
  import { ComejeneSenderController } from "../service/ComejeneSenderController.svelte";
  import {
    ComejeneTemplates,
    TemplateNames,
    type ComejeneTemplate,
    type TemplateName,
  } from "./Template/ComejeneTemplate";
  import TemplateSetting from "./components/TemplateSetting.svelte";
  import { getDummyContent } from "./utils";

  let templateName = notifierStore<TemplateName>("縦並び", () => {
    template = ComejeneTemplates[$templateName]();
    senderReset();
  });

  let template = $state<ComejeneTemplate>(ComejeneTemplates[$templateName]());

  let motionDefinition = $derived<ComejeneMotionDefinition<ComejeneMotionNames>>(
    ComejeneMotionDefinitions[template.motion.name],
  );

  ComejeneSenderController._set(() => template);
  Promise.all([
    ComejeneSenderController.createAndConnect("obs", { url: `ws://localhost:${4455}` }),
    ComejeneSenderController.createAndConnect("browserEx"),
  ]).then(() => {
    ComejeneSenderController.connect();
  });

  function senderReset() {
    ComejeneSenderController.sendReset();
  }
  function resetMotionSetting() {
    ComejeneSenderController.sendMotionSetting();
  }
  function resetComejeneStyle() {
    ComejeneSenderController.sendComejeneStyle();
  }

  function dbg_send_content(icon = "", name = "あname", message = getDummyContent()) {
    const content = { icon, name, message };
    ComejeneSenderController.sendContent(content);
  }
</script>

<div class="editor-container">
  <div class="setting-container">
    <button onclick={senderReset} type="button">初期化</button>

    <MyzViewArea title="テンプレート">
      <MyzView forId="使用テンプレート" object={{ display: "使用テンプレート" }}>
        <select id="使用テンプレート" bind:value={$templateName}>
          {#each TemplateNames as value (value)}
            <option {value}>{value}</option>
          {/each}
        </select>
      </MyzView>

      <MyzView object={{ display: "モーション" }}>
        <div>{motionDefinition.name}</div>
      </MyzView>
    </MyzViewArea>

    <MyzViewArea title="コメントテスト">
      <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
    </MyzViewArea>

    {#key template}
      <TemplateSetting {resetComejeneStyle} {resetMotionSetting} bind:template />
    {/key}
  </div>

  <div class="preview">
    <App />
  </div>
</div>

<style>
  .editor-container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .setting-container {
    flex: 0 0 250px;
    box-sizing: border-box;
    background-color: #d4f6ff;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    padding: 5px;
    overflow-y: auto;

    & > div {
      width: 100%;
    }
  }

  .preview {
    flex: 1 1 0;
    /* MEMO: Flex Box の最小幅は自身のコンテンツなのでこれより小さくするための指定 */
    min-width: 0;
    background-color: #b5ffe5;
  }
</style>
