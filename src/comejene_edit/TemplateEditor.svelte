<script lang="ts">
  import App from "../comejene/App.svelte";
  import {
    comejeneEnvs,
    MotionDefinitions,
    type MotionDefinition,
    type MotionNames,
  } from "../comejene_share";
  import { ComejeneSender_Dbg } from "../comejene_share/ViewEnvironment/temp";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { TemplateNames, Templates, type Template, type TemplateName } from "./Template/Templates";
  import EditorProps from "./components/EditorProps.svelte";
  import SettingArea from "./components/SettingArea.svelte";
  import SettingColumn from "./components/SettingColumn.svelte";
  import { getDummyComment } from "./utils";

  let templateName = notifierStore<TemplateName>("縦並び", () => {
    template = Templates[$templateName]();
    senderReset();
  });

  let template = $state<Template>(Templates[$templateName]());

  let motionDefinition = $derived<MotionDefinition<MotionNames>>(
    MotionDefinitions[template.motion.name],
  );

  let senders = new ComejeneSender_Dbg();
  void senders
    .initialize(
      // comejeneEnvs.obs.createSender({ wsUrl: `ws://localhost:${4455}` }),
      comejeneEnvs.browserEx.createSender(),
    )
    .then(senderReset);

  function senderReset() {
    senders.sendReset(template.motion.name, template.motion.setting, template.style);
  }
  function resetMotionSetting() {
    senders.sendMotionSetting(template.motion.setting);
  }
  function resetMessageStyle() {
    senders.sendMessageStyle(template.style);
  }

  function dbg_add(icon = "", name = "name", message = getDummyComment()) {
    const contents = { icon, name, message };
    senders.sendComment(contents);
  }
</script>

<div class="editor-container">
  <div class="setting-container">
    <button onclick={senderReset} type="button">初期化</button>

    <SettingArea title="テンプレート">
      <SettingColumn forId="タイプ" meta={{ display: "タイプ" }}>
        <select id="タイプ" bind:value={$templateName}>
          {#each TemplateNames as value (value)}
            <option {value}>{value}</option>
          {/each}
        </select>
      </SettingColumn>

      <SettingColumn meta={{ display: "モーション" }}>
        <div>{motionDefinition.name}</div>
      </SettingColumn>
    </SettingArea>

    <SettingArea title="コメントテスト">
      <button onclick={() => dbg_add()} type="button">コメントテスト</button>
    </SettingArea>

    {#key template}
      <EditorProps {resetMessageStyle} {resetMotionSetting} bind:template />
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
