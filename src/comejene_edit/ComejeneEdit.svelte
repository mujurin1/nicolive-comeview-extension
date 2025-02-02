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
        if (!editing) resetEditTemplate();
      });
      return newId;
    },
  );
  // svelte-ignore state_referenced_locally
  let selectTemplate = $state(storageTemplates[$selectTemplateId]);
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
    name = "なまえ",
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

  function save() {
    if (editState.state !== "editing" || !editState.edited) return;
    checkForceClose = false;
    storageTemplates[$selectTemplateId] = structuredClone($state.snapshot(editState.template));
    editState.edited = false;
    ComejeneStore.save();
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

  let checkForceClose = $state(false);
  function closeEditing() {
    if (editState.state !== "editing") return;

    const edited = editState.edited;
    // 保存していない変更がある場合、１度は通知する
    if (edited && !checkForceClose) {
      checkForceClose = true;
      return;
    }
    checkForceClose = false;
    editState.lockRelease();
    editState = { state: "none", collision: false };

    if (edited) {
      resetEditTemplate();
    }
  }
  //#endregion functions
</script>

<div class="comejene-edit">
  <div class="setting-container">
    <button onclick={senderReset} type="button">初期化</button>

    {#if editState.state === "editing"}
      <!-- テンプレート編集 -->
      <MyzViewArea title="編集中のテンプレート">
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

      {#if checkForceClose}
        <div class="error">保存していない変更があります！</div>

        <div class="buttons">
          <button class="warn" onclick={closeEditing} type="button">保存せずに戻る</button>
          <button onclick={save} type="button">保存する</button>
        </div>
      {:else}
        <div class="buttons">
          <button class="warn" onclick={closeEditing} type="button">戻る</button>
          <button onclick={save} type="button">保存する</button>
        </div>
      {/if}

      <MyzViewArea title="コメントテスト">
        <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
      </MyzViewArea>

      <TemplateSetting bind:template={editState.template} bind:edited={editState.edited} />
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
        <button onclick={edit} type="button">編集</button>
      </div>

      {#if editState.collision}
        <div class="error">
          <div>※このテンプレートは他のウィンドウで編集中です</div>
          <div>※編集中のウィンドウで編集を終了して下さい</div>
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
    gap: 10px;

    button {
      background-color: #d1c9ff;
      padding: 5px 10px;
      border: none;

      border-radius: 4px;

      &:hover {
        filter: contrast(110%);
      }
    }

    .warn {
      margin-right: 20px;
      background-color: #ffbaba;
    }

    .sub {
      background-color: #9effb0;
    }
  }

  .error {
    color: red;
    font-size: 1em;
    font-weight: bold;
  }
</style>
