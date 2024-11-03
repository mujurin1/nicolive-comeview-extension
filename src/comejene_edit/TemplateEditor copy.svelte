<script lang="ts">
  import {
    MessageStyle,
    MotionDefinitions,
    type MotionDefinition,
    type MotionNames,
  } from "../comejene_share";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import {
    MessageContainerTemplateNames,
    MessageContainerTemplates,
  } from "./Template/MessageContainer_Templates";
  import { TemplateNames, type Template, type TemplateName } from "./Template/Templates";
  import Setting from "./components/Setting.svelte";
  import SettingArea from "./components/SettingArea.svelte";
  import SettingColumn from "./components/SettingColumn.svelte";

  let {
    templateName,
    template = $bindable(),
  }: {
    templateName: TemplateName;
    template: Template;
  } = $props();

  let editTemplate = notifierStore(
    template,
    () => {
      template = editTemplate.state;
    },
    // () => template
  );

  let motionDefinition = $derived<MotionDefinition<MotionNames>>(
    MotionDefinitions[template.motion.name],
  );

  let motionName = $derived($editTemplate.motion.name);
  let motionSetting = $derived($editTemplate.motion.setting);
  let messageStyle = $derived<MessageStyle>({
    containerLayout: MessageContainerTemplates[$editTemplate.containerTemplateName],
    contentsStyle: $editTemplate.style.contents,
    frameStyle: $editTemplate.style.frame,
  });

  // これを使わずに template = editTemplate されるようにする
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
</script>

<div class="editor-container">
  <SettingArea title="テンプレート">
    <SettingColumn name="タイプ">
      <select id="タイプ" bind:value={templateName}>
        {#each TemplateNames as value (value)}
          <option {value}>{value}</option>
        {/each}
      </select>
    </SettingColumn>

    <SettingColumn name="モーション" noLabelFor>
      <div>{motionDefinition.name}</div>
    </SettingColumn>

    <SettingColumn name="コンテナタイプ">
      <select id="コンテナタイプ" bind:value={$editTemplate.containerTemplateName}>
        {#each MessageContainerTemplateNames as key (key)}
          <option value={key}>{key}</option>
        {/each}
      </select>
    </SettingColumn>
  </SettingArea>

  <!-- eslint-disable-next-line svelte/sort-attributes -->
  <Setting {motionName} {motionSetting} {messageStyle} />
</div>

<style>
  .editor-container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .editor-container {
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
</style>
