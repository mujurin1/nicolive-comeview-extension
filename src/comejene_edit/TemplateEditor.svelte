<script lang="ts">
  import App from "../comejene/App.svelte";
  import {
    comejeneEnvs,
    MotionDefinitions,
    type ComejeneSender,
    type MotionDefinition,
    type MotionNames,
  } from "../comejene_share";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { TemplateNames, Templates, type Template, type TemplateName } from "./Template/Templates";
  import EditorProps from "./components/EditorProps.svelte";
  import LocalPreview from "./components/LocalPreview.svelte";
  import SettingArea from "./components/SettingArea.svelte";
  import SettingColumn from "./components/SettingColumn.svelte";
  import { getDummyComment } from "./utils";

  let previewIsLocal = $state(true);
  let localPreview = $state<ReturnType<typeof LocalPreview>>();

  let templateName = notifierStore<TemplateName>("stackA", () => {
    sendMessage_Reset();
    template = Templates[$templateName]();
  });

  let template = $state<Template>(Templates[$templateName]());

  function resetMotionSetting() {
    localPreview?.setMotionSetting(template.motion.setting);
    sendMessage_MotionSetting();
  }
  function resetMessageStyle() {
    localPreview?.setMessageStyle(template.style);
    sendMessage_MessageStyle();
  }

  //
  //
  //

  function dbg_add(icon = "", name = "name", message = getDummyComment()) {
    const contents = { icon, name, message };
    localPreview?.addContents(contents);

    for (const sender of senders) {
      sender.send({
        type: "content",
        contents,
      });
    }
  }

  let senders: ComejeneSender[] = [];

  void resetSender();

  async function resetSender() {
    senders = await Promise.all([
      // comejeneEnvs.obs.createSender({ wsUrl: `ws://localhost:${4455}` }),
      comejeneEnvs.browserEx.createSender(),
    ]);
  }

  function sendMessage_Reset() {
    for (const sender of senders) {
      sender.send({
        type: "comejene-reset",
        motionName: template.motion.name,
        motionSetting: template.motion.setting,
        messageStyle: template.style,
      });
    }
  }

  function sendMessage_MotionSetting() {
    for (const sender of senders) {
      sender.send({
        type: "change-motion-setting",
        motionSetting: template.motion.setting,
      });
    }
  }
  function sendMessage_MessageStyle() {
    for (const sender of senders) {
      sender.send({
        type: "change-message-style",
        messageStyle: template.style,
      });
    }
  }

  let motionDefinition = $derived<MotionDefinition<MotionNames>>(
    MotionDefinitions[template.motion.name],
  );
</script>

<div class="editor-container">
  <div class="setting-container">
    <button onclick={sendMessage_Reset} type="button">初期化</button>
    <input type="checkbox" bind:checked={previewIsLocal} />

    <SettingArea title="テンプレート">
      <SettingColumn name="タイプ">
        <select id="タイプ" bind:value={$templateName}>
          {#each TemplateNames as value (value)}
            <option {value}>{value}</option>
          {/each}
        </select>
      </SettingColumn>

      <SettingColumn name="モーション" noLabelFor>
        <div>{motionDefinition.name}</div>
      </SettingColumn>
    </SettingArea>

    {#key template}
      <EditorProps {resetMessageStyle} {resetMotionSetting} bind:template />
    {/key}

    <SettingArea title="コメントテスト">
      <button onclick={() => dbg_add()} type="button">コメントテスト</button>
    </SettingArea>
  </div>

  <div class="preview">
    {#if previewIsLocal}
      {#key template}
        <LocalPreview
          bind:this={localPreview}
          messageStyle={template.style}
          motionName={template.motion.name}
          motionSetting={template.motion.setting}
        />
      {/key}
    {:else}
      <App />
    {/if}
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
