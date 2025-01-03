<script lang="ts">
  import { sleep } from "@mujurin/nicolive-api-ts";
  import App from "../comejene/App.svelte";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import MyzView from "../lib/Myz/MyzView.svelte";
  import MyzViewArea from "../lib/Myz/MyzViewArea.svelte";
  import { ComejeneSenderController } from "../service/ComejeneSenderController.svelte";
  import SimpleList from "./components/SimpleList.svelte";
  import TemplateSetting from "./components/TemplateSetting.svelte";
  import {
    ComejeneTemplates,
    type ComejeneTemplate,
    type TemplateName,
  } from "./Template/ComejeneTemplate";
  import { getDummyContent } from "./utils";

  let templateNames = $state(Object.keys(ComejeneTemplates) as TemplateName[]);
  let selectTemplateId = notifierStore<TemplateName>("縦並び", () => {
    editTemplate = ComejeneTemplates[$selectTemplateId]();
    ComejeneSenderController.sendReset();
    sleep(100).then(() => {
      for (let i = 0; i < 5; i++) dbg_send_content();
    });
  });

  let editTemplate = $state<ComejeneTemplate>(ComejeneTemplates[$selectTemplateId]());
  let editing = $state(false);

  ComejeneSenderController._set(() => editTemplate);
  Promise.all([
    ComejeneSenderController.createAndConnect("obs", { url: `ws://localhost:${4455}` }),
    ComejeneSenderController.createAndConnect("browserEx"),
  ]).then(() => {
    ComejeneSenderController.connect();
  });

  function senderReset() {
    ComejeneSenderController.sendReset();
  }

  function dbg_send_content(
    icon = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg",
    name = undefined,
    message = getDummyContent(),
  ) {
    const content = { icon, name, message };
    ComejeneSenderController.sendContent(content);
  }

  function edit() {
    editing = true;
  }

  function clone() {
    // TODO:
  }

  function save() {
    // TODO:
  }

  function disposeEditing() {
    editing = false;
  }
</script>

<div class="comejene-edit">
  <div class="setting-container">
    <button onclick={senderReset} type="button">初期化</button>

    {#if editing}
      <MyzViewArea title="テンプレート">
        <MyzView object={{ display: "名前" }}>
          <input type="text" bind:value={editTemplate.name} />
        </MyzView>
        <MyzView object={{ display: "モーション" }}>
          <div>{editTemplate.motion.name}</div>
        </MyzView>
      </MyzViewArea>

      <div class="buttons">
        <button onclick={save} type="button">保存</button>
        <button onclick={disposeEditing} type="button">内容を破棄して戻る</button>
      </div>

      <MyzViewArea title="コメントテスト">
        <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
      </MyzViewArea>

      <TemplateSetting bind:template={editTemplate} />
    {:else}
      <MyzViewArea title="テンプレート">
        <MyzView object={{ display: "テンプレート一覧" }}>
          <SimpleList size={1} bind:items={templateNames} bind:value={$selectTemplateId} />
        </MyzView>

        <MyzView object={{ display: "モーション" }}>
          <div>{editTemplate.motion.name}</div>
        </MyzView>
      </MyzViewArea>

      <div class="buttons">
        <button onclick={clone} type="button">複製</button>
        <button onclick={edit} type="button">編集</button>
      </div>

      <MyzViewArea title="コメントテスト">
        <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
      </MyzViewArea>
    {/if}
  </div>

  <div class="preview-container">
    <App />
  </div>
</div>

<style>
  .comejene-edit {
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

    /* & > div {
      width: 100%;
    } */
  }

  .preview-container {
    flex: 1 1 0;
    /* MEMO: Flex Box の最小幅は自身のコンテンツなのでこれより小さくするための指定 */
    min-width: 0;
    background-color: #b5ffe5;
  }

  .buttons {
    display: flex;
    gap: 6px;

    button {
      background-color: #e3c9ff;
      padding: 5px 10px;
      border: none;
      border-radius: 4px;

      &:hover {
        filter: contrast(110%);
      }
    }
  }
</style>
