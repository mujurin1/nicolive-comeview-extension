<script lang="ts">
  import { sleep } from "@mujurin/nicolive-api-ts";
  import { onMount, untrack } from "svelte";
  import App from "../comejene/App.svelte";
  import { notifierStore } from "../lib/CustomStore.svelte";
  import MyzView from "../lib/Myz/MyzView.svelte";
  import MyzViewArea from "../lib/Myz/MyzViewArea.svelte";
  import { storageInit } from "../lib/Storage";
  import { ComejeneSenderController } from "../service/ComejeneSenderController.svelte";
  import { ComejeneStore } from "../store/ComejeneStore.svelte";
  import TemplateSetting from "./components/TemplateSetting.svelte";
  import {
    ComejeneTemplateFirstId,
    ComejeneTemplates,
    type ComejeneTemplate,
  } from "./Template/ComejeneTemplate";
  import { getDummyContent, getNavigatorLock } from "./utils";

  storageInit();

  let storageTemplates = $derived(ComejeneStore.state.templates);
  let storageTemplateIds = $derived(Object.keys(storageTemplates));
  // svelte-ignore state_referenced_locally
  let selectTemplateId = notifierStore<string>(
    Object.keys(storageTemplates)[0],
    () => {
      resetEditTemplate();
    },
    () => {
      let newId: string = untrack(() => $selectTemplateId);
      if (storageTemplates[newId] == null) {
        newId = Object.keys(storageTemplates)[0];
      }
      untrack(() => {
        if (!editing) resetEditTemplate();
      });
      return newId;
    },
  );
  let selectTemplate = $derived(storageTemplates[$selectTemplateId]);
  let selectTemplateIsDefault = $derived($selectTemplateId.startsWith(ComejeneTemplateFirstId));

  //#region editState
  type EditState = EditState_None | EditState_Edit;
  interface EditState_None {
    readonly state: "none";
    /** 編集を始めようとしたが、他のウィンドウで編集中だった */
    collision: boolean;
    readonly template?: never;
  }
  interface EditState_Edit {
    readonly state: "editing";
    readonly template: ComejeneTemplate;
    readonly lockRelease: () => void;
    /** 最後に編集してから保存したか */
    edited: boolean;
  }
  let editState = $state<EditState>({ state: "none", collision: false });
  let editing = $derived(editState.state === "editing");
  //#endregion editState

  //#region initialize
  onMount(() => {
    return () => {
      if (editState.state === "editing") editState.lockRelease();
    };
  });

  ComejeneSenderController._set(() => editState.template ?? selectTemplate);
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
    name = undefined,
    message = getDummyContent(),
  ) {
    const content = { icon, name, message };
    ComejeneSenderController.sendContent(content);
  }

  async function edit() {
    if (editState.state === "editing") return;

    // 同じテンプレートの編集は同時に1ウィンドウのみ
    const lockRelease = await getNavigatorLock(`comejene_edit_${$selectTemplateId}`);
    if (lockRelease == null) {
      // 他のウィンドウで編集中だった
      editState.collision = true;
      return;
    }

    editState = {
      state: "editing",
      lockRelease,
      template: structuredClone($state.snapshot(selectTemplate)),
      edited: false,
    };
  }

  function clone() {
    const id = crypto.randomUUID();
    storageTemplates[id] = structuredClone($state.snapshot(selectTemplate));
    storageTemplates[id].name = `${storageTemplates[id].name} - コピー`;
    selectTemplateId.set(id);
    ComejeneStore.save();
  }

  function remove() {
    if (selectTemplateIsDefault) {
      const id = $selectTemplateId as keyof typeof ComejeneTemplates;
      storageTemplates[id] = structuredClone(ComejeneTemplates[id]);
    } else {
      delete storageTemplates[$selectTemplateId];
      selectTemplateId.set(Object.keys(storageTemplates)[0]);
    }
    ComejeneStore.save();
  }

  function save() {
    if (editState.state !== "editing") return;
    storageTemplates[$selectTemplateId] = editState.template;
    editState.edited = false;
    ComejeneStore.save();
  }

  let sleepAbortController: AbortController | undefined;
  function resetEditTemplate() {
    ComejeneSenderController.sendReset();
    sleepAbortController?.abort();
    sleepAbortController = new AbortController();
    sleep(100, sleepAbortController.signal).then(() => {
      for (let i = 0; i < 5; i++) dbg_send_content();
    });
  }

  function closeEditing() {
    if (editState.state !== "editing") return;
    if (!editState.edited) {
      // TODO: 変更を保存していない場合に通知する
    }
    editState.lockRelease();
    editState = { state: "none", collision: false };
  }
  //#endregion functions
</script>

<div class="comejene-edit">
  <div class="setting-container">
    <button onclick={senderReset} type="button">初期化</button>

    {#if editState.state === "editing"}
      <!-- テンプレート編集 -->
      <MyzViewArea title="テンプレート">
        <MyzView object={{ display: "名前" }}>
          <input
            disabled={selectTemplateIsDefault}
            title={selectTemplateIsDefault
              ? "最初から存在するテンプレートは名前を変えられません"
              : ""}
            type="text"
            bind:value={editState.template.name}
          />
        </MyzView>
        <MyzView object={{ display: "モーション" }}>
          <div>{editState.template.motion.name}</div>
        </MyzView>
      </MyzViewArea>

      <div class="buttons">
        <button onclick={save} type="button">保存</button>
        <button onclick={closeEditing} type="button">編集を終了する</button>
      </div>

      <MyzViewArea title="コメントテスト">
        <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
      </MyzViewArea>

      <TemplateSetting bind:template={editState.template} bind:edited={editState.edited} />
    {:else}
      <!-- テンプレート一覧表示 -->
      <MyzViewArea title="テンプレート">
        <MyzView object={{ display: "テンプレート一覧" }}>
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
          class="delete"
          onclick={remove}
          title="最初から存在するテンプレートは削除出来ません"
          type="button"
        >
          {selectTemplateIsDefault ? "初期化" : "削除"}
        </button>
        <button onclick={clone} type="button">複製</button>
        <button onclick={edit} type="button">編集</button>
      </div>

      {#if editState.collision}
        <div class="warn">
          <div>※このテンプレートは他のウィンドウで編集中です</div>
          <div>※編集しているウィンドウで「編集を終了する」を押して下さい</div>
        </div>
      {/if}

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

    .delete {
      background-color: #ffbaba;
      margin-right: 20px;
    }
  }

  .warn {
    color: red;
    font-size: 1em;
  }
</style>
