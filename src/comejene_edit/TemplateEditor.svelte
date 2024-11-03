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
  import {
    MessageContainerTemplateNames,
    MessageContainerTemplates,
  } from "./Template/MessageContainer_Templates";
  import { TemplateNames, Templates, type Template, type TemplateName } from "./Template/Templates";
  import LocalPreview from "./components/LocalPreview.svelte";
  import Setting from "./components/Setting.svelte";
  import SettingArea from "./components/SettingArea.svelte";
  import SettingColumn from "./components/SettingColumn.svelte";
  import { getDummyComment } from "./utils";

  let previewIsLocal = $state(true);
  let localPreview = $state<ReturnType<typeof LocalPreview>>();
  let refreshKey = $state(0);

  let selectTemplate = notifierStore<TemplateName>("stackA", () => {
    template = Templates[selectTemplate.state]();
    refreshKey++;
    sendMessage_Reset();
  });

  let template = $state<Template>(Templates[selectTemplate.state]());
  let motionDefinition = $derived<MotionDefinition<MotionNames>>(
    MotionDefinitions[template.motion.name],
  );
  //svelte-ignore state_referenced_locally
  let containerTemplateName = notifierStore(
    template.containerTemplateName,
    () => {},
    () => template.containerTemplateName,
  );

  let motionName = $derived(template.motion.name);
  // let motionSetting = $derived(template.motion.setting);
  //svelte-ignore state_referenced_locally
  let motionSetting = notifierStore(
    template.motion.setting,
    () => {
      console.log("changed  motionSetting");
      localPreview?.setMotionSetting(motionSetting.state);
      sendMessage_MotionSetting();
    },
    () => template.motion.setting,
  );
  // let messageStyle = $derived<MessageStyle>({
  //   containerLayout: MessageContainerTemplates[containerTemplateName.state],
  //   contentsStyle: template.style.contents,
  //   frameStyle: template.style.frame,
  // });
  //svelte-ignore state_referenced_locally
  let messageStyle = notifierStore(
    {
      containerLayout: MessageContainerTemplates[containerTemplateName.state],
      contentsStyle: template.style.contents,
      frameStyle: template.style.frame,
    },
    () => {
      localPreview?.setMessageStyle(messageStyle.state);
      sendMessage_MessageStyle();
    },
    () => ({
      containerLayout: MessageContainerTemplates[containerTemplateName.state],
      contentsStyle: template.style.contents,
      frameStyle: template.style.frame,
    }),
  );

  // $effect(() => {
  //   // Effect を発生させるためのチェック
  //   JSON.stringify(motionSetting);
  //   untrack(() => {
  //     localPreview?.setMotionSetting(motionSetting);
  //     sendMessage_MotionSetting();
  //   });
  // });
  // $effect(() => {
  //   // Effect を発生させるためのチェック
  //   JSON.stringify(messageStyle);
  //   untrack(() => {
  //     localPreview?.setMessageStyle(messageStyle);
  //     sendMessage_MessageStyle();
  //   });
  // });

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
        motionName,
        motionSetting: motionSetting.state,
        messageStyle: messageStyle.state,
      });
    }
  }

  function sendMessage_MotionSetting() {
    for (const sender of senders) {
      sender.send({
        type: "change-motion-setting",
        motionSetting: motionSetting.state,
      });
    }
  }
  function sendMessage_MessageStyle() {
    for (const sender of senders) {
      sender.send({
        type: "change-message-style",
        messageStyle: messageStyle.state,
      });
    }
  }
</script>

<div class="editor-container">
  <div class="setting-container">
    <button onclick={sendMessage_Reset} type="button">初期化</button>
    <input type="checkbox" bind:checked={previewIsLocal} />

    <SettingArea title="テンプレート">
      <SettingColumn name="タイプ">
        <select id="タイプ" bind:value={$selectTemplate}>
          {#each TemplateNames as value (value)}
            <option {value}>{value}</option>
          {/each}
        </select>
      </SettingColumn>

      <SettingColumn name="モーション" noLabelFor>
        <div>{motionDefinition.name}</div>
      </SettingColumn>

      <SettingColumn name="コンテナタイプ">
        <select id="コンテナタイプ" bind:value={$containerTemplateName}>
          {#each MessageContainerTemplateNames as key (key)}
            <option value={key}>{key}</option>
          {/each}
        </select>
      </SettingColumn>
    </SettingArea>

    <SettingArea title="コメントテスト">
      <button onclick={() => dbg_add()} type="button">コメントテスト</button>
    </SettingArea>

    <!-- eslint-disable-next-line svelte/sort-attributes -->
    <Setting {motionName} bind:motionSetting={$motionSetting} bind:messageStyle={$messageStyle} />
  </div>

  <div class="preview">
    {#if previewIsLocal}
      {#key refreshKey}
        <!-- eslint-disable-next-line svelte/sort-attributes -->
        <LocalPreview
          bind:this={localPreview}
          {motionName}
          motionSetting={$motionSetting}
          messageStyle={$messageStyle}
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
