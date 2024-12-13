<script lang="ts">
  import App from "../comejene/App.svelte";
  import {
    comejeneEnvs,
    MotionDefinitions,
    type MotionDefinition,
    type MotionNames,
  } from "../comejene_share";

  import { ComejeneSenderController } from "../comejene_share/ViewEnvironment";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import MyzView from "../lib/Myz/MyzView.svelte";
  import MyzViewArea from "../lib/Myz/MyzViewArea.svelte";
  import {
    ComejeneTemplates,
    TemplateNames,
    type ComejeneTemplate,
    type TemplateName,
  } from "./Template/ComejeneTemplate";
  import TemplateSetting from "./components/TemplateSetting.svelte";
  import { getDummyComment } from "./utils";

  let templateName = notifierStore<TemplateName>("縦並び", () => {
    template = ComejeneTemplates[$templateName]();
    senderReset();
  });

  let template = $state<ComejeneTemplate>(ComejeneTemplates[$templateName]());

  let motionDefinition = $derived<MotionDefinition<MotionNames>>(
    MotionDefinitions[template.motion.name],
  );

  let senders = new ComejeneSenderController(() => template);
  void senders.initialize([
    [comejeneEnvs.obs.createSender("OBS"), { wsUrl: `ws://localhost:${4455}` }],
    [comejeneEnvs.browserEx.createSender("browser")],
  ]);

  function senderReset() {
    senders.sendReset();
  }
  function resetMotionSetting() {
    senders.sendMotionSetting();
  }
  function resetMessageContent() {
    senders.sendMessageContent();
  }

  function dbg_add(icon = "", name = "あname", message = getDummyComment()) {
    const contents = { icon, name, message };
    senders.sendComment(contents);
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
      <button onclick={() => dbg_add()} type="button">コメントテスト</button>
    </MyzViewArea>

    {#key template}
      <TemplateSetting {resetMessageContent} {resetMotionSetting} bind:template />
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
