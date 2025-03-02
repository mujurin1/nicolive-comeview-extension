<script lang="ts">
  import { onMount, untrack } from "svelte";
  import App from "../comejene/App.svelte";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import MyzView from "../lib/Myz/MyzView.svelte";
  import MyzViewArea from "../lib/Myz/MyzViewArea.svelte";
  import { ComejeneSenderController } from "../service/ComejeneSenderController.svelte";
  import { ComejeneStore } from "../store/ComejeneStore.svelte";
  import TemplateSetting from "./components/TemplateSetting.svelte";
  import {
    ComejeneTemplateFirstId,
    ComejeneTemplates,
    type ComejeneTemplate,
  } from "./Template/ComejeneTemplate";
  import { getDummyContent, getNavigatorLock } from "./utils";

  let storageTemplates = $derived(ComejeneStore.state.templates);
  let storageTemplateIds = $derived(Object.keys(storageTemplates));
  let selectTemplateId = notifierStore<string>(
    ComejeneStore.state.useTemplateId,
    () => {
      selectTemplate = storageTemplates[$selectTemplateId];
      resetEditTemplate();
      ComejeneStore.state.useTemplateId = $selectTemplateId;
      ComejeneStore.save();
    },
    () => {
      let newId: string = untrack(() => $selectTemplateId);
      if (storageTemplates[newId] == null) {
        newId = Object.keys(storageTemplates)[0];
      }
      untrack(() => {
        selectTemplate = storageTemplates[newId];
        resetEditTemplate();
      });
      return newId;
    },
  );
  // svelte-ignore state_referenced_locally
  let selectTemplate = $state(storageTemplates[$selectTemplateId]);
  let selectTemplateIsDefault = $derived($selectTemplateId.startsWith(ComejeneTemplateFirstId));

  //#region initialize
  onMount(() => {
    return () => {
      lockRelease?.();
    };
  });

  // TODO: コメジェネに送信するスタイルの取得関数について
  ComejeneSenderController._set(() => selectTemplate);
  Promise.all([
    ComejeneSenderController.createAndConnect("obs", { url: `ws://localhost:${4455}` }),
    ComejeneSenderController.createAndConnect("browserEx"),
  ]).then(() => {
    ComejeneSenderController.connect();
  });
  //#endregion initialize

  //#region functions
  function senderReset() {
    ComejeneSenderController.sendReset();
  }

  function dbg_send_content(
    icon = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg",
    name = "なまえ",
    message = getDummyContent(),
  ) {
    const content = { icon, name, message };
    ComejeneSenderController.sendContent(content);
  }

  let lockRelease = $state<() => void>();
  let isEditing = $derived(lockRelease != null);
  let otherWindowEditing = $state(false);

  async function startEdit() {
    if (lockRelease != null) return;

    // 同じテンプレートの編集は同時に1ウィンドウのみ
    lockRelease = await getNavigatorLock(`comejene_edit_${$selectTemplateId}`);
    if (lockRelease == null) {
      // 他のウィンドウで編集中だった
      otherWindowEditing = true;
      return;
    }
  }

  function clone() {
    const id = crypto.randomUUID();
    storageTemplates[id] = structuredClone($state.snapshot(selectTemplate));
    storageTemplates[id].name = `${storageTemplates[id].name} - コピー`;
    selectTemplateId.set(id);
    ComejeneStore.save();
  }

  function deleteOrReset() {
    if (selectTemplateIsDefault) {
      const id = $selectTemplateId as keyof typeof ComejeneTemplates;
      storageTemplates[id] = structuredClone(ComejeneTemplates[id]);
    } else {
      delete storageTemplates[$selectTemplateId];
      selectTemplateId.set(Object.keys(storageTemplates)[0]);
    }
    ComejeneStore.save();
  }

  function save(template: ComejeneTemplate) {
    storageTemplates[$selectTemplateId] = structuredClone(template);
    ComejeneStore.save();
  }

  function closeEditing() {
    lockRelease?.();
    lockRelease = undefined;
    ComejeneSenderController._set(() => selectTemplate);
    ComejeneSenderController.sendMotionSetting();
    ComejeneSenderController.sendComejeneStyle();
  }

  let sendCommentsTimeout: number | undefined;
  function resetEditTemplate() {
    ComejeneSenderController.sendReset();

    if (sendCommentsTimeout == null) {
      sendCommentsTimeout = setTimeout(() => {
        for (let i = 0; i < 5; i++) dbg_send_content();
        sendCommentsTimeout = undefined;
      }, 100);
    }
  }

  //#endregion functions
</script>

<div class="comejene-edit">
  <div class="setting-container">
    <button onclick={senderReset} type="button">初期化</button>

    {#if isEditing}
      <!-- 編集するたびにコンポーネントを再生成するため -->
      {#key isEditing}
        <TemplateSetting
          {closeEditing}
          {commentTest}
          {save}
          {selectTemplate}
          templateIsDefault={selectTemplateIsDefault}
        />
      {/key}
    {:else}
      <!-- テンプレート一覧表示 -->
      <MyzViewArea title="テンプレート一覧">
        <MyzView object={{ display: "名前" }}>
          <select class="simple-list" bind:value={$selectTemplateId}>
            {#each storageTemplateIds as id (id)}
              {@const name = storageTemplates[id].name}
              <option class="item" value={id}>{name}</option>
            {/each}
          </select>
        </MyzView>

        <MyzView object={{ display: "モーション" }}>
          <div>{selectTemplate.motion.name}</div>
        </MyzView>
      </MyzViewArea>

      <div class="buttons">
        <button
          class="warn"
          onclick={deleteOrReset}
          title="最初から存在するテンプレートは削除出来ません"
          type="button"
        >
          {selectTemplateIsDefault ? "初期化" : "削除"}
        </button>
        <button class="sub" onclick={clone} type="button">複製</button>
        <button onclick={startEdit} type="button">編集</button>
      </div>

      {#if otherWindowEditing}
        <div class="error">
          <div>※このテンプレートは他のウィンドウで編集中です</div>
          <div>※編集中のウィンドウで編集を終了して下さい</div>
        </div>
      {/if}

      {@render commentTest()}
    {/if}
  </div>

  <div class="preview-container">
    <App />
  </div>
</div>

{#snippet commentTest()}
  <MyzViewArea title="コメントテスト">
    <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
  </MyzViewArea>
{/snippet}

<style>
  :global(*) {
    font-size: 16px;
  }
  :global(button) {
    font-size: 0.9em;
  }

  .comejene-edit {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .setting-container {
    flex: 0 0 auto;
    flex: 0 0 300px;
    box-sizing: border-box;
    background-color: #d4f6ff;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 5px;
    padding-bottom: 100vh;
    overflow-y: auto;
  }

  .preview-container {
    flex: 1 1 0;
    /* MEMO: Flex Box の最小幅は自身のコンテンツなのでこれより小さくするための指定 */
    min-width: 0;
    background-color: #b5ffe5;
  }
</style>
